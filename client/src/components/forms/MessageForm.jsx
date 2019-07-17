import React, { useState, useEffect } from "react";
import styled from "styled-components";

const MessageFormStyle = styled.form`
  position: fixed;
  bottom: 0;
  width: 80%;
  height: 100px;
  display: grid;
  grid-template-columns: 90% 10%;
  border-top: 2px solid black;
  background-image: linear-gradient(to right, #d3cce3, #e9e4f0);
`;

const MessageTextareaStyle = styled.textarea`
  background-color: white;
  width: auto;
  margin: 5px;
`;

const MessageBtnStyle = styled.button`
  height: 50px;
  width: 90%;
  margin: auto;
  padding: 2px;
  border-radius: 3px;
  background-image: linear-gradient(to right, #3c3b3f, #605c3c);
  color: white;
  cursor: pointer;
`;

const MessageForm = () => {
  const [text, setText] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <MessageFormStyle onSubmit={handleSubmit}>
      <MessageTextareaStyle
        placeholdre="Write your message"
        onChange={e => setText(e.target.value)}
        value={text}
      />
      <MessageBtnStyle type="submit">Send</MessageBtnStyle>
    </MessageFormStyle>
  );
};

export default MessageForm;
