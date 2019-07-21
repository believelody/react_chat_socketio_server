import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAppHooks } from "../../contexts";
import { SET_CURRENT_PROFILE } from "../../reducers/authReducer";

const AuthRoute = ({ component: Component, ...rest }) => {
  const { useAuth, socket } = useAppHooks();
  const [{ isConnected, username }, dispatch] = useAuth()

  const [isLoaded, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (localStorage.username) {
      dispatch({ type: SET_CURRENT_PROFILE, payload: localStorage.username })
    }
  }, [dispatch])

  React.useEffect(() => {
    if (isConnected) socket.emit("user-emit", {username, id: socket.id});
    setLoading(false)
  }, [isConnected])

  return (
    <Route
      {...rest}
      render={props => (
        <React.Fragment>
          {isLoaded && <div>Loading...</div>}
          {!isLoaded && isConnected && <Component {...props} />}
          {!isLoaded && !isConnected && <Redirect to='/login' />}
        </React.Fragment>
      )}
    />
  )
};

export default AuthRoute;
