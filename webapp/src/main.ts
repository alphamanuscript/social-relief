import Vue from 'vue'
import App from './app.vue'
import './register-service-worker'
import router from './router'
import store from './store'
import './configure-api';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
