# Document Intelligence — Frontend

> Beautiful AI-powered document chat interface. Upload a document and have a conversation with it.

![React](https://img.shields.io/badge/React-18-blue)
![Axios](https://img.shields.io/badge/Axios-1.x-green)

---

## What it does

- Drag and drop document upload (PDF, DOCX, TXT)
- Real-time chat interface with typing indicators
- Suggestion chips for common questions
- Document stats (chunks indexed, file size)
- Fully responsive dark UI

---

## Screenshots

> Upload a document on the left sidebar, then chat with it on the right.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| HTTP Client | Axios |
| Styling | Pure CSS with animations |
| Build Tool | Create React App |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eyoba45/document-intelligence-frontend.git
cd document-intelligence-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Make sure the backend is running

This frontend requires the Document Intelligence backend running on port 8000.

See the backend repo: https://github.com/eyoba45/document-intelligence

### 4. Start the app

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## How to use

**Step 1 — Upload a document**
- Drag and drop a PDF, DOCX, or TXT file onto the upload zone
- Or click the upload zone to browse your files
- Click **Analyse Document**

**Step 2 — Wait for processing**
- The document is split into chunks and indexed in the vector database
- You will see a progress bar while it processes

**Step 3 — Ask questions**
- Type any question in the input box
- Press **Enter** to send
- Or click one of the suggestion chips on the sidebar

---

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # All styles
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
└── package.json
```

---

## Connecting to the Backend

The API base URL is set in `src/App.js`:

```javascript
const API = "http://127.0.0.1:8000/api";
```

If your backend is deployed to a live URL, change this to your deployment URL:

```javascript
const API = "https://your-backend-url.com/api";
```

---

## Features

- **Drag and drop** — drag any supported file directly onto the upload zone
- **File validation** — only accepts PDF, DOCX, and TXT files
- **Progress bar** — shows document processing progress
- **Typing indicator** — animated dots while AI is generating a response
- **Suggestion chips** — quick question shortcuts
- **Conversation memory** — AI remembers previous messages in the session
- **Auto scroll** — chat automatically scrolls to the latest message
- **Keyboard shortcuts** — Enter to send, Shift+Enter for new line

---

## Backend

The FastAPI backend for this project is available at:
https://github.com/eyoba45/document-intelligence

---

## Author

**Eyob Mulugeta**
GitHub: [@eyoba45](https://github.com/eyoba45)
