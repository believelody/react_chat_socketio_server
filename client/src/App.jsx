import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import styled from "styled-components";
import AuthRoute from "./components/auth-routes/AuthRoute";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import HomePage from "./pages/home/HomePage";

const AppStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #e6eaea;
  font-family: "proxima-nova", "Source Sans Pro", sans-serif;
  letter-spacing: 0.1px;
  color: #32465a;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.004);
  -webkit-font-smoothing: antialiased;
`;

const App = () => {
  return (
    <BrowserRouter>
      <AppStyle>
        <Switch>
          <AuthRoute exact path="/" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />}
        </Switch>
      </AppStyle>
    </BrowserRouter>
  );
};

export default App;
