import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAppHooks } from "../../contexts";

const AuthRoute = ({ component: Component, ...rest }) => {
  const { useAuth } = useAppHooks();
  const [{ isConnected }, _] = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        isConnected ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default AuthRoute;
