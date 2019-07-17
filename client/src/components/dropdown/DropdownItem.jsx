import React from "react";
import styled from "styled-components";

const DropdownItemStyle = styled.div``;

const DropdownItem = ({ text, handleClick }) => {
  return <DropdownItemStyle onClick={handleClick}>{text}</DropdownItemStyle>;
};

export default DropdownItem;
