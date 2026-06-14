import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "https://document-intelligence-owdz.onrender.com";

function getFileIcon(filename) {
  if (!filename) return "📄";
  if (filename.endsWith(".pdf")) return "📕";
  if (filename.endsWith(".docx")) return "📘";
  if (filename.endsWith(".txt")) return "📄";
  return "📄";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTIONS = [
  "Summarize this document",
  "Who are the main people mentioned?",
  "What are the key objectives?",
  "What problems does this address?",
  "What are the main conclusions?",
];

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunks, setChunks] = useState(0);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle file selection
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const allowed = [".pdf", ".txt", ".docx"];
    const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      alert("Only PDF, DOCX and TXT files are supported.");
      return;
    }
    setFile(selectedFile);
    setUploaded(false);
    setMessages([]);
    setProgress(0);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  // Drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // Upload document
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(40);
      const response = await axios.post(`${API}/api/upload`, formData);
      setProgress(100);
      setChunks(response.data.chunks);
      setUploaded(true);
      setMessages([
        {
          role: "assistant",
          content: `I have finished reading **${file.name}**. It was split into ${response.data.chunks} chunks and indexed in the vector database. Ask me anything about it!`,
          time: formatTime(),
        },
      ]);
    } catch (error) {
      alert("Upload failed. Make sure your backend is running on port 8000.");
      setProgress(0);
    }

    setUploading(false);
  };

  // Ask question
  const handleAsk = async (q) => {
    const text = q || question;
    if (!text.trim() || !uploaded) return;

    const userMsg = { role: "user", content: text, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/api/chat`, { question: text });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          time: formatTime(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          time: formatTime(),
        },
      ]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-logo">📄</div>
          <div>
            <div className="header-title">Document Intelligence</div>
            <div className="header-subtitle">AI-powered document analysis</div>
          </div>
        </div>
        <div className="header-badge">
          {uploaded ? `✅ ${file?.name}` : "No document loaded"}
        </div>
      </div>

      <div className="main">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-title">Document</div>

          {/* Upload Zone */}
          <div
            className={`upload-zone ${dragging ? "dragging" : ""} ${uploaded ? "uploaded" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploaded && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="upload-icon">
              {uploaded ? "✅" : dragging ? "📂" : "☁️"}
            </div>
            <div className="upload-text">
              {uploaded
                ? "Document ready"
                : dragging
                ? "Drop it here!"
                : "Drag & drop your file"}
            </div>
            <div className="upload-hint">
              {uploaded ? "Upload a new file to replace" : "or click to browse"}
            </div>
            <div className="upload-formats">
              {["PDF", "DOCX", "TXT"].map((f) => (
                <span key={f} className="format-badge">{f}</span>
              ))}
            </div>
          </div>

          {/* File Selected */}
          {file && (
            <div className="file-selected">
              <div className="file-icon">{getFileIcon(file.name)}</div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatSize(file.size)}</div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {file && !uploaded && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? "⏳ Processing..." : "🚀 Analyse Document"}
            </button>
          )}

          {/* Progress */}
          {uploading && (
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Processing document...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Document Ready Stats */}
          {uploaded && (
            <div className="doc-ready">
              <div className="doc-ready-header">
                <div className="doc-ready-dot" />
                <div className="doc-ready-title">Document Ready</div>
              </div>
              <div className="doc-stats">
                <div className="doc-stat">
                  <div className="doc-stat-value">{chunks}</div>
                  <div className="doc-stat-label">Chunks</div>
                </div>
                <div className="doc-stat">
                  <div className="doc-stat-value">
                    {(file?.size / 1024).toFixed(0)}
                  </div>
                  <div className="doc-stat-label">KB</div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {uploaded && (
            <div>
              <div className="suggestions-title">💡 Try asking</div>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => handleAsk(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🤖</div>
                <div className="empty-title">Ready to analyse</div>
                <div className="empty-subtitle">
                  Upload a document on the left and start asking questions about it
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-body">
                  <div className="message-time">{msg.time}</div>
                  <div className="message-content">{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-body">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-row">
              <textarea
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  uploaded
                    ? "Ask anything about your document..."
                    : "Upload a document to start chatting..."
                }
                disabled={!uploaded || loading}
                className="question-input"
                rows={1}
              />
              <button
                onClick={() => handleAsk()}
                disabled={!uploaded || loading || !question.trim()}
                className="ask-btn"
              >
                ➤
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
