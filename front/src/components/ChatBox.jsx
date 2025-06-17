import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Message from "./Message";
import "../css/ChatBox.css";
import MessageInput from "./MessageInput";
import ChatHistory from "./ChatHistory";
import { useAuth } from "../hooks/useAuth";
import { getChatById, createNewChat, addMessageToChat, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    let unsubscribe;
    if (currentChatId && user) {
      const chatRef = doc(db, "userChats", user.uid);
      unsubscribe = onSnapshot(chatRef, snap => {
        const chats = snap.data()?.chats || [];
        const chat = chats.find(c => c.chatId === currentChatId);
        if (chat) {
          const msgs = chat.messages
            .filter(m => m.role !== "system")
            .map(m => ({
              sender: m.role === "user" ? "user" : "assistant",
              text: m.content
            }));
          setMessages(msgs);
        }
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [currentChatId, user]);

  const loadChatMessages = async (chatId) => {
    if (!user?.uid || !chatId) return;
    
    try {
      const chat = await getChatById(user.uid, chatId);
      if (chat) {
        const filteredMessages = chat.messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            sender: m.role === 'user' ? 'user' : 'assistant',
            text: m.content
          }));
        
        setMessages(filteredMessages);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error("Błąd ładowania wiadomości:", error);
    }
  };

  const simulateTyping = (fullText) => {
    let idx = 0;
    const interval = setInterval(() => {
      setMessages(prev => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last.sender === "assistant") {
          msgs[msgs.length - 1] = { sender: "assistant", text: fullText.slice(0, idx + 1) };
        }
        return msgs;
      });
      idx++;
      if (idx >= fullText.length) clearInterval(interval);
    }, 12);
  };

  const sendMessage = async (messageContent = input) => {
    if (!messageContent.trim()) return;
  
    setMessages(prev => [
      ...prev,
      { sender: "user", text: messageContent }
    ]);
  
    const userMessage = { role: "user", content: messageContent };
    let chatId = currentChatId;
    if (!chatId && user) {
      chatId = await createNewChat(user.uid, userMessage);
      setCurrentChatId(chatId);
    }
    if (chatId && user) {
      await addMessageToChat(user.uid, chatId, userMessage);
      console.log("Dodano wiadomość użytkownika do czatu:", userMessage);
    }
  
    const history = [
      ...messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      })),
      { role: "user", content: messageContent }
    ];

    setIsLoading(true);
    setMessages(prev => [...prev, { sender: "assistant", text: "__loading__" }]);
  
    const botResponse = await fetch("https://symese.pl/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageContent, chat_history: history })
    }).then(res => res.json());

    setIsLoading(false);
    setMessages(prev => prev.filter(m => m.text !== "__loading__"));

    setMessages(prev => [...prev, { sender: "assistant", text: "" }]);
    simulateTyping(botResponse.response);
  
    const botMessage = {
      role: "assistant",
      content: botResponse.response
    };
    // setMessages(prev => [
    //   ...prev,
    //   { sender: "assistant", text: botMessage.content }
    // ]);
    if (chatId && user) {
      await addMessageToChat(user.uid, chatId, botMessage);
      console.log("Dodano wiadomość bota do czatu:", botMessage);
    }
  
    setInput("");
    resetTranscript();
  };
  

  const startListening = () => {
    SpeechRecognition.startListening({ language: "pl-PL" });
  }

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setInput(transcript);
    sendMessage(transcript);
    resetTranscript();
  }

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  return (
    <div className="chat-box-container">
      <div className={`history-panel ${sidebarOpen ? 'open' : 'closed'}`}>
        <ChatHistory 
          userId={user?.uid}
          onChatSelect={loadChatMessages}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
      {!sidebarOpen && (
        <button
          className="btn-show-sidebar"
          onClick={handleToggleSidebar}
          title="Pokaż historię czatów"
        >
          <FontAwesomeIcon icon={faAnglesRight} />
        </button>
      )}
      <div className={`chat-main-area ${sidebarOpen ? '' : 'centered'}`}>
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <Message key={idx} sender={msg.sender} text={msg.text} />
          ))}
        </div>
        <div className="input-container">
          <MessageInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSend={() => {
              if(input.trim()) {
                  sendMessage(input);
                  setInput('');
              }
            }}
            showVoiceButton={browserSupportsSpeechRecognition}
            onVoiceInput={(text) => {
              setInput(text);
              sendMessage(text);
            }}
          />
        </div>
      </div>
      {/* <VoiceButton onVoiceInput={(text) => {
        setInput(text);
        sendMessage(text);
      }} /> */}
    </div>
  );
};

export default ChatBox;