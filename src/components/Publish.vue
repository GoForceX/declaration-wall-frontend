<template>

  <el-container>
    <el-main>
      <el-form
          label-position="top"
          label-width="100px"
          :model="pubForm"
          :rules="pubRules"
          ref="pubFormRef"
      >
        <el-form-item label="名字（不填视作匿名）" prop="name">
          <el-input v-model="pubForm.name"></el-input>
        </el-form-item>
        <el-form-item label="表白对象" prop="target">
          <el-input v-model="pubForm.target"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="payload">
          <el-input v-model="pubForm.payload" :autosize="{ minRows: 4, maxRows: 10 }" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <div id="publish-geetest">
            <div id="captcha" ref="captcha"></div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交！</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>

</template>

<script type="ts">
import axios from 'axios'
import {defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref} from "vue";
import { ElNotification } from "element-plus";

export default defineComponent ({
  setup() {
    const { proxy } = getCurrentInstance()

    const isCaptchaSuccess = ref(false);
    const challenge = ref("")
    const validate = ref("")
    const pubForm = ref({
      name: '',
      target: '',
      payload: '',
    })
    const pubRules = ref({
      name: [
        {
          required: false,
          trigger: 'blur',
        },
      ],
      target: [
        {
          required: true,
          message: '请输入你的表白对象',
          trigger: 'blur',
        },
      ],
      payload: [
        {
          required: true,
          message: '请输入你想说的话',
          trigger: 'blur',
        },
      ]
    })

    const onSubmit = () => {
      if (!isCaptchaSuccess.value) {
        ElNotification({
          title: '你不对劲',
          message: '你貌似没有完成验证码？这是坏文明，完成验证码才能提交哦（',
          duration: 5000,
        })
      } else {
        proxy.$refs['pubFormRef'].validate((valid) => {
          if (valid) {
            // api at /api/create/message
            let data = {
              "name": pubForm.value.name,
              "target": pubForm.value.target,
              "payload": pubForm.value.payload,
              "challenge": challenge.value,
              "validate": validate.value
            };
            axios.post('https://bbq.bjbybbs.com/api/create/message', data)
                .then(res => {
                  if (res.data.code == 0) {
                    ElNotification({
                      title: '提交成功',
                      message: '好耶！已经成功提交啦！现在你可以在主页看到你的表白卡。',
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
          } else {
            ElNotification({
              title: '校验失败',
              message: '你甚至没有填上必填的选项（',
              duration: 5000,
              type: 'error',
            })
          }
        })

      }
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
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: true
        }, function (captchaObj) {
          captchaObj.appendTo("#captcha");
          captchaObj.onSuccess(function () {
            isCaptchaSuccess.value = true;
            const result = captchaObj.getValidate();
            challenge.value = result.geetest_challenge;
            validate.value = result.geetest_validate;
          })
        })
      })
    })

    onBeforeUnmount(() => {
      proxy.$refs['captcha'].innerHTML = ''
    })

    return {
      isCaptchaSuccess,
      pubForm,
      pubRules,
      onSubmit,
    }
  },
})

</script>

<style lang="scss" scoped>

</style>
