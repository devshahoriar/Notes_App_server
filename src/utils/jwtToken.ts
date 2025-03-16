import jwt from 'jsonwebtoken'

require('dotenv').config();
const secret = process.env.JWT_SECRET!

export const getTokens = (payLoad: any, expiresIn: any) => {
  const token = jwt.sign(payLoad, secret, { expiresIn: expiresIn })
  return token
}

export const validateToken = (token: any) => {
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}