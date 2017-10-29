<template>
	<div>
		<div class='tracklist' v-if='snippets.length'>
			<md-list>
				<md-list-item class='snippet-name' v-for='(snippet, index) in snippets' :key='snippet.name'>
					{{ snippet.name }}
					<md-spinner md-indeterminate :md-size='40' class='md-warn' v-if='snippet.end === UNKNOWN_END'></md-spinner>
					<md-button class='md-icon-button' @click='deleteSnippet(index)'>
						<md-icon>delete</md-icon>
					</md-button>
				</md-list-item>
			</md-list>
		</div>
		<div class='snippets'>
			<md-list>
				<md-list-item class='snippet-edit' v-for='(snippet, index) in snippets' :key='snippet.name'>
					<audio
						:src='snippet.url'
						preload='auto'
						@loadedmetadata='loaded(snippet, $event)'
					>
					</audio>
				</md-list-item>
			</md-list>
		</div>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {Music, Snippet} from '../music-types'

	const UNKNOWN_END = Infinity

	@Component({
		name: 'editor'
	})
	export default class Editor extends Vue {
		UNKNOWN_END = UNKNOWN_END
		snippets: Snippet[] = []
		snippetNumber = 1 //the number of snippets added so far, used to label them

		addMusic({name, url}: Music) {
			this.snippets.push({
				name: name + ' ' + String(this.snippetNumber++),
				url,
				start: 0,
				end: UNKNOWN_END
			})
		}
		deleteSnippet(index: number) {
			this.snippets.splice(index, 1)
		}
		loaded(snippet: Snippet, event: Event) {
			snippet.end = (event.target as HTMLAudioElement).duration
		}
	}
</script>

<style lang='sass'>
	div.tracklist
		width: 15%
		border-right: 1px solid rgba(0,0,0,.12)

	div.snippet-name, div.snippet-edit
		height: 50px

	div.snippets
		width: 85%
</style>