export interface Music {
	url: string
	name: string
}

export interface Snippet {
	url: string
	name: string
	start: number //seconds; start of snippet in music
	end: number //seconds; end of snippet in music
	offset: number //seconds; offset from start of snippet mix
}