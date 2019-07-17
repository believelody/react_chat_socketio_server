import React from "react";
import styled from "styled-components";
import Sidenav from "../../components/sidenav/Sidenav";
import Chat from "../../components/chats/Chat";

const HomePageStyle = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 20% 80%;
`;

const HomePage = () => {
  return (
    <HomePageStyle>
      <Sidenav />
      <Chat />
    </HomePageStyle>
  );
};

export default HomePage;
