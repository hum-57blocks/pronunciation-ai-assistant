import io
import os

from flask import Flask, Response, request, send_file
from openai import OpenAI

app = Flask(__name__)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


def stream(messages):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        stream=True
    )
    for chunk in response:
        yield chunk.choices[0].delta.content or ""


@app.route('/completion', methods=['POST'])
def completion_api():
    messages = request.json
    return Response(stream(messages), mimetype='text/event-stream')


@app.route('/', methods=['GET'])
def speech_api():
    prompt = request.args.get('prompt')
    response = client.audio.speech.create(
        model="tts-1",
        input=prompt,
        voice="alloy"
    )

    return send_file(io.BytesIO(response.content), mimetype='audio/wav', download_name='speech.wav')


if __name__ == '__main__':
    app.run(debug=True)
