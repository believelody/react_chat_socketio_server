import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import MessageForm from "../forms/MessageForm";
import MessageList from "../messages/MessageList";
import ChatHeader from "../header/ChatHeader";
import Dropdown from "../dropdown/Dropdown";
import DropdownItem from "../dropdown/DropdownItem";
import { useAppHooks } from "../../contexts";

const ChatStyle = styled.div`
  background-image: linear-gradient(to right, #e0eafc, #cfdef3);
  width: inherit;
  position: relative;
  overflow: hidden;
`;

const NoChatStyle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const Chat = () => {
  const { socket } = useAppHooks()

  const [chat, setChat] = useState(null)
  const [y, setY] = useState(0);
  const [isDisplayed, setDisplay] = useState(false);

  const getHeaderPosition = (isDisplayed, y) => {
    setDisplay(isDisplayed);
    setY(y);
  };

  useEffect(() => {
    if (!chat) {
      socket.on('fetch-chat', chatFetched => {
        setChat(chatFetched)
      })
    }
  }, [chat])

  return (
    <ChatStyle>
      {
        chat ?
        <div>
          <ChatHeader
            getHeaderPosition={getHeaderPosition}
            isDisplayed={isDisplayed}
            chat={chat}
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
          <MessageList messages={chat.messages} users={chat.users} />
          <MessageForm chatId={chat.id} />
        </div>
        :
        <NoChatStyle>Select a chat or create one by choosing one of your contact</NoChatStyle>
      }
    </ChatStyle>
  );
};

export default Chat;
