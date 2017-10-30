import {Response} from 'express'
import {APIResponse} from '../../api'

function respond(res: Response, json: APIResponse) {
	res.json(json)
}
export function error(res: Response) {
	return (err: Error): void => {
		console.error(err)
		respond(res, {success: false, message: err.message})
	}
}
export function success(res: Response) {
	return (data: any) => respond(res, {success: true, data})
}