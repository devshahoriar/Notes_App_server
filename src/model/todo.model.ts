import mongoose, { Schema } from 'mongoose'

const TodoSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
)

export default mongoose.model('Note', TodoSchema)
