import { createApp } from 'vue'
import App from './App.vue'
import Index from './components/Index.vue'
import Publish from './components/Publish.vue'
import 'element-plus/dist/index.css'
import { createRouter, createWebHistory } from 'vue-router'

const app = createApp(App)

const routes = [
    { path: '/', component: Index },
    { path: '/publish', component: Publish },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

app.use(router)

app.mount('#app')