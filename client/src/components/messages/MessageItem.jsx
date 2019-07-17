import React from "react";
import styled from "styled-components";

const MessageStyle = styled.li`
  border-radius: 8px;
  background-image: ${props =>
    props.isYou
      ? "linear-gradient(45deg, #c9d6ff, #e2e2e2)"
      : "linear-gradient(45deg, #06beb6, #48b1bf)"};
  padding: 0px 5px 2px;
  max-width: 40%;
  position: relative;
  left: ${props => (!props.isYou ? "0px" : "60%")};
  /* right: ${props => (props.isYou ? "0px" : "40%")}; */
`;

const MessageItem = ({ message }) => {
  return (
    <MessageStyle isYou={localStorage.username === message.username}>
      <h5>
        {localStorage.username === message.username ? "You" : message.username}
      </h5>
      <p>{message.text}</p>
    </MessageStyle>
  );
};

export default MessageItem;
