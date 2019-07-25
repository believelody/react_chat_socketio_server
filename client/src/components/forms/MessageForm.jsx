import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppHooks } from "../../contexts";

const MessageFormStyle = styled.form`
  position: fixed;
  padding: 8px;
  bottom: 0;
  width: 80%;
  min-height: 80px;
  display: grid;
  grid-template-columns: 90% 10%;
  background-image: linear-gradient(-45deg, #373b44, #2c3e50);
`;

const MessageTextareaStyle = styled.textarea`
  background-color: white;
  width: auto;
  border-radius: 10px;
`;

const MessageBtnStyle = styled.span`
  height: 50px;
  width: 90%;
  margin: auto;
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 2px -2px 4px rgba(0, 0, 0, 0.3);
`;

const MessageForm = ({ chatId }) => {
  const { socket } = useAppHooks()

  const [text, setText] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    socket.emit('new-message', { chatId, userId: socket.id, text })
    setText('')
  };

  return (
    <MessageFormStyle onSubmit={handleSubmit}>
      <MessageTextareaStyle
        placeholder="Write your message"
        onChange={e => setText(e.target.value)}
        value={text}
      />
      <MessageBtnStyle as="button" type="submit">
        Send
      </MessageBtnStyle>
    </MessageFormStyle>
  );
};

export default MessageForm;
