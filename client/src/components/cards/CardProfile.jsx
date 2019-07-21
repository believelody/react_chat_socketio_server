import React, { useEffect } from "react";
import styled from "styled-components";
import {useAppHooks} from '../../contexts'
import { SET_CURRENT_PROFILE } from "../../reducers/authReducer";

const CardProfileStyle = styled.div`
  height: 60px;
  line-height: 60px;
  padding: 0px 10px 30px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;

  & .img-card {
    width: 50px;
    line-height: 40px;
    border-radius: 50%;
    border: 2px solid ${props => props.imgBg.color};
    height: 50px;
    text-align: center;
    font-size: 2em;
    cursor: pointer;
  }

  & .name-card {
    width: 100%;
    margin: 0 0 0 20px;
    padding: 0;
  }
`;

const statusArray = [
  { status: "online", color: "#2ecc71" },
  { status: "offline", color: "#95a5a6" },
  { status: "busy", color: "#e74c3c" },
  { status: "away", color: "#f1c40f" }
];

const CardProfile = () => {
  const { useAuth, socket } = useAppHooks()
  const [{username}, dispatch] = useAuth();

  const [imgBg, setImgbg] = React.useState(statusArray[0]);

  useEffect(() => {
    if (localStorage.username) {
      dispatch({
        type: SET_CURRENT_PROFILE,
        payload: localStorage.username
      })
    }
  }, [username])

  return username &&
    <CardProfileStyle imgBg={imgBg}>
      <span className="img-card">{username[0].toUpperCase()}</span>
      <h3 className="name-card">{username}</h3>
    </CardProfileStyle>
};

export default CardProfile;
