import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useAppHooks } from '../../contexts';
import { SET_CURRENT_PROFILE } from '../../reducers/authReducer';

const UserStyle = styled.li`
  margin: 0;
  padding-left: 8px;
  transition: all 300ms ease-in;
  cursor: pointer;

  &:hover, &:active {
    background-color: #32465a;
    padding-left: 24px;
    border-right: 2px solid #2c3e50;
  }
`

const User = ({ contact }) => {
  const { useAuth, socket } = useAppHooks()

  const [{username}, dispatch] = useAuth()

  const handleClick = () => {
    socket.emit('new-chat', [contact.id, socket.id])
  }

  useEffect(() => {
    if (localStorage.username) {
      dispatch({
        type: SET_CURRENT_PROFILE,
        payload: localStorage.username
      })
    }
  }, [username])

  return (
    <UserStyle onClick={handleClick}>
      { contact.username }
    </UserStyle>
  )
}

export default User
