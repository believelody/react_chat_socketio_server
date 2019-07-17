import React from "react";
import styled from "styled-components";
import Users from "../users/Users";
import SidenavHeader from "../header/SidenavHeader";

const SidenavStyle = styled.aside`
  width: 100%;
  height: 100%;
  margin: 0;
  background-image: linear-gradient(45deg, #ffefba, #ffffff);
  border: 1px solid black;
`;

const Sidenav = () => {
  return (
    <SidenavStyle>
      <SidenavHeader />
      <Users />
    </SidenavStyle>
  );
};

export default Sidenav;
