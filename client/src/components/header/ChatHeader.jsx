import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const ChatHeaderStyle = styled.header`
  width: 80%;
  height: 40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  position: fixed;
  padding: 0;
  margin: 0;

  & > h4 {
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  & > span {
    text-align: center;
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    padding: 5px;
    margin: 0;
    font-size: 1.2em;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
    width: 40px;
    cursor: pointer;
  }
`;

const ChatHeader = ({ getHeaderPosition, isDisplayed }) => {
  const headerRef = useRef();

  const handleClick = e => {
    getHeaderPosition(
      !isDisplayed,
      headerRef.current.getBoundingClientRect().height
    );
  };

  return (
    <ChatHeaderStyle ref={headerRef}>
      <span onClick={handleClick}>+</span>
      <h4>Andrew</h4>
    </ChatHeaderStyle>
  );
};

export default ChatHeader;
