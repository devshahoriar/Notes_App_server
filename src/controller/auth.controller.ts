import { Request, Response } from 'express'
import { z } from 'zod'
import { validateError } from '../utils'
import bcrypt from 'bcryptjs'
import User from '../model/user.model'
import { getTokens, validateToken } from '../utils/jwtToken'

const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string({ message: 'Password is required.' })
    .min(6, { message: 'Password minimum length 6.' })
    .max(48),
})

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.safeParse(req.body)
    if (!data.success) {
      return res
        .status(400)
        .json({ message: validateError(data), success: false })
    }
    const user = await User.findOne({ email: data.data.email })
    if (!user) {
      return res.status(400).json({ message: 'User not found', success: false })
    }
    const isMatch = bcrypt.compareSync(data.data.password, user.password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Password is incorrect', success: false })
    }
    const accessToken = getTokens({ id: user._id.toString() }, '1h')
    const refreshToken = getTokens({ id: user._id.toString() }, '30d')
    user.refreshToken = refreshToken
    await user.save()
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return res.json({
      message: 'Login success',
      name: user.name,
      email: user.email,
      _id: user._id,
      success: true,
      accessToken: accessToken,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string({ message: 'Password is required.' })
    .min(6, { message: 'Password minimum length 6.' })
    .max(48),
  name: z
    .string({ message: 'Name is required.' })
    .min(2, { message: 'Name is required.' })
    .max(100),
})

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.safeParse(req.body)
    if (!data.success) {
      return res
        .status(400)
        .json({ message: validateError(data), success: false })
    }
    const hasPass = bcrypt.hashSync(data.data.password, 10)
    await new User({
      email: data.data.email,
      password: hasPass,
      name: data.data.name,
    }).save()
    res.json({ message: 'Register success', success: true })
  } catch (error: any) {
    res.status(400).json({ message: error.message, success: false })
  }
}

export const getRefreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: 'Refresh token not found', success: false })
    }
    const data: any = validateToken(refreshToken)

    const accessToken = getTokens({ id: data.id }, '10s')
    const NewrefreshToken = getTokens({ id: data.id }, '30d')

    const u: any = await User.findOne({
      _id: data.id,
      refreshToken: refreshToken,
    })
    if (!u) {
      return res.status(400).json({
        message: 'User not found',
        success: false,
      })
    }
    u.refreshToken = NewrefreshToken
    await u.save()

    res.cookie('refreshToken', NewrefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    return res.json({
      message: 'new access token',
      success: true,
      name: u.name,
      email: u.email,
      _id: u._id,
      accessToken: accessToken,
    })
  } catch (error: any) {
    res.status(400).json({ message: error.message, success: false })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: 'Refresh token not found', success: false })
    }
    const data: any = validateToken(refreshToken)
    await User.findOneAndUpdate(
      { _id: data.id, refreshToken: refreshToken },
      { refreshToken: '' },
      { new: false }
    )
    res.clearCookie('refreshToken')

    return res.json({ message: 'Logout success', success: true })
  } catch (error: any) {
    res.status(400).json({ message: error.message, success: false })
  }
}
