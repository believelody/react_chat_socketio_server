import React, { useRef, useEffect } from "react";
import styled from "styled-components";

const DropdownStyle = styled.section`
  display: block;
  width: 300px;
  height: 300px;
  position: absolute;
  /* visibility: ${props => (props.isDisplayed ? "visible" : "hidden")}; */
  top: ${props => props.y}px;
  right: ${props => (props.isDisplayed ? 0 : -300)}px;
  /* color: white; */
  background-color: white;
  transition: right 800ms ease;
  z-index: 10;
`;

const Dropdown = ({ children, isDisplayed, propsY, handleDropdown }) => {
  const dropdownRef = useRef();

  const closeDropdown = () => {
    handleDropdown(false);
  };

  // useEffect(() => {
  //   if (isDisplayed) dropdownRef.current.focus();
  //   else closeDropdown();
  // }, [isDisplayed]);

  return (
    <DropdownStyle ref={dropdownRef} y={propsY} isDisplayed={isDisplayed}>
      {children}
    </DropdownStyle>
  );
};

export default Dropdown;
