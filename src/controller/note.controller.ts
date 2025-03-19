import { Request, Response } from 'express'
import { z } from 'zod'
import { validateError } from '../utils'
import Note from '../model/todo.model'
import mongoose from 'mongoose'

import { io } from '..'

const noteSchema = z.object({
  title: z
    .string({ message: 'Title is required.' })
    .min(1, {
      message: 'Title is required.',
    })
    .max(255),
  content: z
    .string({
      message: 'Content is required.',
    })
    .min(1, {
      message: 'Content is required.',
    }),
})

export const getAllNote = async (req: Request, res: Response) => {
  try {
    const notes = await Note.find().populate('authorId', '_id name email')
    res.json({ success: true, notes })
  } catch (error: any) {
    res.status(500).json({ message: error.message, success: false })
  }
}

export const getNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params

    const note = await Note.findOne({
      _id: new mongoose.Types.ObjectId(noteId),
    }).populate('authorId', '_id name email')

    if (!note) {
      return res.status(404).json({ message: 'Note not found', success: false })
    }

    res.json({ success: true, note })
  } catch (error: any) {
    res.status(500).json({ message: error.message, success: false })
  }
}

export const createNote = async (req: Request, res: Response) => {
  try {
    const data = noteSchema.safeParse(req.body)
    if (!data.success) {
      return res
        .status(400)
        .json({ message: validateError(data), success: false })
    }

    const newNote = await new Note({
      authorId: new mongoose.Types.ObjectId(req.userId),
      title: data.data.title,
      content: data.data.content,
    }).save()

    io.emit('updateNote')
    res.json({ message: 'Note created', success: true, note: newNote })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const updateNote = async (req: Request, res: Response) => {
  try {
    const updateSchema = noteSchema.extend({
      noteId: z.string({
        required_error: 'Note ID is required',
      }),
    })

    const data = updateSchema.safeParse(req.body)
    if (!data.success) {
      return res
        .status(400)
        .json({ message: validateError(data), success: false })
    }

    if (!mongoose.Types.ObjectId.isValid(data.data.noteId)) {
      return res
        .status(400)
        .json({ message: 'Invalid note ID', success: false })
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(data.data.noteId),
      },
      {
        title: data.data.title,
        content: data.data.content,
        updatedAt: new Date(),
      },
      { new: false }
    )
    io.emit('updateNote')

    res.json({ message: 'Note updated', success: true, note })
  } catch (error: any) {
    res.status(500).json({ message: error.message, success: false })
  }
}

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res
        .status(400)
        .json({ message: 'Invalid note ID', success: false })
    }

    const note = await Note.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(noteId),
      authorId: new mongoose.Types.ObjectId(req.userId),
    })

    if (!note) {
      return res.status(404).json({
        message: 'Note not found or you do not have permission to delete it',
        success: false,
      })
    }
    io.emit('updateNote')
    res.json({ message: 'Note deleted successfully', success: true })
  } catch (error: any) {
    res.status(500).json({ message: error.message, success: false })
  }
}

