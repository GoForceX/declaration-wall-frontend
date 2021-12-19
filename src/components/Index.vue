<template>

  <el-container>
    <el-main>
      <el-alert
          :closable="true"
          :description="'你好！欢迎来支持我们的表白墙，目前表白墙仍在不断更新中，如有bug，敬请谅解。\n目前版本：0.2.1'"
          center
          effect="dark"
          show-icon
          title="站长的小贴士"
          type="warning"
      ></el-alert>
      <el-row :gutter="20" style="overflow: auto">
        <el-col v-for="i in data" :key="i" :xs="24" :sm="12" :md="12" :lg="8"  :xl="6">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span style="color: firebrick">{{ i.sender }} 表白了 {{ i.target }}</span>
                <span style="color: #999; font-size: 13px">No. {{ i.id }}</span>
              </div>
            </template>
            <div class="card-content" @click="onCardClick(i.id)">
              <div class="card-payload">{{ i.payload }}</div>
            </div>
            <div class="bottom">
              <time class="time">{{ i.sendtime }}</time>
              <el-button :id="'like-btn-card-'+i.id" :disabled="i.isLiked" class="button" type="text"
                         @click="onLike(i.id)"> <!-- @click="onLike"-->点赞 {{ i.likes }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <div>
        <el-pagination
            v-model:currentPage="currentPage"
            @current-change="() => {}"
            :page-count="pageCount"
            :page-size="pageSize"
            :hide-on-single-page="true"
            :small="pageSize<6"
            layout="prev, pager, next"
        >
        </el-pagination>
      </div>
    </el-main>
  </el-container>

</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue'
import axios from "axios";
import {ElNotification} from "element-plus/es";
import {useRouter} from "vue-router";

export default defineComponent({
  setup() {
    if (localStorage.getItem("liked-list") == null) {
      localStorage.setItem("liked-list", JSON.stringify([]))
    }

    const pageSize = ref(8)

    const changePageSize = () => {
      if (window.innerWidth < 768) {
        pageSize.value = 4
      } else if (window.innerWidth < 1200) {
        pageSize.value = 6
      } else if (window.innerWidth < 1920) {
        pageSize.value = 9
      } else {
        pageSize.value = 12
      }
    }

    changePageSize()

    const router = useRouter()
    const likedList = ref(JSON.parse(localStorage.getItem("liked-list")))
    // api at /api/list/{page}
    const pageCount = ref(1)
    const cardCount = ref(1)
    const currentPage = ref(1)
    const isDisabled = ref(false)
    const data = ref([])
    const load = () => {
      axios({
        url: "https://bbq.bjbybbs.com/api/list/" + currentPage.value + "?each=" + pageSize.value + "&t=" + (new Date()).getTime(),
        method: "get"
      }).then(function (respdata) {
        data.value = []
        respdata = respdata.data
        pageCount.value = respdata['page_num']
        cardCount.value = respdata['count']
        if (respdata.code == 0) {
          respdata.response.forEach((card) => {
            card.sendtime = new Date(parseInt(card.sendtime) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
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

    load()

    watch(currentPage, (a) => {
      load()
      console.log(a)
    })
    return {
      pageSize,
      pageCount,
      cardCount,
      currentPage,
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
  width: 100%;
}

.card-payload {
  text-align: start;
  white-space: pre-wrap;
  width: 100%;
}

.el-alert {
  white-space: pre-wrap;
}

</style>
