<template>

  <el-container>
    <el-main>
      <el-alert
          title="站长的小贴士"
          :description="'你好！欢迎来支持我们的表白墙，目前表白墙仍在不断更新中，如有bug，敬请谅解。目前版本：0.2.0'"
          type="warning"
          effect="dark"
          :closable="true"
          show-icon
          center
      > </el-alert>
      <el-row :gutter="20" style="overflow: auto" v-infinite-scroll="load" infinite-scroll-disabled="isDisabled">
        <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="i in data" :key="i">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span style="color: firebrick">{{ i.sender }} 表白了 {{ i.target }}</span>
                <span style="color: #999; font-size: 13px">No. {{ i.id }}</span>
              </div>
            </template>
            <div class="card-content" @click="onCardClick(i.id)">
              <div>{{ i.payload }}</div>
            </div>
            <div class="bottom">
              <time class="time">{{ i.sendtime }}</time>
              <el-button type="text" class="button" :disabled="i.isLiked" :id="'like-btn-card-'+i.id" @click="onLike(i.id)"> <!-- @click="onLike"-->点赞 {{ i.likes }}</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from "axios";
import {ElNotification} from "element-plus/es";
import {useRouter} from "vue-router";

export default defineComponent({
  setup() {
    if (localStorage.getItem("liked-list") == null) {
      localStorage.setItem("liked-list", JSON.stringify([]))
    }
    const router = useRouter()
    const likedList = ref(JSON.parse(localStorage.getItem("liked-list")))
    // api at /api/list/{page}
    const page_num = ref(1)
    const isDisabled = ref(false)
    const data = ref([])
    const load = () => {
      axios({
        url: "https://bbq.bjbybbs.com/api/list/" + page_num.value + "?t=" + (new Date()).getTime(),
        method: "get"
      }).then(function (respdata) {
        respdata = respdata.data
        if (respdata.code == 0) {
          respdata.response.forEach((card) => {
            card.sendtime = new Date(parseInt(card.sendtime) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ')
            if (card.sender == "") {
              card.sender = "匿名"
            }
            if (likedList.value[card.id] == null) {
              likedList.value[card.id] = false
              card.isLiked = false
            } else {
              card.isLiked = likedList.value[card.id]
            }
            data.value.push(card)
          })
          if (respdata.response.length < 10) {
            isDisabled.value = false
          }
          page_num.value += 1
        }
      })
    }
    const onLike = (id) => {
      axios({
        url: "https://bbq.bjbybbs.com/api/like/" + id + "?t=" + (new Date()).getTime(),
        method: "get"
      }).then(function (respdata) {
        respdata = respdata.data
        if (respdata.code == 0) {
          const choosed = data.value.find(item => item.id == id)
          choosed.likes += 1
          choosed.isLiked = true
          likedList.value[id] = true
          localStorage.setItem("liked-list", JSON.stringify(likedList.value))
        } else {
          ElNotification({
            title: '点赞失败',
            message: '点赞失败了……失败原因：' + respdata.msg,
            duration: 5000,
            type: 'error',
          })
        }
      })
    }
    const onCardClick = (id) => {
      router.push('/card/' + id)
    }
    return {
      page_num,
      data,
      isDisabled,
      onLike,
      onCardClick,
      load,
    }
  },
})
</script>

<style lang="scss" scoped>

.time {
  font-size: 13px;
  color: #999;
}

.el-alert {
  margin-bottom: 20px;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.el-row > .el-col {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.card-content > div {
  font-size: var(--el-font-size-base);
  margin-bottom: 18px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  align-items: start;
  color: #f56c6c;
}

</style>
