# Pronunciation AI Assistant

Working at 57Blocks, it is extremely important to improve oral and speaking skills. This is not just for work purposes; it also matters for personal development. We have many opportunities to read English papers, emails, or articles on a daily basis. Sometimes we forget how to pronounce certain English words or phrases. Now,  simply you just need to highlight the text with your mouse, and the sounds will automatically play.

## Demo

[![example-thumb.png](/docs/example-thumb.png)](/docs/example.mp4)

## How it Works

### Running AI Service

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Run Flask application

```bash
python api/index.py
```

Your AI service is now available at `http://localhost:5000`.

### Setting Up Ngrok for HTTPS Access

#### Install Ngrok

Download and install Ngrok from https://download.ngrok.com.

#### Start Ngrok

```bash
ngrok http 5000
```

Ngrok will provide a forwarding URL, something like https://<your-ngrok-id>.ngrok.io. Use this HTTPS URL to access your AI service.

### Installing Chrome Extension

1. Open Chrome and navigate to chrome://extensions.
2. Enable Developer mode in the top right corner.
3. Click Load unpacked.
4. Select `chrome-extension` folder.

### Setting Chrome Extension AI server address

#### Click Chrome Extension on the right corner.
![screenshot1.png](/docs/screenshot1.png)

#### Enter AI server address and save
![screenshot2.png](/docs/screenshot2.png)
