import * as express from 'express'
import listMusics from './list-musics'

const router = express.Router()
router.use('/list-musics', listMusics)

export default router