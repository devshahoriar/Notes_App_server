import { NextFunction, Request, Response } from 'express'
import { validateToken } from '../utils/jwtToken'

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req?.headers?.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Auth failed' })
    }
    const data: any = validateToken(token)

    req.userId = data?.id
    next()
  } catch (error: any) {
    res.status(401).json({ message: error.message })
  }
}

export default authMiddleware
