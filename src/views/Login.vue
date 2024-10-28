<template>
  <div class="container display-c-c">
    <div class="conter">
      <div class="left display-c-c">
        <div class="fun display-c-c">
          <div class="logo">
            <div class="svg">
              <svg
                height="512"
                viewBox="0 0 192 192"
                width="512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m155.109 74.028a4 4 0 0 0 -3.48-2.028h-52.4l8.785-67.123a4.023 4.023 0 0 0 -7.373-2.614l-63.724 111.642a4 4 0 0 0 3.407 6.095h51.617l-6.962 67.224a4.024 4.024 0 0 0 7.411 2.461l62.671-111.63a4 4 0 0 0 .048-4.027z"
                ></path>
              </svg>
            </div>
            <div class="text">注册</div>
          </div>
          <div class="email display-c-c" @click="toggleLoginMethod">
            <div class="svg">
              <svg
                t="1730085289654"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="10420"
                width="32"
                height="32"
              >
                <path
                  d="M0.234057 508.679314C0.234057 789.562514 227.913143 1017.270857 508.781714 1017.270857c280.868571 0 508.576914-227.693714 508.576915-508.576914 0-280.868571-227.693714-508.562286-508.576915-508.562286C227.927771 0.117029 0.234057 227.810743 0.234057 508.679314z"
                  fill="#ffffff"
                  p-id="10421"
                  data-spm-anchor-id="a313x.search_index.0.i1.7cb13a81zrHcE6"
                  class="selected"
                ></path>
                <path
                  d="M486.546286 576.570514a43.593143 43.593143 0 0 0 60.357485 0l225.821258-219.428571v308.575086a42.101029 42.101029 0 0 1-42.686172 41.486628H303.352686a42.057143 42.057143 0 0 1-42.627657-41.486628V357.141943l225.835885 219.428571z"
                  fill="#377FFC"
                  p-id="10422"
                ></path>
                <path
                  d="M753.181257 320.058514L532.333714 534.6304a23.054629 23.054629 0 0 1-31.934171 0L279.815314 320.292571a42.920229 42.920229 0 0 1 23.6544-6.977828h426.627657a43.885714 43.885714 0 0 1 22.908343 6.685257h0.175543v0.058514z"
                  fill="#ABC6F6"
                  p-id="10423"
                ></path>
              </svg>
            </div>
            使用邮箱登录
          </div>
          <div class="form-container">
            <el-form :model="form" ref="formRef" label-width="80px">
              <!-- 用户名输入框 -->
              <el-form-item label="用户名" v-if="!isEmailLogin">
                <el-input
                  v-model="form.username"
                  placeholder="请填写账号"
                ></el-input>
              </el-form-item>

              <!-- 邮箱输入框 -->
              <el-form-item label="邮箱" v-if="isEmailLogin">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱"
                ></el-input>
              </el-form-item>

              <!-- 密码输入框 -->
              <el-form-item label="密码" v-if="!isEmailLogin">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请填写密码"
                ></el-input>
              </el-form-item>

              <!-- 验证码输入框 -->
              <el-form-item label="验证码" v-if="isEmailLogin">
                <el-input v-model="form.code" placeholder="请输入验证码">
                  <template #append>
                    <span
                      @click="sendVerificationCode"
                      style="cursor: pointer; color: #377ffc"
                    >
                      发送验证码
                    </span>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 记住密码复选框 -->
              <el-form-item>
                <el-checkbox v-model="form.remember">记住密码</el-checkbox>
              </el-form-item>

              <!-- 提交按钮 -->
              <el-form-item>
                <el-button type="primary" @click="onSubmit">提交</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "../styles/util.scss";

// 表单数据
const form = ref({
  username: "",
  password: "",
  email: "",
  code: "",
  remember: false,
});

// 切换登录方式
const isEmailLogin = ref(false);
const toggleLoginMethod = () => {
  isEmailLogin.value = !isEmailLogin.value;
};

// 页面加载时检查localStorage并填充数据
onMounted(() => {
  const savedUsername = localStorage.getItem("username");
  const savedPassword = localStorage.getItem("password");

  if (savedUsername && savedPassword) {
    form.value.username = savedUsername;
    form.value.password = savedPassword;
    form.value.remember = true;
  }
});

// 提交表单
const onSubmit = () => {
  console.log("Form submitted:", form.value);

  // 处理记住密码功能
  if (form.value.remember) {
    localStorage.setItem("username", form.value.username);
    localStorage.setItem("password", form.value.password);
  } else {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  }
};

// 发送验证码
const sendVerificationCode = () => {
  console.log("Sending verification code to:", form.value.email);
  // 在这里实现验证码发送逻辑
};
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;

  .conter {
    width: 900px;
    height: 500px;
    display: flex;
    flex-direction: row;
    .left {
      width: 50%;
      height: 100%;
      background: #ffffff;
      .fun {
        width: 80%;
        height: 80%;
        flex-direction: column;
        justify-content: space-around;
        .email {
          width: 66%;
          border-radius: 30px;
          border: 1px solid #e1e1e1;
          padding: 2px 0;
          font-size: 12px;
          cursor: pointer;
        }
        .logo {
          height: 100px;
          width: 300px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          svg {
            height: 40px;
            width: 40px;
            fill: #5138ee;
          }
          .text {
            font-size: 32px;
          }
        }
        .form-container {
          width: 80%;
        }
      }
    }
    .right {
      width: 50%;
      height: 100%;
      background: #eff3ff;
    }
  }
}
</style>
