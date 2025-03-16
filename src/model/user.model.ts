import mongoose, { Schema } from 'mongoose'

// email, password, refreshToken, name
const userSchema = new Schema({
  name: { type: Schema.Types.String, required: [true, 'Name is required.'] },
  email: {
    type: Schema.Types.String,
    required: [true, 'Email is required.'],
    unique: [true, 'Email already exists.'],
  },
  password: {
    type: Schema.Types.String,
    required: [true, 'Password is required.'],
  },
  refreshToken: { type: Schema.Types.String },
})

const User = mongoose.model('User', userSchema)

export default User
