import express from 'express'
import { getRefreshToken, login, logout, register } from '../controller/auth.controller'

const authRouter = express.Router()

authRouter.post('/login', login)
authRouter.post('/register', register)
authRouter.post('/token', getRefreshToken)
authRouter.get('/logout', logout)

export default authRouter
