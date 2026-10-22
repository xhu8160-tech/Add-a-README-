import express, { Application } from 'express'
import cors from 'cors'
import path from 'node:path'
import { existsSync } from 'node:fs'
import compression from 'compression'
import 'express-async-errors'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { httpLogger } from './middleware/logger.js'
import { systemRouter } from './modules/system.js'
import { growthRouter } from './modules/growth/index.js'

export const createApp = (): Application => {
  const app = express()

  // HTTP request logging
  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  // Body parsing and compression
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // API routes - System & Health
  app.use(env.API_PREFIX, systemRouter)

  // Travel Growth Copilot - 双板块输出（行程方案 + Strategy Lab）
  app.use(`${env.API_PREFIX}/growth`, growthRouter)

  // Serve the built UI and APIs from one production service.
  if (env.NODE_ENV === 'production') {
    const webRoot = path.resolve(process.env.STATIC_DIR || '../frontend/dist')
    if (!existsSync(path.join(webRoot, 'index.html'))) {
      throw new Error('Frontend build missing: run npm run build in frontend before startup')
    }
    app.use(express.static(webRoot))
    app.get('*', (req, res, next) => {
      if (req.path === env.API_PREFIX || req.path.startsWith(`${env.API_PREFIX}/`)) return next()
      if (path.extname(req.path)) return next()
      return res.sendFile(path.join(webRoot, 'index.html'))
    })
  }

  // Error handling
  app.use(errorHandler)

  return app
}
