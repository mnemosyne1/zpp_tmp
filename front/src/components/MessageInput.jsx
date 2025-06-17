import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import VoiceButton from './VoiceButton';

const InputContainer = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StyledMessageInput = styled.textarea`
    flex: 1 1 auto;
    width: 100%;
    padding: 10px;
    margin-right: 5px;
    border-radius: 12px;
    border: 1px solid #ccc;
    resize: none;
    outline: none;
`;

const SendButton = styled.button`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#007bff' : '#cccccc'};
  color: white;
  border: none;
  cursor: ${props => props.$active ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.$active ? '#0056b3' : '#cccccc'};
  }

  svg, i {
    width: 18px;
    height: 18px;
    font-size: 20px;
    transform: translate(-1px, -1px);
  }
`;

const MessageInput = ({ value, onChange, onSend, showVoiceButton, onVoiceInput }) => {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) onSend();
        }
    };

    return (
        <InputContainer>
            <StyledMessageInput
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder='Napisz wiadomość...'
                rows={1}
            />
            { showVoiceButton && (
              <VoiceButton
                onVoiceInput={onVoiceInput}
              />
            )}
            <SendButton 
                onClick={() => value.trim() && onSend()}
                $active={!!value.trim()}
                aria-label="Wyślij wiadomość"
            >
                <i className="fi fi-br-angle-small-right"></i>
            </SendButton>
        </InputContainer>
    );
};

MessageInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    showVoiceButton: PropTypes.bool,
    onVoiceInput: PropTypes.func
};

export default MessageInput;