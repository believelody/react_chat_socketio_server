import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import styled from "styled-components";
import AuthRoute from "./components/auth-routes/AuthRoute";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import HomePage from "./pages/home/HomePage";

const AppStyle = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
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
