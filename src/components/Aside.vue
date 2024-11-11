<template>
  <el-aside width="200px" class="aside">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical-demo"
      @select="handleSelect"
    >
      <!-- 动态生成菜单项 -->
      <el-menu-item index="1">{{ routeNames["1"] }}</el-menu-item>
      <el-menu-item index="2">{{ routeNames["2"] }}</el-menu-item>

      <!-- 系统管理带有子菜单 -->
      <el-sub-menu index="3">
        <template #title>{{ routeNames["3"] }}</template>
        <el-menu-item index="3-1">{{ routeNames["3-1"] }}</el-menu-item>
        <el-menu-item index="3-2">{{ routeNames["3-2"] }}</el-menu-item>
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

// 将菜单项的索引与路径映射
const menuRoutes = {
  1: "/login",
  2: "/project",
  "3-1": "/sys", // 用户管理路径
  "3-2": "/sys/projectSys", // 确保路径正确
};

// 路径与菜单索引的映射（反向映射）
const pathToIndex = {
  "/login": "1",
  "/project": "2",
  "/sys": "3-1", // 用户管理路径
  "/sys/projectSys": "3-2", // 项目管理路径（改为完整路径）
};

// 路由名称映射（用于动态渲染菜单项文本）
const routeNames = {
  1: "登录",
  2: "项目",
  3: "系统管理",
  "3-1": "用户管理",
  "3-2": "项目管理",
};

// 设置 activeMenu 初始值
const setActiveMenu = () => {
  const currentPath = route.path;
  activeMenu.value = pathToIndex[currentPath] || "1"; // 如果路径没有匹配，默认高亮首页
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
}

.el-menu {
  .el-sub-menu {
    background: #304156;
    ::v-deep .el-sub-menu__title {
      color: #fff !important;
    }
  }

  ::v-deep .is-active {
    background: #5d89c3 !important;
  }
  .el-menu-item {
    background: #304156;
    color: #fff;
  }
  .el-menu-vertical-demo {
    background-color: #304156;
    border-right: none;
    .el-menu-item {
      background: #000;
      color: #fff;
    }
  }
}
</style>
