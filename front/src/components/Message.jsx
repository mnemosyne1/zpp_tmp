import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageContainer = styled.div`
  display: flex;
  justify-content: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
  padding: 0 32px;
`;

const MessageBubble = styled.div`
  max-width: ${({ $isUser }) => ($isUser ? "60%" : "80%")};
  padding: 10px;
  border-radius: 10px;
  background-color: ${({ $isUser }) => ($isUser ? "#a6b6ff" : "transparent")};
  color: ${({ $isUser }) => ($isUser ? "#000" : "white")};
  word-wrap: break-word;

  p {
    margin: 0;
  }

  a {
    color: #7ecbff;
    text-decoration: underline;
  }

  a:hover {
    color: #aedcff;
  }
`;

const Message = ({ sender, text }) => {
    const isUser = sender === "user";
  
    return (
      <MessageContainer $isUser={isUser}>
        <MessageBubble $isUser={isUser}>
          {text === "__loading__" ? (
            <span className="loading-dots">
              <span/><span/><span/>
            </span>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          )}
        </MessageBubble>
      </MessageContainer>
    );
};

export default Message;
