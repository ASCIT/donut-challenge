import {APIResponse} from '../api'

interface FetchOptions {
	url: string
	//Assuming GET as method for now
}

export default ({url}: FetchOptions): Promise<any> => {
	const options: RequestInit = {method: 'GET'}
	return fetch(url, options)
		.then(response => response.json())
		.then((response: APIResponse) => {
			if (response.success) return Promise.resolve(response.data)
			else {
				const {message} = response
				console.error(message)
				return Promise.reject(message)
			}
		})
}