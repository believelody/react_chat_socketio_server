import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import MessageForm from "../forms/MessageForm";
import MessageList from "../messages/MessageList";
import ChatHeader from "../header/ChatHeader";
import Dropdown from "../dropdown/Dropdown";
import DropdownItem from "../dropdown/DropdownItem";

const ChatStyle = styled.div`
  border: 1px solid black;
  width: inherit;
  position: relative;
  overflow: hidden;
`;

const Chat = () => {
  const [y, setY] = useState(0);
  const [isDisplayed, setDisplay] = useState(false);

  const getHeaderPosition = (isDisplayed, y) => {
    setDisplay(isDisplayed);
    setY(y);
  };

  return (
    <ChatStyle>
      <ChatHeader
        getHeaderPosition={getHeaderPosition}
        isDisplayed={isDisplayed}
      />
      <Dropdown
        propsY={y}
        isDisplayed={isDisplayed}
        handleDropdown={setDisplay}
      >
        <DropdownItem
          handleClick={() => setDisplay(false)}
          text="Add User to Chat"
        />
      </Dropdown>
      <MessageList />
      <MessageForm />
    </ChatStyle>
  );
};

export default Chat;
