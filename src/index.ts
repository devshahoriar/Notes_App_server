import http from 'http'
import mongoose from 'mongoose'
import { Server, Socket } from 'socket.io'
import app from './app'
import User from './model/user.model'
import { validateToken } from './utils/jwtToken'
import {
  addUser,
  getAllUsers,
  removeUser
} from './utils/socketUserStore'

const port = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
})

interface AuthenticatedSocket extends Socket {
  userId?: string
}

io.use((socket: AuthenticatedSocket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication error: No token provided'))
  }

  try {
    const decoded: any = validateToken(token)

    socket.userId = decoded?.id
    next()
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'))
  }
})

io.on('connection', (socket: AuthenticatedSocket) => {
  if (socket?.userId) {
    User.findById(socket.userId, 'name email').then((user) => {
      if (user) {
        addUser(socket.id, socket?.userId as string, user.name, user.email)
        io.emit('updateUser', getAllUsers())
      }
    })
  }

  socket.on('startEditNote', (data: any) => {
    io.emit('noteEdit', { nodeId: data.noteId, user: data?.user, start: true })
  })

  socket.on('endEditNote', (data: any) => {
    io.emit('noteEdit', { nodeId: data.noteId, user: data?.user, end: true })
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
    io.emit('updateUser', getAllUsers())
  })
})

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB')
    server.listen(port, () => {
      console.log(`Listening: http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

export { io }

