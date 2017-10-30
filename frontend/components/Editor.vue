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
		<div class='snippet-flex'>
			<div class='tracklist'>
				<md-list>
					<md-list-item class='snippet-height'>
						<md-button class='md-icon-button' @click='togglePlaying'>
							<md-icon>
								{{ playing ? 'pause' : 'play_arrow' }}
							</md-icon>
						</md-button>
						<md-button class='md-icon-button' @click='getSerialized'>
							<md-icon>content_copy</md-icon>
							<md-tooltip>Copy to clipboard</md-tooltip>
						</md-button>
						<md-button class='md-icon-button' @click='importSerialized'>
							<md-icon>content_paste</md-icon>
							<md-tooltip>Paste from clipboard</md-tooltip>
						</md-button>
					</md-list-item>
					<md-list-item class='snippet-height' v-for='(snippet, index) in snippets' :key='snippet.id'>
						<span @click='editName(snippet)'>{{ snippet.name }}</span>
						<md-spinner md-indeterminate :md-size='40' class='md-warn' v-if='snippet.end === UNKNOWN_END'></md-spinner>
						<md-button class='md-icon-button' @click='deleteSnippet(index)'>
							<md-icon>delete</md-icon>
						</md-button>
					</md-list-item>
				</md-list>
			</div>
			<div class='snippets' @click='endAdjusting' @mousemove='mousemove'>
				<md-list>
					<md-list-item class='snippet-height' v-if='snippets.length'> <!--rendering errors if run with no snippets-->
						&nbsp; <!--included because empty list item throws errors-->
						<div
							class='second-mark'
							v-for='secondDiv in secondDivs'
							:key='secondDiv'
							:style='{left: toPixels(secondDiv * secondDiff)}'
						>
							{{ secondDiv * secondDiff }} s
						</div>
						<div class='marker' v-if='playing' :style='{left: toPixels(timeSincePlaying)}'></div>
					</md-list-item>
					<md-list-item class='snippet-height snippet' v-for='(snippet, index) in snippets' :key='snippet.id'>
						<audio
							:src='snippet.url'
							preload='auto'
							@loadedmetadata='loaded(snippet, $event)'
							:ref='getAudioRef(snippet)'
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
	import {Music, Snippet, serializeSnippets, deserializeSnippets} from '../music-types'

	const ESCAPE = 27 //ASCII character code
	const DEFAULT_PIXELS_PER_SECOND = 100
	const ZOOM_FACTOR = 2
	const DEFAULT_PIXELS_BETWEEN_MARKS = 100
	/**
	 * The value used for the `length` and `end` properties
	 * of a `Snippet` before its audio file has been loaded
	 */
	const UNKNOWN_END = Infinity
	type RGB = [number, number, number]
	const COLOR_START: RGB = [244, 67, 54], COLOR_END: RGB = [3, 169, 244]

	/**
	 * Creates a color on a linear scale between
	 * `COLOR_START` and `COLOR_END`
	 */
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
		/**
		 * The snippets in the editor
		 */
		snippets: Snippet[] = []
		/**
		 * The number of snippets added so far;
		 * used to label them
		 */
		snippetNumber = 1
		/**
		 * The number of pixels corresponding to
		 * one second in the editor (zoom factor)
		 */
		pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND
		/**
		 * The current snippet and property
		 * being adjusted by mouse,
		 * or `null` if none currently is
		 */
		adjusting: Adjusting | null = null
		/**
		 * Whether the tracks are currently playing
		 */
		playing = false
		/**
		 * Uniquely identifies a command to play all tracks
		 * so it can cancel itself when play button
		 * is pressed again
		 */
		playingToken: object | null = null
		/**
		 * Number of seconds passed since started playing;
		 * 0 is an arbitrary value and will be overwritten
		 * before the value is used
		 */
		timeSincePlaying = 0

		mounted() {
			window.addEventListener('keydown', e => {
				if (e.keyCode === ESCAPE) {
					if (this.adjusting === null) return
					const {snippet, attribute, initialValue} = this.adjusting
					if (attribute === 'start') snippet.offset -= snippet.start - initialValue //undo offset change too
					;(snippet as any)[attribute] = initialValue
					this.endAdjusting()
				}
			})
		}
		/**
		 * Adds a snippet that plays all of a given track
		 */
		addMusic({name, url}: Music) {
			this.snippets.push({
				id: this.snippetNumber,
				name: name + ' ' + String(this.snippetNumber),
				url,
				length: UNKNOWN_END,
				start: 0,
				end: UNKNOWN_END,
				offset: 0
			})
			this.snippetNumber++
		}
		/**
		 * Removes a snippet, given its index in `snippets`
		 */
		deleteSnippet(index: number) {
			this.snippets.splice(index, 1)
		}
		/**
		 * Event handler for when snippet audio has loaded
		 */
		loaded(snippet: Snippet, event: Event) {
			if (snippet.length !== UNKNOWN_END) return

			snippet.end = snippet.length = (event.target as HTMLAudioElement).duration
		}
		/**
		 * Gets gradient to show on snippet,
		 * where red is the start of the track
		 * and blue is the end (shows current trimming)
		 */
		makeGradient({start, end, length}: Snippet) {
			const startColor = blendFraction(start / length)
			const endColor = blendFraction(end / length)
			return 'linear-gradient(to right, ' + startColor + ', ' + endColor + ')'
		}
		/**
		 * Decreases the number of seconds shown at a time
		 */
		zoomIn() {
			this.pixelsPerSecond *= ZOOM_FACTOR
		}
		/**
		 * Increases the number of seconds shown at a time
		 */
		zoomOut() {
			this.pixelsPerSecond /= ZOOM_FACTOR
		}
		/**
		 * Begins adjusting a certain attribute
		 * of a given snippet, supplied the
		 * initial mouse position
		 */
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
		/**
		 * Stops adjusting
		 */
		endAdjusting() {
			this.adjusting = null
		}
		/**
		 * Handler for mouse movement while adjusting
		 */
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
		/**
		 * Converts seconds position to CSS pixel distance
		 */
		toPixels(seconds: number) {
			return String(seconds * this.pixelsPerSecond) + 'px'
		}
		/**
		 * Gets the latest end time of the snippets
		 */
		get endTime() {
			return Math.max(
				...this.snippets.map(({offset, start, end}) => offset + end - start)
			)
		}
		/**
		 * Gets the difference in seconds between time marks
		 * so that a set distance on screen is displayed between marks;
		 * rounds to a power of `ZOOM_FACTOR`
		 */
		get secondDiff() {
			const targetDiff = DEFAULT_PIXELS_BETWEEN_MARKS / this.pixelsPerSecond
			return ZOOM_FACTOR ** Math.round(Math.log(targetDiff) / Math.log(ZOOM_FACTOR))
		}
		/**
		 * Gets the number of time marks to show
		 */
		get secondDivs() {
			if (this.endTime === UNKNOWN_END) return 0
			return Math.ceil(this.endTime / this.secondDiff)
		}
		/**
		 * Gets a string by which to reference
		 * the `audio` element associated with a snippet
		 */
		getAudioRef(snippet: Snippet) {
			return 'audio' + String(snippet.id)
		}
		/**
		 * Gets the `audio` element associated with a snippet
		 */
		getPlayer(snippet: Snippet) {
				const playerArray = this.$refs[this.getAudioRef(snippet)] as HTMLAudioElement | HTMLAudioElement[]
				return playerArray instanceof Array ? playerArray[0] : playerArray
		}
		/**
		 * Updates `timeSincePlaying` based on the current time;
		 * calls itself again after a short interval
		 */
		updateTimeSincePlaying(start: Date, playingToken: object) {
			if (!this.playing || this.playingToken !== playingToken) return

			this.timeSincePlaying = (new Date().getTime() - start.getTime()) / 1000
			setTimeout(() => this.updateTimeSincePlaying(start, playingToken), 10)
		}
		/**
		 * Toggles between whether the player
		 * is playing or paused
		 */
		togglePlaying() {
			this.playing = !this.playing
			if (this.playing) { //now playing
				const playingToken = {}
				this.playingToken = playingToken
				let completed = 0
				const completedTarget = this.snippets.length
				for (const snippet of this.snippets) {
					const player = this.getPlayer(snippet)
					const {start, end, offset} = snippet
					player.currentTime = start
					setTimeout(() => {
						if (this.playingToken !== playingToken) return

						player.play()
						setTimeout(() => {
							if (this.playingToken !== playingToken) return

							player.pause()
							completed++
							if (completed === completedTarget) this.playing = false
						}, (end - start) * 1000)
					}, offset * 1000)
				}
				this.updateTimeSincePlaying(new Date, playingToken)
			}
			else { //now pausing
				this.playingToken = null
				for (const snippet of this.snippets) this.getPlayer(snippet).pause()
			}
		}
		/**
		 * Prompts for a new name for a snippet;
		 * uses old name if cancelled
		 */
		editName(snippet: Snippet) {
			snippet.name = prompt('New name', snippet.name) || snippet.name
		}
		/**
		 * Gives user base-64 text of serialized snippets
		 */
		getSerialized() {
			const serialized = serializeSnippets(this.snippets)
			prompt('Copy this text', serialized)
		}
		/**
		 * Takes base-64 text and deserializes snippets
		 */
		importSerialized() {
			try {
				const serialized = prompt('Paste the text')
				if (serialized === null) return
				this.snippets = deserializeSnippets(serialized)
			}
			catch (e) { alert('Could not interpret text') }
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
		width: 100px

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

	div.marker
		position: absolute
		width: 0
		height: 20px
		border: 2px solid black
</style>

<style lang='sass'>
	.snippet .md-list-item-container
		display: block
		padding-left: 0
		padding-right: 0
</style>