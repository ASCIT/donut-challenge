<template>
	<div>
		<md-toolbar>
			<h2 class='md-title app-title'>BarrageGand</h2>
			<md-button class='md-icon-button' @click='showMusics'>
				<md-icon>add</md-icon>
			</md-button>
		</md-toolbar>

		<musics-list ref='musics' @selected='musicSelected'></musics-list>
		<editor ref='editor'></editor>
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {Music} from '../music-types'
	import Editor from './Editor.vue'
	import MusicsList from './MusicsList.vue'

	@Component({
		name: 'app',
		components: {
			'editor': Editor,
			'musics-list': MusicsList
		}
	})
	export default class App extends Vue {
		showMusics() {
			(this.$refs.musics as MusicsList).open()
		}
		musicSelected(music: Music) {
			(this.$refs.editor as Editor).addMusic(music)
		}
	}
</script>

<style lang='sass' scoped>
	.app-title
		flex-grow: 1
</style>
<style lang='sass'>
	body
		overflow-x: hidden //otherwise, sidenav just starts offscreen
</style>