import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import RegisterForm from "../forms/RegisterForm";

const RegisterStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  background-image: linear-gradient(
    to right,
    #7f7fd5 0%,
    #86a8e7 30%,
    #91eae4 100%
  );
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);

  & h4 {
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding-bottom: 10px;
    width: 100%;
    text-shadow: 2px 2px 5px rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
  }

  & a {
    color: black;
    padding-bottom: 5px;
    font-style: oblique;
    font-size: 0.8em;
  }
`;

const Register = () => {
  return (
    <RegisterStyle>
      <h4>Join Us</h4>
      <RegisterForm />
      <Link to="/login">Already an account?</Link>
    </RegisterStyle>
  );
};

export default Register;
