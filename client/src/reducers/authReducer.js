import { useReducer } from "react";

export const SET_CURRENT_PROFILE = "SET_CURRENT_PROFILE";
export const REGISTER = "REGISTER";
export const AUTH_FAILED = "AUTH_FAILED";
export const DISCONNECT = "DISCONNECT";

const initAuthState = {
  isConnected: false,
  username: null,
  error: null
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case SET_CURRENT_PROFILE:
      return {
        ...state,
        username: payload,
        isConnected: true
      };

    case AUTH_FAILED:
      return {
        ...state,
        error: payload
      };

    case DISCONNECT:
      return {
        ...state,
        username: null
      };

    default:
      return state;
  }
};

export default () => useReducer(reducer, initAuthState);
