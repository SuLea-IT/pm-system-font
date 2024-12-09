<template>
  <el-aside width="200px" class="aside">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical-demo"
      @select="handleSelect"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#ffffff"
    >
      <el-menu-item index="1">
        <el-icon><UserFilled /></el-icon>
        <span>{{ routeNames["1"] }}</span>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><Document /></el-icon>
        <span>{{ routeNames["2"] }}</span>
      </el-menu-item>
      <!-- 添加任务列表菜单项 -->
      <el-menu-item index="4">
        <el-icon><List /></el-icon>
        <span>{{ routeNames["4"] }}</span>
      </el-menu-item>
      <el-sub-menu v-if="isAdmin" index="3">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>{{ routeNames["3"] }}</span>
        </template>
        <el-menu-item index="3-1">
          <el-icon><User /></el-icon>
          <span>{{ routeNames["3-1"] }}</span>
        </el-menu-item>
        <el-menu-item index="3-2">
          <el-icon><Folder /></el-icon>
          <span>{{ routeNames["3-2"] }}</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const activeMenu = ref("1");

// 获取本地存储中的角色（假设角色保存在 localStorage 中）
const role = localStorage.getItem("role"); // 角色，假设 '0' 是管理员，'1' 是普通用户

// 判断当前用户是否为管理员
const isAdmin = ref(role === "0");

// 将菜单项的索引与路径映射
const menuRoutes = {
  1: "/login",
  2: "/project",
  4: "/task", // 添加任务列表路由
  "3-1": "/sys",
  "3-2": "/sys/projectSys",
};
// 更新反向映射
const pathToIndex = {
  "/login": "1",
  "/project": "2",
  "/task": "4", // 添加任务列表映射
  "/sys": "3-1",
  "/sys/projectSys": "3-2",
};

// 路由名称映射（用于动态渲染菜单项文本）
const routeNames = {
  1: "登录",
  2: "项目",
  3: "系统管理",
  4: "任务列表", // 添加任务列表名称
  "3-1": "用户管理",
  "3-2": "项目管理",
};

// 修改 setActiveMenu 方法来处理任务列表路由
const setActiveMenu = () => {
  const currentPath = route.path;
  if (currentPath.startsWith("/project/")) {
    activeMenu.value = "2";
  } else if (currentPath.startsWith("/task")) {
    activeMenu.value = "4";
  } else {
    activeMenu.value = pathToIndex[currentPath] || "1";
  }
};
onMounted(() => {
  setActiveMenu();
});

// 监听路由变化，动态更新高亮项
watch(
  () => route.fullPath, // 使用 fullPath 以确保监听完整路径变化
  () => {
    setActiveMenu();
  }
);

const handleSelect = (index) => {
  activeMenu.value = index;
  const path = menuRoutes[index];
  if (path) {
    router.push(path);
  }
};
</script>

<style scoped lang="scss">
.aside {
  background-color: #304156;
  height: calc(100vh - 74px);
  transition: width 0.3s;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.el-menu {
  border-right: none;

  :deep(.el-menu-item) {
    height: 56px;
    line-height: 56px;
    padding: 0 20px !important;

    &:hover {
      background-color: #263445 !important;
    }

    &.is-active {
      background-color: #1890ff !important;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #ffffff;
      }
    }
  }
  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      height: 56px;
      line-height: 56px;
      padding: 0 20px !important;
      color: #bfcbd9;

      &:hover {
        background-color: #263445 !important;
      }
    }

    .el-menu-item {
      background: #1f2d3d;
      padding-left: 40px !important;

      &:hover {
        background-color: #001528 !important;
      }
    }
  }
}
// 图标样式
.el-icon {
  vertical-align: middle;
  margin-right: 10px;
  width: 24px;
  text-align: center;
}
// 文字样式
span {
  vertical-align: middle;
  font-size: 14px;
}
</style>