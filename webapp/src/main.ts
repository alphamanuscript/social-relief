import Vue from 'vue'
import App from './app.vue'
import './register-service-worker'
import router from './router'
import store from './store'
import './configure-api';
import { LoaderPlugin } from 'vue-google-login';
import { GOOGLE_CLIENT_ID } from './api-urls'

Vue.use(LoaderPlugin, {
  // eslint-disable-next-line
  client_id: GOOGLE_CLIENT_ID
});

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
