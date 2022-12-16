import { Request, RequestHandler } from 'express';
import type { SignupSchema, SigninSchema } from 'validation/request.schemas'
import { createUser, generateJWT, findUserByUsername, comparePasswords } from 'services/auth.service';
import { AppError } from 'lib/utility-classes';

export const signup: RequestHandler = async (req: Request<unknown, unknown, SignupSchema>, res, next) => {
  const userData = {
    username: req.body.username,
    password: req.body.password
  }

  if ( await findUserByUsername(userData.username) ) {
    return next(new AppError('validation', 'A user already exists with that username'))
  }
  
  const newUser = await createUser(userData)
  const token = await generateJWT(newUser.id)

  res.status(200).json({
    message: `Registered successfully`,
    user: newUser,
    token
  })
}

export const signin: RequestHandler = async (req: Request<unknown, unknown, SigninSchema>, res, next) => {
  let { username, password } = req.body

  const existing = await findUserByUsername(username)

  if ( !existing ) {
    return next(new AppError('validation', 'Account not found.'))
  }

  if ( !comparePasswords(password, existing.password) ) {
    return next(new AppError('validation', 'Invalid login.'))
  }

  const token = generateJWT(existing.id)

  res.status(200).json({
    message: 'Login successful!',
    username: existing.username,
    token
  })
}