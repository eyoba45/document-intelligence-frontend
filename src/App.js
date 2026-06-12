import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000/api";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chunks, setChunks] = useState(0);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploaded(false);
    setMessages([]);
  };

  // Upload the PDF to the backend
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/upload`, formData);
      setChunks(response.data.chunks);
      setUploaded(true);
      setMessages([
        {
          role: "assistant",
          content: `✅ Document ready! I have processed "${file.name}" into ${response.data.chunks} chunks. Ask me anything about it.`,
        },
      ]);
    } catch (error) {
      alert("Upload failed. Make sure your backend is running.");
    }

    setUploading(false);
  };

  // Send a question to the backend
  const handleAsk = async () => {
    if (!question.trim() || !uploaded) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, { question });
      const aiMessage = {
        role: "assistant",
        content: response.data.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  // Allow pressing Enter to send
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
        <h1>📄 Document Intelligence</h1>
        <p>Upload a document and ask questions about it</p>
      </div>

      <div className="container">
        {/* Upload Section */}
        <div className="upload-section">
          <input
            type="file"
            accept=".pdf,.txt , .docx"
            onChange={handleFileChange}
            id="file-input"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {file ? `📄 ${file.name}` : "Click to select a PDF TXT OR DOCX file"}
          </label>

          {file && !uploaded && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? "Processing..." : "Upload and Process"}
            </button>
          )}

          {uploaded && (
            <div className="upload-success">
              ✅ Ready — {chunks} chunks indexed
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="chat-section">
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                Upload a document above to get started
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-label">
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-label">AI</div>
                <div className="message-content typing">Thinking...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="input-row">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                uploaded
                  ? "Ask a question about your document..."
                  : "Upload a document first"
              }
              disabled={!uploaded || loading}
              className="question-input"
              rows={2}
            />
            <button
              onClick={handleAsk}
              disabled={!uploaded || loading || !question.trim()}
              className="ask-btn"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}