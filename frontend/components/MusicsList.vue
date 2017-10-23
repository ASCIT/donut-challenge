<template>
	<md-sidenav ref='sidenav' class='md-right'>
		<md-toolbar>
			<h2 class='md-title'>Pick a track</h2>
		</md-toolbar>

		<md-list v-if='musics'>
			<md-list-item v-for='music in musics' :key='music.url'>
				<md-button @click='selected(music)'>
					{{ music.display }}
				</md-button>
			</md-list-item>
		</md-list>
		<md-spinner v-else md-indeterminate class='md-warn'></md-spinner>
	</md-sidenav>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'
	import {Musics} from '../../api'
	import apiFetch from '../api-fetch'

	interface Sidenav extends Vue {
		open(): void
		close(): void
	}

	interface Music {
		url: string
		display: string
	}

	function displayName(music: string): string {
		const title = music.substring(0, music.lastIndexOf('.'))
		return title.replace(/_/g, ' ')
	}

	@Component({
		name: 'musics-list'
	})
	export default class MusicsList extends Vue {
		musics: Music[] | null = null

		mounted() {
			apiFetch({url: '/api/list-musics'})
				.then((musics: Musics) =>
					this.musics = musics.map(music => ({
						url: music,
						display: displayName(music)
					}))
				)
				.catch(message => alert('Error occurred: ' + message))
		}
		open() {
			(this.$refs.sidenav as Sidenav).open()
		}
		selected(music: Music) {
			(this.$refs.sidenav as Sidenav).close()
			this.$emit('selected', music.url)
		}
	}
</script>