import * as express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import {promisify} from 'util'
import {Musics} from '../../api'
import {error, success} from './respond'

const MUSIC_DIR = path.join(__dirname, '../../public/music')

const router = express.Router()
router.get('/', (_, res) => {
	promisify(fs.readdir)(MUSIC_DIR)
		.then((musics: Musics) => success(res)(musics))
		.catch(error(res))
})

export default router