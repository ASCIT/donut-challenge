import * as base64 from 'base64-js'
import * as sb from 'structure-bytes'

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

const snippetsType = new sb.ArrayType(
	new sb.StructType<Snippet>({
		id: new sb.FlexUnsignedIntType,
		url: new sb.PointerType(new sb.StringType),
		name: new sb.StringType,
		length: new sb.FloatType,
		start: new sb.FloatType,
		end: new sb.FloatType,
		offset: new sb.FloatType
	})
)
export function serializeSnippets(snippets: Snippet[]): string {
	const buffer = snippetsType.valueBuffer(snippets)
	return base64.fromByteArray(new Uint8Array(buffer))
}
export function deserializeSnippets(serialized: string): Snippet[] {
	const buffer = base64.toByteArray(serialized)
	return snippetsType.readValue(buffer.buffer, buffer.byteOffset)
}