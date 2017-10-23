interface APIError {
	success: false
	message: string
}
interface APISuccess {
	success: true
	data: any
}
export type APIResponse = APIError | APISuccess

export type Musics = string[]