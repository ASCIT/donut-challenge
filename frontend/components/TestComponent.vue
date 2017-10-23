<template>
	<div>
		<md-button class='md-raised md-primary' @click='incrementCount'>
			Count
		</md-button>
		{{ count }}
	</div>
</template>

<script lang='ts'>
	import Vue from 'vue'
	import Component from 'vue-class-component'

	@Component({
		name: 'test-component'
	})
	export default class TestComponent extends Vue {
		count = 0

		incrementCount() {
			this.count++
		}
	}
</script>