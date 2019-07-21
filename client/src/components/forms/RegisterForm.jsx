import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppHooks } from "../../contexts";
import { SET_CURRENT_PROFILE, AUTH_FAILED } from "../../reducers/authReducer";
import TextInput from "../inputs/TextInput";

const FormStyle = styled.form`
  padding: 0 10px 20px;
  display: flex;
  flex-direction: column;
`;

const LabelStyle = styled.label`
  margin-right: 10px;
`;

const ButtonStyle = styled.button`
  background-color: forestgreen;
  color: white;
  margin-top: 15px;
  border-radius: 5px;
  padding: 3px;
  border: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
`;

const RegisterForm = () => {
  const { useAuth, history } = useAppHooks();
  const [{ error, isConnected }, dispatch] = useAuth();

  const [username, setUsername] = useState("");
  const [errorRegister, setError] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();

    if (username !== "") {
      if (!localStorage.username) {
        dispatch({
          type: SET_CURRENT_PROFILE,
          payload: username
        });
        localStorage.username = username;

        setUsername("");
      } else {
        dispatch({
          type: AUTH_FAILED,
          payload: { code: "register", message: "This username already exists" }
        });
      }
    } else {
      setError({ code: "username", message: "Username is required" });
    }
  };

  useEffect(() => {
    if (error) setError(error);
  }, [error]);

  useEffect(() => {
    if (errorRegister) {
      alert(errorRegister.message);
    }
  }, [errorRegister]);

  useEffect(() => {
    if (isConnected) {
      history.replace('/')
    }
  }, [isConnected])

  return (
    <FormStyle onSubmit={handleSubmit}>
      <span>
        <LabelStyle>Username</LabelStyle>
        <TextInput
          value={username}
          name="username"
          placeholder="Type your username"
          handleChange={setUsername}
        />
      </span>
      <ButtonStyle type="submit">Create user</ButtonStyle>
    </FormStyle>
  );
};

export default RegisterForm;
