import React from "react";
import styled from "styled-components";

const InputStyle = styled.input`
  border: none;
  border-bottom: 1px solid black;
  background-color: transparent;
  color: white;
`;

const TextInput = ({ value, name, placeholder, handleChange }) => {
  return (
    <InputStyle
      type="text"
      value={value}
      name={name}
      placeholder={placeholder}
      onChange={e => handleChange(e.target.value)}
    />
  );
};

export default TextInput;
