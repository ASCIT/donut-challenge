import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

import TestComponent from './components/TestComponent.vue'

Vue.use(VueMaterial)

new Vue({
	el: '#app',
	components: {
		'test-component': TestComponent
	}
})