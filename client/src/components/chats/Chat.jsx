import React from "react";
import styled from "styled-components";
import MessageForm from "../forms/MessageForm";
import MessageList from "../messages/MessageList";

const ChatStyle = styled.div`
  border: 1px solid black;
  width: inherit;
`;

const Chat = () => {
  return (
    <ChatStyle>
      <MessageList />
      <MessageForm />
    </ChatStyle>
  );
};

export default Chat;
