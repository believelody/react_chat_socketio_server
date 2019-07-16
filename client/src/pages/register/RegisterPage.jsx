import React from "react";
import styled from "styled-components";
import Register from "../../components/register/Register";

const RegisterPageStyle = styled.div`
  margin: 10% 20%;
  padding: 0;
  width: auto;
  height: auto;
`;

const RegisterPage = () => {
  return (
    <RegisterPageStyle>
      <Register />
    </RegisterPageStyle>
  );
};

export default RegisterPage;
