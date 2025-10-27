import React, { useState, useEffect, useRef  } from "react";
import { chatAPI } from "../../apis";
import { useNavigate } from "react-router-dom";

const ChatbotPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState([
    { text: "Đăng ký tài khoản", link: "/register" },
    { text: "Tìm việc làm phù hợp", link: "/jobs" },
    { text: "Cập nhật lịch rảnh", link: "/schedule" },
  ]);
  const messagesEndRef = useRef(null);

  // ✅ Tự động cuộn xuống cuối khi có tin mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatAPI(input);
      const botMessage = {
        role: "bot",
        content: response.result.response || "Không nhận được phản hồi!",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API chat:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Xử lý khi bấm gợi ý
  const handleSuggestionClick = (suggestion) => {
    const linkMessage = {
      role: "bot",
      content: `Đường link này sẽ đưa bạn tới <strong>"${suggestion.text}"</strong>: <a href="${suggestion.link}" onClick="event.preventDefault(); window.location.href='${suggestion.link}'" style="color:#007bff; text-decoration:underline;">${suggestion.text}</a>`,
    };
    setMessages((prev) => [...prev, linkMessage]);
  };
  

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
      <div
        style={{
          flex: "1",
          overflowY: "auto",
          padding: "10px",
          background: "#f9f9f9",
          borderBottom: "1px solid #ccc",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "5px 0",
              padding: "5px 10px",
              background: msg.role === "user" ? "#e3f2fd" : "#fff",
              textAlign: msg.role === "user" ? "right" : "left",
              borderRadius: "5px",
              maxWidth: "70%",
              marginLeft: msg.role === "user" ? "auto" : "0",
            }}
            dangerouslySetInnerHTML={{ __html: msg.content }} // Hiển thị link như HTML
          />
        ))}
        <div ref={messagesEndRef} />
        {isLoading && <div style={{ textAlign: "center", color: "#666" }}>Đang xử lý...</div>}
      </div>
      {/* Phần gợi ý cố định */}
      <div style={{ padding: "10px", background: "#f0f0f0", borderTop: "1px solid #ccc" }}>
        <h4 style={{ margin: "0 0 10px", color: "#666" }}>Gợi ý cho bạn:</h4>
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
              display: "inline-block",
              margin: "0 5px 5px 0",
              padding: "5px 10px",
              background: "#e0e0e0",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
      <div style={{ padding: "10px", display: "flex", gap: "10px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn của bạn..."
          style={{
            flex: "1",
            padding: "5px",
            resize: "none",
            border: "1px solid #ccc",
            borderRadius: "5px",
            minHeight: "40px",
          }}
          rows={1}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          style={{
            padding: "5px 15px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatbotPage;