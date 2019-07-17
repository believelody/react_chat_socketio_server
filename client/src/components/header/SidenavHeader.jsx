import React from "react";
import styled from "styled-components";

const HeaderStyle = styled.header`
  text-align: center;
  text-transform: uppercase;
`;

const SidenavHeader = () => {
  return (
    <HeaderStyle>
      <h4>SocketIO Chat</h4>
    </HeaderStyle>
  );
};

export default SidenavHeader;
