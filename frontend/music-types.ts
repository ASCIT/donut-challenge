export interface Music {
	url: string
	name: string
}

export interface Snippet {
	id: number
	url: string
	name: string
	length: number //seconds; length of underlying music
	start: number //seconds; start of snippet in music
	end: number //seconds; end of snippet in music
	offset: number //seconds; offset from start of snippet mix
}