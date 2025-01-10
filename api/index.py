import io
import os

import soundfile
from flask import Flask, request, send_file

from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import torch
from werkzeug.exceptions import BadRequest

dirname = os.path.dirname(__file__)
text_model_path = os.path.join(dirname, "huggingface/hub/models--microsoft--speecht5_tts/snapshots/30fcde30f19b87502b8435427b5f5068e401d5f6")
vocoder_model_path = os.path.join(dirname, "huggingface/hub/models--microsoft--speecht5_hifigan/snapshots/bb6f429406e86a9992357a972c0698b22043307d")
datasets_path = os.path.join(dirname, "huggingface/hub/datasets--Matthijs--cmu-arctic-xvectors/snapshots/36e87b347a6a70f0420445b02ec40c55556f9ed7/default")

processor = SpeechT5Processor.from_pretrained(text_model_path)
model = SpeechT5ForTextToSpeech.from_pretrained(text_model_path)
vocoder = SpeechT5HifiGan.from_pretrained(vocoder_model_path)
embeddings_dataset = load_dataset(path=datasets_path, split="validation")


def generate_speech_wav(text):
    inputs = processor(text=text, return_tensors="pt")

    # load xvector containing speaker's voice characteristics from a dataset

    speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)

    speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)

    return speech


app = Flask(__name__)

@app.route('/', methods=['GET'])
def speech_request():
    prompt = request.args.get("prompt")
    if prompt is None:
        raise BadRequest("Please provide a prompt")
    speech = generate_speech_wav(prompt)
    buffer = io.BytesIO()
    soundfile.write(buffer, speech.numpy(), format='WAV', samplerate=16000)
    buffer.seek(0)
    return send_file(buffer, mimetype='audio/wav', download_name='speech.wav', as_attachment=True)
