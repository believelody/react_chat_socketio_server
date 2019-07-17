import React from "react";
import styled from "styled-components";
import MessageItem from "./MessageItem";

const messages = [
  { username: "Andrew", text: `Hey what's up dude?` },
  { username: "Laki", text: `Fine and you?` },
  { username: "Andrew", text: `I'm cool. I'm in your city. Party tonight?` },
  { username: "Laki", text: `Aww maan too old for this now!!!` }
];

const MessageListStyle = styled.ul`
  margin: 50px 0 100px;
  padding: 0px 10px;
  display: flex;
  list-style: none;
  flex-direction: column;
`;

const MessageList = () => {
  return (
    <MessageListStyle>
      {messages.length > 0 &&
        messages.map((message, i) => <MessageItem key={i} message={message} />)}
    </MessageListStyle>
  );
};

export default MessageList;
