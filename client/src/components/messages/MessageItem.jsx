import React from "react";
import styled from "styled-components";

const MessageStyle = styled.li`
  border-radius: 8px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  background-image: ${props =>
    props.isYou
      ? "linear-gradient(45deg, #eee, #fff)"
      : "linear-gradient(45deg, #06beb6, #48b1bf)"};
  padding: 0px 5px 2px;
  max-width: 40%;
  position: relative;
  left: ${props => (!props.isYou ? "0px" : "60%")};
  /* right: ${props => (props.isYou ? "0px" : "40%")}; */
  & h5 {
    padding: 0;
    margin: 0;
  }
`;

const MessageItem = ({ message, contact }) => {
  console.log(contact)
  return (
    <MessageStyle isYou={message.id !== contact.id && contact.username === localStorage.username}>
      <h5>
        {message.id !== contact.id && contact.username === localStorage.username ? "You" : contact.username}
      </h5>
      <p>{message.text}</p>
    </MessageStyle>
  );
};

export default MessageItem;
