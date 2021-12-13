<template>
  <el-container>
    <el-header>
      <el-menu
          class="el-menu"
          mode="horizontal"
          :router=true
          style="justify-content: space-evenly"
      >
        <el-menu-item index="/">
          <el-icon><list /></el-icon>
          首页
        </el-menu-item>
        <el-menu-item index="/publish">
          <el-icon><edit /></el-icon>
          我要表白
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="margin-bottom: 40px">
      <el-row :gutter="10">
        <el-col :span="18" :offset="3">
          <router-view></router-view>
        </el-col>
      </el-row>
    </el-main>
    <el-footer class="main-footer">
      <el-row :gutter="10">
        <el-col :span="16" :offset="4">
          <p class="footer-note">北京某校的表白墙</p>
        </el-col>
      </el-row>
    </el-footer>
  </el-container>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import {
  List,
  Edit,
} from '@element-plus/icons-vue'

export default defineComponent({
  components: {
    List,
    Edit,
  },
})

</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.footer-note {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  text-align: center;
  color: #606266;
}

.main-footer {
  bottom: 0;
  left: 0;
  right: 0;
  position: relative;
  margin-top: -60px;
  height: 60px;
  border-top: solid 1px #e6e6e6;
  justify-content: space-between;
}
</style>
