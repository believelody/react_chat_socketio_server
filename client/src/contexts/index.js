import React, { createContext, useContext } from "react";
import io from "socket.io-client";
import reducers from "../reducers";

export const AppContext = createContext();

const socket = io(":5000");

export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={{ ...reducers, socket }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppHooks = () => useContext(AppContext);
