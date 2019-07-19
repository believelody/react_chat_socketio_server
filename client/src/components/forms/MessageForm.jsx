import React, { useState, useEffect } from "react";
import styled from "styled-components";

const MessageFormStyle = styled.form`
  position: fixed;
  bottom: 0;
  width: 80%;
  min-height: 100px;
  display: grid;
  grid-template-columns: 90% 10%;
  background-image: linear-gradient(to right, #e0eafc, #cfdef3);
`;

const MessageTextareaStyle = styled.textarea`
  background-color: white;
  width: auto;
  margin: 0px 0px 5px 8px;
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

const MessageForm = () => {
  const [text, setText] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
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
