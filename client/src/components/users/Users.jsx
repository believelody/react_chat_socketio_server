import React, { useState, useEffect } from 'react'
import io from "socket.io-client";
import styled from 'styled-components'
import { useAppHooks } from '../../contexts';
import User from './User';

const UsersContainer = styled.div``

const UserList = styled.ul`
    list-style: none;
`

// const socket = io("http://localhost:5000");

const Users = () => {
    const { socket } = useAppHooks()

    const [users, setUsers] = useState([])

    socket.on('fetch-users', data => {
        console.log(data)
        setUsers(data)
    })

    return (
        <UsersContainer>
            <h4>Ils sont en ligne:</h4>
            <UserList>
                {
                    users.length > 0 && users.map(user => <User key={user.id} username={user.username} />)
                }
            </UserList>
        </UsersContainer>
    )
}

export default Users
