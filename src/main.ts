import { createApp } from 'vue'
import './globals.css'
import App from './App.vue'
import Antd from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import 'ant-design-vue/dist/reset.css'
import router from './router'

createApp(App).use(Antd, { locale: zhCN }).use(router).mount('#app')