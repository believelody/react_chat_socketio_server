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

const LoginForm = () => {
  const { useAuth, socket, history } = useAppHooks();
  const [{ error, isConnected }, dispatch] = useAuth();

  const [username, setUsername] = useState("");
  const [errorLogin, setError] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();

    if (username !== "") {
      if (localStorage.username === username) {
        alert(`Welcome ${username}`);

        dispatch({
          type: SET_CURRENT_PROFILE,
          payload: username
        });

        socket.emit("user-emit", { username, id: socket.id });

        setUsername("");
      } else {
        dispatch({
          type: AUTH_FAILED,
          payload: { code: "login", message: "This user doesn't exist" }
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
    if (errorLogin) {
      alert(errorLogin.message);
    }
  }, [errorLogin]);

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
      <ButtonStyle type="submit">Log in</ButtonStyle>
    </FormStyle>
  );
};

export default LoginForm;
