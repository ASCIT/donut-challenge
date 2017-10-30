<template>
	<div>
		<div class='controls'>
			<md-button class='md-icon-button' @click='zoomIn'>
				<md-icon>zoom_in</md-icon>
			</md-button>
			<md-button class='md-icon-button' @click='zoomOut'>
				<md-icon>zoom_out</md-icon>
			</md-button>
		</div>
		<div class='snippet-flex' v-if='snippets.length'>
			<div class='tracklist'>
				<md-list>
					<md-list-item class='snippet-height'>&nbsp;</md-list-item> <!--for padding-->
					<md-list-item class='snippet-height' v-for='(snippet, index) in snippets' :key='snippet.name'>
						{{ snippet.name }}
						<md-spinner md-indeterminate :md-size='40' class='md-warn' v-if='snippet.end === UNKNOWN_END'></md-spinner>
						<md-button class='md-icon-button' @click='deleteSnippet(index)'>
							<md-icon>delete</md-icon>
						</md-button>
					</md-list-item>
				</md-list>
			</div>
			<div class='snippets' @click='endAdjusting' @mousemove='mousemove'>
				<md-list>
					<md-list-item class='snippet-height'>
						&nbsp;
						<div
							class='second-mark'
							v-for='secondDiv in secondDivs'
							:key='secondDiv'
							:style='{left: toPixels(secondDiv * secondDiff)}'
						>
							{{ secondDiv * secondDiff }} s
						</div>
					</md-list-item>
					<md-list-item class='snippet-height snippet' v-for='(snippet, index) in snippets' :key='snippet.name'>
						<audio
							:src='snippet.url'
							preload='auto'
							@loadedmetadata='loaded(snippet, $event)'
						>
						</audio>
						<div class='occupied' :style='{
							left: toPixels(snippet.offset),
							width: toPixels(snippet.end - snippet.start),
							background: makeGradient(snippet)
						}'>
							<div class='adjustable end' @click='adjust(snippet, "start", $event)'></div>
							<div class='adjustable center' @click='adjust(snippet, "offset", $event)'></div>
							<div class='adjustable end' @click='adjust(snippet, "end", $event)'></div>
						</div>
					</md-list-item>
				</md-list>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {Music, Snippet} from '../music-types'

	const DEFAULT_PIXELS_PER_SECOND = 100
	const ZOOM_FACTOR = 2
	const DEFAULT_PIXELS_BETWEEN_MARKS = 100
	const UNKNOWN_END = Infinity
	type RGB = [number, number, number]
	const COLOR_START: RGB = [244, 67, 54], COLOR_END: RGB = [3, 169, 244]

	function blendFraction(fraction: number): string {
		const result: RGB = [0, 0, 0]
		for (let i = 0; i < result.length; i++) {
			result[i] = Math.round(COLOR_END[i] * fraction + COLOR_START[i] * (1 - fraction))
		}
		return 'rgb(' + result.join(',') + ')'
	}

	type AdjustableAttribute = 'start' | 'end' | 'offset'
	interface Adjusting {
		snippet: Snippet
		attribute: AdjustableAttribute
		initialX: number
		initialValue: number
	}

	@Component({
		name: 'editor'
	})
	export default class Editor extends Vue {
		UNKNOWN_END = UNKNOWN_END
		snippets: Snippet[] = []
		snippetNumber = 1 //the number of snippets added so far, used to label them
		pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND
		adjusting: Adjusting | null = null

		addMusic({name, url}: Music) {
			this.snippets.push({
				name: name + ' ' + String(this.snippetNumber++),
				url,
				length: UNKNOWN_END,
				start: 0,
				end: UNKNOWN_END,
				offset: 0
			})
		}
		deleteSnippet(index: number) {
			this.snippets.splice(index, 1)
		}
		loaded(snippet: Snippet, event: Event) {
			snippet.end = snippet.length = (event.target as HTMLAudioElement).duration
		}
		makeGradient({start, end, length}: Snippet) {
			const startColor = blendFraction(start / length)
			const endColor = blendFraction(end / length)
			return 'linear-gradient(to right, ' + startColor + ', ' + endColor + ')'
		}
		zoomIn() {
			this.pixelsPerSecond *= ZOOM_FACTOR
		}
		zoomOut() {
			this.pixelsPerSecond /= ZOOM_FACTOR
		}
		adjust(snippet: Snippet, attribute: AdjustableAttribute, event: MouseEvent) {
			if (this.adjusting === null) {
				this.adjusting = {
					snippet,
					attribute,
					initialX: event.clientX,
					initialValue: (snippet as any)[attribute] as number
				}
				event.stopPropagation() //prevent triggering the click handler for the whole snippets pane
			}
			else this.endAdjusting()
		}
		endAdjusting() {
			this.adjusting = null
		}
		mousemove(event: MouseEvent) {
			if (this.adjusting === null) return
			const {snippet, attribute, initialX, initialValue} = this.adjusting
			let newValue = initialValue + (event.clientX - initialX) / this.pixelsPerSecond
			switch (attribute) {
				case 'start':
					newValue = Math.min(Math.max(newValue, 0), snippet.end)
					//When moving start, move offset too so end is fixed in place
					const startChange = newValue - snippet.start
					snippet.offset += startChange
					if (snippet.offset < 0) { //don't allow snippet to start with negative offset
						newValue -= snippet.offset
						snippet.offset = 0
					}
					break
				case 'end':
					newValue = Math.min(Math.max(newValue, snippet.start), snippet.length)
					break
				case 'offset':
					newValue = Math.max(newValue, 0)
			}
			(snippet as any)[attribute] = newValue
		}
		toPixels(seconds: number) {
			return String(seconds * this.pixelsPerSecond) + 'px'
		}
		get endTime() {
			return Math.max(
				...this.snippets.map(({offset, start, end}) => offset + end - start)
			)
		}
		get secondDiff() { //difference in seconds between time marks, aiming for set distance
			const targetDiff = DEFAULT_PIXELS_BETWEEN_MARKS / this.pixelsPerSecond
			return ZOOM_FACTOR ** Math.round(Math.log(targetDiff) / Math.log(ZOOM_FACTOR))
		}
		get secondDivs() {
			if (this.endTime === UNKNOWN_END) return 0
			return Math.ceil(this.endTime / this.secondDiff)
		}
	}
</script>

<style lang='sass' scoped>
	div.controls
		width: 100%

	div.snippet-flex
		display: flex
		overflow-x: auto

	div.tracklist
		width: 15%
		border-right: 1px solid rgba(0,0,0,.12)
	div.snippets
		width: 85%

	.snippet-height
		height: 50px

	div.second-mark
		position: absolute

	div.occupied
		position: relative
		top: 5px
		height: 40px
		display: flex

	div.adjustable:hover
		background: #FFC107
	div.adjustable.end
		width: 10%
	div.adjustable.center
		width: 80%
</style>

<style lang='sass'>
	.snippet .md-list-item-container
		display: block
		padding-right: 0
</style>