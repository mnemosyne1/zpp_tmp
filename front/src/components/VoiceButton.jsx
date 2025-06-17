import React, { useState } from "react";
import styled from "styled-components";

const StyledVoiceButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 60px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
    font-size: 20px;
    transform: translate(0px, 2px);
  }

  &:hover {
    background-color: #0056b3;
  }
  
`;

const VoiceButton = ({ onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);

  const isSpeechRecognitionSupported = () => {
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  };

  const startListening = () => {
    if (!isSpeechRecognitionSupported()) {
      console.error("Web Speech API nie jest obsługiwane w tej przeglądarce.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "pl-PL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length-1][0].transcript;
      console.log("Rozpoznany tekst:", transcript);
      onVoiceInput(transcript);
      setIsListening(false);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error("Błąd rozpoznawania mowy:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  if (!isSpeechRecognitionSupported()) {
    return <p></p>;
  }

  return (
    <StyledVoiceButton
      className={`voice-button ${isListening ? "active" : ""}`}
      onClick={startListening}
      title="Naciśnij i mów"
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3z"/>
        <path d="M19 11V10h-2v1c0 2.76-2.24 5-5 5s-5-2.24-5-5v-1H5v1c0 3.39 2.72 6.15 6.1 6.45V21h1.8v-3.55c3.38-.3 6.1-3.06 6.1-6.45z"/>
      </svg>
    </StyledVoiceButton>
  );
};

export default VoiceButton;