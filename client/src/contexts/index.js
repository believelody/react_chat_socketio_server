import React, { createContext, useContext } from "react";
import io from "socket.io-client";
import { createBrowserHistory } from "history";
import reducers from "../reducers";

export const AppContext = createContext();

const history = createBrowserHistory({
  forceRefresh: true
});

const url = "ws://hfr9c.sse.codesandbox.io:5000";

const socket = io();

export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={{ ...reducers, socket, history }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppHooks = () => useContext(AppContext);
