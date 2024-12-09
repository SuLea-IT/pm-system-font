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
            <div class="text">登录</div>
          </div>
          <div
            class="email display-c-c"
            @click="toggleLoginMethod"
            v-if="!isEmailLogin"
          >
            <div class="svg">
              <svg
                t="1730160293150"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="21810"
                width="24"
                height="24"
              >
                <path
                  d="M466.08 62.56L63.52 344.64a79.776 79.776 0 0 0-34.08 65.44v406.08c0 88.32 71.68 159.84 160 159.84h645.28c88.32 0 160-71.52 160-159.84V410.08c0-26.08-12.64-50.4-34.08-65.44L557.92 62.56a79.872 79.872 0 0 0-91.84 0z"
                  fill="#2166CC"
                  p-id="21811"
                ></path>
                <path
                  d="M752 928H272c-52.96 0-96-43.04-96-96V416.64c0-52.96 43.04-96 96-96h480c52.96 0 96 43.04 96 96V832c0 53.12-43.04 96-96 96z"
                  fill="#FFFFFF"
                  p-id="21812"
                ></path>
                <path
                  d="M78.72 931.36A159.04 159.04 0 0 0 189.44 976h645.28c88.32 0 160-71.52 160-159.84V410.08c0-3.04-0.16-6.24-0.64-9.28L78.72 931.36z"
                  fill="#4E8DF6"
                  p-id="21813"
                ></path>
                <path
                  d="M30.08 400.8c-0.32 3.04-0.64 6.08-0.64 9.28v406.08c0 88.32 71.68 159.84 160 159.84h645.28a159.04 159.04 0 0 0 110.72-44.64L30.08 400.8z"
                  fill="#629FF9"
                  p-id="21814"
                ></path>
                <path
                  d="M366.72 496.48h-64c-8.8 0-16-7.2-16-16v-63.84c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16v63.84c0 8.8-7.2 16-16 16z"
                  fill="#4E8DF6"
                  p-id="21815"
                ></path>
                <path
                  d="M606.72 432.48h-160c-8.8 0-16-7.2-16-16s7.2-16 16-16h160c8.8 0 16 7.2 16 16s-7.2 16-16 16zM702.72 496.48h-256c-8.8 0-16-7.2-16-16s7.2-16 16-16h256c8.8 0 16 7.2 16 16s-7.2 16-16 16z"
                  fill="#E1E1DF"
                  p-id="21816"
                ></path>
              </svg>
            </div>
            使用邮箱登录
          </div>
          <div
            class="password display-c-c"
            @click="toggleLoginMethod"
            v-if="isEmailLogin"
          >
            <div class="svg">
              <svg
                t="1730160166775"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="7098"
                width="24"
                height="24"
              >
                <path
                  d="M757.248 358.4v-0.512h-5.632v-0.512c0-132.608-107.52-240.128-240.128-240.128S271.36 224.768 271.36 357.376v0.512h-4.608v0.512c-73.216 8.704-130.56 71.68-130.56 146.944v253.44c0 81.408 66.56 148.48 148.48 148.48h453.632c81.408 0 148.48-66.56 148.48-148.48V505.344c0-75.264-56.32-137.728-129.536-146.944z m-404.992-1.024v-1.024c0-42.496 16.896-82.432 47.104-112.64 30.208-30.208 70.656-46.592 113.152-46.592s82.944 16.384 113.152 47.104c30.208 30.208 46.592 70.144 47.104 112.64v1.024l-320.512-0.512c-0.512 0 0 0 0 0z m454.656 401.408c0 17.92-7.168 35.328-19.968 48.128s-30.208 19.968-48.128 19.968H285.184c-17.92 0-35.328-7.168-48.128-19.968s-19.968-30.208-19.968-48.128V505.344c0-34.304 26.112-63.488 59.904-67.584h470.016c33.792 4.096 59.904 33.28 59.904 67.584v253.44z"
                  fill="#4A5FE2"
                  p-id="7099"
                ></path>
                <path
                  d="M512 502.784c-41.472 0-74.752 33.792-74.752 74.752 0 26.624 13.824 50.176 34.816 63.488v81.92c0 22.016 17.92 39.936 39.936 39.936s39.936-17.92 39.936-39.936v-81.92c20.992-13.312 34.816-36.864 34.816-63.488 0-40.96-33.28-74.752-74.752-74.752z"
                  fill="#7c44e2"
                  p-id="7100"
                ></path>
              </svg>
            </div>
            使用密码登录
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
                <el-button type="primary" @click="onSubmit">登录</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="content">
          <img src="@/assets/startup-launch.png" alt="" />
          <div class="button" @click="goToRegister">注册</div>
          <div class="title">欢迎您的使用！</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import "../styles/util.scss";
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
  loginCode,
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
const router = useRouter();
const isEmailLogin = ref(false);
const toggleLoginMethod = () => {
  isEmailLogin.value = !isEmailLogin.value;
};
const goToRegister = () => {
  router.push("/register"); // 跳转到注册页面
};

// 页面加载时检查localStorage并填充用户名和密码
onMounted(() => {
  const user = getLocalStorageItem("user");
  if (user) {
    router.push("/project");
    return; // 跳转后不继续执行后续代码
  }

  const savedUsername = getLocalStorageItem("username");
  const savedPassword = getLocalStorageItem("password");
  const savedRemember = getLocalStorageItem("remember");
  console.log(savedRemember);

  console.log(savedRemember);

  if (savedRemember === true) {
    form.value.username = savedUsername || "";
    form.value.password = savedPassword || "";
    form.value.remember = true; // Check the "Remember Password" box
  }
});

// 倒计时相关状态
const countdown = ref(60);
const isCounting = ref(false);
let timer;
const sendVerificationCode = throttle(async () => {
  if (isCounting.value) return;

  try {
    await requestLoginCode(form.value.username);
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

// 登录提交（包裹在节流函数中）
const throttledOnSubmit = throttle(async () => {
  try {
    let response;
    if (!isEmailLogin.value) {
      response = await loginUser({
        username: form.value.username,
        password: form.value.password,
      });
    } else {
      response = await loginCode({
        username: form.value.username,
        confirmationCode: form.value.code,
      });
    }

    if (response.code === 200) {
      const { accessToken, refreshToken, user } = response.data;
      setLocalStorageItem("accessToken", accessToken);
      setLocalStorageItem("refreshToken", refreshToken);
      setLocalStorageItem("user", user);
      setLocalStorageItem("role", user.role);

      ElMessage({
        message: response.msg || "登录成功",
        type: "success",
        duration: 3000,
      });
      router.push("/project");

      // 如果选中“记住密码”，保存用户名和密码
      if (form.value.remember) {
        setLocalStorageItem("username", form.value.username);
        setLocalStorageItem("password", form.value.password);
        setLocalStorageItem("remember", true);
      } else {
        clearLocalStorageItem("username");
        clearLocalStorageItem("password");
        clearLocalStorageItem("remember");
      }
    }
  } catch (error) {
    if (error.response && error.response.data.code === 403) {
      ElMessage({
        message: error.response.data.msg || "您的账户已被封禁，请联系管理员",
        type: "error",
        duration: 3000,
      });
    } else {
      ElMessage({
        message: "登录失败，请检查您的账户信息",
        type: "error",
        duration: 3000,
      });
    }
  }
}, 1000); // 3秒内只允许触发一次

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
      background: #ffffff;
      border-radius: 10px 0 0 10px;
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
          height: 50%;
        }
      }
    }
    .right {
      width: 50%;
      height: 100%;
      background: #eff3ff;
      border-radius: 0 10px 10px 0;
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
