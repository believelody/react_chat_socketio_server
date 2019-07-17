import React from 'react'
import styled from 'styled-components'

const UserStyle = styled.li``

const User = ({ username }) => {
  return (
    <UserStyle>
      { username }
    </UserStyle>
  )
}

export default User
