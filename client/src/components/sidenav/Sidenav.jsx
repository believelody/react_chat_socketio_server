import React from "react";
import styled from "styled-components";
import Users from "../users/Users";
import SidenavHeader from "../header/SidenavHeader";
import CardProfile from "../cards/CardProfile";

const SidenavStyle = styled.aside`
  width: 100%;
  height: 100%;
  margin: 0;
  background-image: linear-gradient(-45deg, #373b44, #2c3e50);
  background-color: #2c3e50;
  color: #f5f5f5;
`;

const Sidenav = () => {
  return (
    <SidenavStyle>
      <SidenavHeader />
      <CardProfile />
      <Users />
    </SidenavStyle>
  );
};

export default Sidenav;
