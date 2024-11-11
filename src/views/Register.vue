<template>
  <div class="container display-c-c">
    <div class="conter">
      <div class="right">
        <div class="content">
          <img src="@/assets/startup-launch.png" alt="" />
          <div class="button" @click="goToLogin">登录</div>
          <div class="title">欢迎您的使用！</div>
        </div>
      </div>
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

          <div class="form-container">
            <el-form :model="form" ref="formRef" label-width="80px">
              <!-- 用户名输入框 -->
              <el-form-item label="用户名">
                <el-input
                  v-model="form.username"
                  placeholder="请填写账号"
                ></el-input>
              </el-form-item>

              <!-- 邮箱输入框 -->
              <el-form-item label="邮箱">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱"
                ></el-input>
              </el-form-item>

              <!-- 密码输入框 -->
              <el-form-item label="密码">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请填写密码"
                ></el-input>
              </el-form-item>

              <!-- 验证码输入框 -->
              <el-form-item label="验证码">
                <el-input v-model="form.code" placeholder="请输入验证码">
                  <template #append>
                    <span
                      @click="sendVerificationCode"
                      style="cursor: pointer; color: #377ffc"
                      v-if="!isCounting"
                      >发送验证码</span
                    >
                    <span v-else>{{ countdown }}秒</span>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 记住密码复选框 -->
              <el-form-item>
                <el-checkbox v-model="form.remember">记住密码</el-checkbox>
              </el-form-item>

              <!-- 提交按钮 -->
              <el-form-item>
                <el-button type="primary" @click="onSubmit">注册</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import "../styles/util.scss";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  setLocalStorageItem,
  getLocalStorageItem,
  clearLocalStorageItem,
} from "../util/localStorage";
import { debounce, throttle } from "../util/debounce";
import {
  registerUser,
  loginUser,
  requestLoginCode,
  registerWithCode,
  getUserProfile,
} from "../services/users";

const form = ref({
  username: "",
  password: "",
  email: "",
  code: "",
  remember: false,
});

const isEmailLogin = ref(false);
const toggleLoginMethod = () => {
  isEmailLogin.value = !isEmailLogin.value;
};
const router = useRouter();
const goToLogin = () => {
  router.push("/login"); // 跳转到注册页面
};
// 页面加载时检查localStorage并填充用户名和密码
onMounted(() => {
  const savedUsername = getLocalStorageItem("username");
  const savedPassword = getLocalStorageItem("password");

  if (savedUsername && savedPassword) {
    form.value.username = savedUsername;
    form.value.password = savedPassword;
    form.value.remember = true; // 设置“记住密码”复选框为选中状态
  }
});

// 倒计时相关状态
const countdown = ref(60);
const isCounting = ref(false);
let timer;
// 发送验证码并启动倒计时
const sendVerificationCode = throttle(async () => {
  if (isCounting.value) return;

  try {
    await registerWithCode({
      username: form.value.username,
      email: form.value.email,
      name: form.value.username,
      password: form.value.password,
    });
    ElMessage({
      message: "验证码已发送",
      type: "success",
      duration: 3000,
    });

    countdown.value = 60;
    isCounting.value = true;
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer);
        isCounting.value = false;
      }
    }, 1000);
  } catch (error) {
    ElMessage({
      message: "发送验证码失败",
      type: "error",
      duration: 3000,
    });
    console.error("Error sending verification code:", error);
  }
}, 1000);

// 清除计时器
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
// 注册提交
const throttledOnSubmit = throttle(async () => {
  try {
    const response = await registerUser({
      username: form.value.username,
      password: form.value.password,
      name: form.value.username,
      email: form.value.email,
      confirmationCode: form.value.code,
    });

    if (response.code === 200) {
      const { accessToken, refreshToken, user } = response.data;
      setLocalStorageItem("accessToken", accessToken);
      setLocalStorageItem("refreshToken", refreshToken);
      setLocalStorageItem("user", user);

      ElMessage({
        message: response.msg,
        type: "success",
        duration: 3000,
      });

      if (form.value.remember) {
        setLocalStorageItem("username", form.value.username);
        setLocalStorageItem("password", form.value.password);
      } else {
        clearLocalStorageItem("username");
        clearLocalStorageItem("password");
      }
    }
  } catch (error) {
    if (error.response && error.response.data.code === 400) {
      ElMessage({
        message: error.response.data.msg,
        type: "error",
        duration: 3000,
      });
    } else {
      ElMessage({
        message: "注册失败，请检查您的账户信息",
        type: "error",
        duration: 3000,
      });
    }
  }
}, 1000);
// 绑定到提交按钮
const onSubmit = () => throttledOnSubmit();
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
      border-radius: 0 10px 10px 0;

      background: #ffffff;
      .fun {
        width: 86%;
        height: 80%;
        flex-direction: column;
        justify-content: space-around;
        .email,
        .password {
          width: 66%;
          border-radius: 30px;
          border: 1px solid #e1e1e1;
          padding: 2px 0;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 0;
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
          height: 60%;
        }
      }
    }
    .right {
      width: 50%;
      height: 100%;
      background: #eff3ff;
      border-radius: 10px 0 0 10px;
      img {
        width: 100%;
      }
      .button {
        width: 30%;
        background: #0088ff;
        height: 30px;
        border-radius: 6px;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        cursor: pointer;
      }
      .title {
        margin-top: 20px;
        font-size: 12px;
      }
    }
  }
}
</style>
