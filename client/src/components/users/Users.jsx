import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
import styled from "styled-components";
import { useAppHooks } from "../../contexts";
import User from "./User";

const UsersContainer = styled.div`
  & h4 {
    margin-left: 15px;
  }
`;

const UserList = styled.ul`
  list-style: none;

  &::-webkit-scrollbar {
    width: 8px;
    background: #2c3e50;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #243140;
  }
`;

// const socket = io(":5000");

const Users = () => {
  const { socket } = useAppHooks();

  const [users, setUsers] = useState([]);

  socket.on("fetch-users", data => {
    setUsers(data);
  });

  return (
    <UsersContainer>
      <h4>Ils sont en ligne:</h4>
      <UserList>
        {users.length > 0 &&
          users.filter(user => user.username !== localStorage.username).map(user => <User key={user.id} contact={user} />)}
      </UserList>
    </UsersContainer>
  );
};

export default Users;
