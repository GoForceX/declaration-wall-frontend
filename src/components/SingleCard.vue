<template>

  <el-container>
    <el-main>
      <el-alert
          title="站长的小贴士"
          :description="'你好！欢迎来支持我们的表白墙，目前表白墙仍在不断更新中，如有bug，敬请谅解。\n目前版本：0.2.1'"
          type="warning"
          effect="dark"
          :closable="true"
          show-icon
          center
      > </el-alert>
      <el-row :gutter="20" style="overflow: auto">
        <el-col :xs="24" :sm="24" :md="12" :lg="16" :xl="16">
          <el-card shadow="hover" style="margin-bottom: 20px">
            <template #header>
              <div class="card-header">
                <span style="color: firebrick">{{ sender }} 表白了 {{ target }}</span>
                <span style="color: #999; font-size: 13px">No. {{ id }}</span>
              </div>
            </template>
            <div class="card-content">
              <div style="font-size: 20px; margin: auto; position: relative; width: 100%; word-break: keep-all">
                {{ payload }}
              </div>
            </div>
            <div class="bottom">
              <time class="time">{{ sendtime }}</time>
              <el-button type="text" class="button" :disabled="isLiked" @click="onLike()"> <!-- @click="onLike"-->点赞 {{ likes }}</el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <el-card shadow="hover">
            <template #header>
              <div class="comment-header">
                <span>写评论</span>
              </div>
            </template>
            <div class="comment-form-content">
              <el-form
                  label-position="top"
                  label-width="100px"
                  :model="commentForm"
                  :rules="commentRules"
                  ref="commentFormRef"
              >
                <el-form-item label="名字（不填视作匿名）" prop="name">
                  <el-input v-model="commentForm.name"></el-input>
                </el-form-item>
                <el-form-item label="内容" prop="payload">
                  <el-input v-model="commentForm.payload" :autosize="{ minRows: 4, maxRows: 10 }" type="textarea"></el-input>
                </el-form-item>
                <!--
                <el-form-item label="验证码">
                  <div id="publish-geetest">
                    <div id="captcha" ref="captcha"></div>
                  </div>
                </el-form-item>
                -->
                <el-form-item>
                  <el-button type="primary" @click="onSubmit">提交！</el-button>
                </el-form-item>
              </el-form>
            </div>
            <div class="bottom">
              <!-- <el-button type="text" class="button" :disabled="isLiked" @click="onLike()">点赞 {{ likes }}</el-button> -->
            </div>
          </el-card>
          <el-card shadow="hover">
            <template #header>
              <div class="comment-header">
                <span>评论列表</span>
              </div>
            </template>
            <div class="comment-content">
              <el-row>
                <el-space class="el-col-24" direction="vertical" size="mini" :spacer="spacer" alignment="start">
                  <span v-if="comments.length === 0">还没有评论呢，<br>你要成为第一个吗？</span>
                  <el-col :span="24" v-for="comment in comments" style="align-items: start">
                    <div class="comment">
                      <div style="font-size: var(--el-font-size-large);">{{ comment.sender }}</div>
                      <div style="font-size: var(--el-font-size-medium); color: #999; white-space: pre-wrap">{{ comment.payload }}</div>
                      <div class="footer time">
                        <span>No.{{ comment.id }}</span>
                        <time>{{ comment.sendtime }}</time>
                      </div>
                    </div>
                  </el-col>
                </el-space>
              </el-row>
            </div>
            <div class="bottom">
              <!-- <el-button type="text" class="button" :disabled="isLiked" @click="onLike()">点赞 {{ likes }}</el-button> -->
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>

</template>

<script type="ts">

import {defineComponent, getCurrentInstance, onMounted, ref, h} from "vue";
import { ElDivider } from 'element-plus'
import {useRoute} from "vue-router";
import axios from "axios";
import {ElNotification} from "element-plus/es";

export default defineComponent ({
  setup: function () {
    const { proxy } = getCurrentInstance()

    if (localStorage.getItem("liked-list") == null) {
      localStorage.setItem("liked-list", JSON.stringify([]))
    }
    const likedList = ref(JSON.parse(localStorage.getItem("liked-list")))
    const isLiked = ref(false)

    const sender = ref("")
    const target = ref("")
    const sendtime = ref("")
    const payload = ref("")
    const likes = ref("")

    const comments = ref([])

    const route = useRoute()
    const id = Number(route.params.id)

    const geetestInstance = ref({});

    const commentForm = ref({
      name: '',
      payload: '',
    })
    const commentRules = ref({
      name: [
        {
          required: false,
          trigger: 'blur',
        },
      ],
      payload: [
        {
          required: true,
          message: '请输入你想评论的话',
          trigger: 'blur',
        },
      ]
    })

    console.log(id)

    axios({
      url: "https://bbq.bjbybbs.com/api/query/" + id + "?t=" + (new Date()).getTime(),
      method: "get"
    }).then(function (respdata) {
      respdata = respdata.data
      if (respdata.code == 0) {
        let resp = respdata.response[0]
        if (resp.length == 0) {
          ElNotification({
            title: '加载失败',
            message: '加载失败了……话说回来，真的有这张表白卡吗？',
            duration: 5000,
            type: 'error',
          })
        } else {
          if (likedList.value[id] == null) {
            isLiked.value = false
          } else {
            isLiked.value = likedList.value[id]
          }
          if (resp.sender == "") {
            resp.sender = "匿名"
          }
          sender.value = resp.sender
          target.value = resp.target
          payload.value = resp.payload
          sendtime.value = new Date(parseInt(resp.sendtime) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ')
          likes.value = resp.likes
        }
      } else {
        ElNotification({
          title: '加载失败',
          message: '加载失败了……失败原因：' + respdata.msg,
          duration: 5000,
          type: 'error',
        })
      }
    })

    axios({
      url: "https://bbq.bjbybbs.com/api/comment/" + id + "?t=" + (new Date()).getTime(),
      method: "get"
    }).then(function (respdata) {
      respdata = respdata.data
      if (respdata.code == 0) {
        respdata.response.forEach((comment) => {
          comment.sendtime = new Date(parseInt(comment.sendtime) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ')
          if (comment.sender == "") {
            comment.sender = "匿名"
          }
          comments.value.push(comment)
        })
      }
    })

    const onLike = () => {
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

    const onSubmit = () => {
      proxy.$refs['commentFormRef'].validate((valid) => {
        if (valid) {
          // api at /api/create/message
          geetestInstance.value.verify()
        } else {
          ElNotification({
            title: '校验失败',
            message: '你甚至没有填上必填的选项（',
            duration: 5000,
            type: 'error',
          })
        }
      })
      // }
    }

    onMounted(() => {
      axios({
        url: "https://verify.bjbybbs.com/register" + "?t=" + (new Date()).getTime(),
        method: "get"
      }).then(function (data) {
        data = data.data
        //请检测data的数据结构， 保证data.gt, data.challenge, data.success有值
        initGeetest({
          // 以下配置参数来自服务端 SDK
          https: true,
          product: "bind",
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: true
        }, function (captchaObj) {
          geetestInstance.value = captchaObj
          // captchaObj.appendTo("#captcha");
          captchaObj.onSuccess(function () {
            const result = captchaObj.getValidate();

            let data = {
              "name": commentForm.value.name,
              "mainid": id,
              "payload": commentForm.value.payload,
              "challenge": result.geetest_challenge,
              "validate": result.geetest_validate
            };
            axios.post('https://bbq.bjbybbs.com/api/create/comment', data)
                .then(res => {
                  if (res.data.code == 0) {
                    ElNotification({
                      title: '提交成功',
                      message: '好耶！已经成功提交啦！现在你可以看到你的评论了',
                      duration: 5000,
                      type: 'success',
                    })
                  } else {
                    ElNotification({
                      title: '提交失败',
                      message: '提交失败了……失败原因：' + res.data.msg,
                      duration: 5000,
                      type: 'error',
                    })
                  }
                })
          })
        })
      })
    })

    return {
      sender,
      target,
      payload,
      sendtime,
      comments,
      commentForm,
      commentRules,
      id,
      likes,
      isLiked,
      onLike,
      onSubmit,
      spacer: h(ElDivider, {})
    }
  }
})

</script>

<style scoped lang="scss">

.time {
  font-size: var(--el-font-size-small);
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

.el-col > .el-card {
  margin-bottom: 20px;
&:last-child {
   margin-bottom: 0;
 }
}

.card-content > div {
  font-size: var(--el-font-size-base);
  margin-bottom: 18px;
}

.card-header, .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  align-items: start;
  color: #f56c6c;
  min-height: 300px;
  text-align: center;
  white-space: pre-wrap;
}

.el-space :deep(span) > .el-divider {
  margin: 4px 0;
}

.el-space {
  text-align: start;
}

.footer {
  justify-content: space-between;
  display: flex;
}

.comment {
  width: 100%;
}

.el-space :deep(.el-space__item) {
  width: 100%;
}

.el-col {
  width: 100%;
}

.comment > div {
  margin-bottom: 6px;
  &:last-child {
    margin-bottom: 0;
  }
}

.el-alert {
  white-space: pre-wrap;
}

</style>
