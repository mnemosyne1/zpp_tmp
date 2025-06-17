import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, deleteChat, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "../css/ChatHistory.css";

const ChatHistory = ({ userId, currentChatId, onChatSelect, onNewChat, sidebarOpen, onToggleSidebar }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const logoutRef = useRef(null);
    
    useEffect(() => {
      if (!userId) return;
  
      const userChatsRef = doc(db, "userChats", userId);
  
      const unsubscribe = onSnapshot(userChatsRef, snap => {
        const data = snap.data();
        setChats(data?.chats || []);
        setLoading(false);
      }, err => {
        console.error("Firestore onSnapshot error:", err);
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          showLogoutConfirm &&
          logoutRef.current &&
          !logoutRef.current.contains(e.target)
        ) {
          setShowLogoutConfirm(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showLogoutConfirm]);

    const handleLogoutToggle = () => {
      setShowLogoutConfirm(prev => !prev);
    };
  
    const handleLogout = async () => {
      await signOut(auth);
      window.location.href = "/login";
    };

    if (loading) return <div>Ładowanie historii...</div>;


    return (
      <div className="chat-history-container">

        <div className="chat-history-toolbar">
          <div className="toolbar-left" ref={logoutRef}>
            <button className="btn-logout" onClick={handleLogoutToggle} title="Konto">
              <FontAwesomeIcon icon={faUser} />
            </button>
            {showLogoutConfirm && (
              <button className="confirm-logout-btn" onClick={handleLogout}>
                Wyloguj
              </button>
            )}
          </div>
          <div className="toolbar-center">
            <button className="btn-new-chat" onClick={onNewChat} title="Utwórz nowy czat">
              <i className="fi fi-br-plus"></i>
            </button>
          </div>
          <div className="toolbar-right">
            <button
              className="btn-toggle-sidebar"
              onClick={onToggleSidebar}
              title={sidebarOpen ? "Ukryj historię" : "Pokaż historię"}
            >
              <FontAwesomeIcon icon={
                  sidebarOpen 
                  ? faAnglesLeft
                  : faAnglesRight
                }
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-indicator">Ładowanie...</div>
        ) : (
          <ul className="chat-list">
            {chats.map(chat => (
              <li 
                key={chat.chatId}
                className={`chat-item ${currentChatId === chat.chatId ? 'active' : ''}`}
                onClick={() => onChatSelect(chat.chatId)}
              >
                <span className="chat-title">
                  {chat.title || 'Nowy czat'}
                </span>
                <button
                  className="delete-chat-btn"
                  onClick={() => deleteChat(userId, chat.chatId)}
                  title="Usuń czat"
                >
                  <i className="fi fi-br-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
}

export default ChatHistory;