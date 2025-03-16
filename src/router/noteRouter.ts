import express from 'express'
import {
  createNote,
  deleteNote,
  getAllNote,
  getAllUsersR,
  getNote,
  updateNote,
} from '../controller/note.controller'
import authMiddleware from '../middleware/authmiddleware'

const noteRouter = express.Router()

noteRouter.get('/activeUsers', authMiddleware, getAllUsersR)

noteRouter.get('/', authMiddleware, getAllNote)
noteRouter.get('/:noteId', authMiddleware, getNote)
noteRouter.post('/', authMiddleware, createNote)
noteRouter.put('/', authMiddleware, updateNote)
noteRouter.delete('/:noteId', authMiddleware, deleteNote)

export default noteRouter
