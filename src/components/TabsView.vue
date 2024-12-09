<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = ref([
  {
    label: "用户管理",
    name: "用户管理", // 与 routes 中的 name 一致
    closable: false,
  },
  {
    label: "项目管理",
    name: "项目管理", // 与 routes 中的 name 一致
    closable: false,
  },
  {
    label: "项目列表",
    name: "项目列表", // 添加项目列表标签
    closable: false,
  },
]);

const activeTab = ref(route.name); // 设置当前激活的 tab

// 切换标签页
// 修改 watch activeTab 的逻辑
watch(activeTab, (newTab) => {
  if (route.name !== newTab) {
    const targetTab = tabs.value.find((tab) => tab.name === newTab);
    if (targetTab && targetTab.name === "项目信息") {
      // 检查是否有 id
      const id = targetTab.id || targetTab.label.match(/\((\d+)\)/)?.[1];
      if (id) {
        router.push({ name: newTab, params: { id } });
      } else {
        // 如果没有 id，回退到项目列表
        activeTab.value = "项目列表";
        router.push({ name: "项目列表" });
      }
    } else {
      router.push({ name: newTab });
    }
  }
});
// 修改切换标签页的方法
const changeTab = (tab) => {
  try {
    const targetTab = tabs.value.find((t) => t.name === tab.paneName);
    if (activeTab.value !== tab.paneName) {
      if (targetTab && targetTab.name === "项目信息") {
        // 从标签的 label 中提取项目 ID
        const id = targetTab.id || targetTab.label.match(/\((\d+)\)/)?.[1];
        if (id) {
          activeTab.value = tab.paneName;
          router.push({ name: "项目信息", params: { id } });
        } else {
          // 如果没有 id，不执行切换
          console.warn("无效的项目信息标签：缺少项目ID");
          return;
        }
      } else {
        activeTab.value = tab.paneName;
        router.push({ name: tab.paneName });
      }
    }
  } catch (error) {
    console.error("标签页切换错误:", error);
    // 发生错误时回退到安全的页面
    activeTab.value = "项目列表";
    router.push({ name: "项目列表" });
  }
};
// 修改移除标签页的方法
const removeTab = (tabName) => {
  const tabIndex = tabs.value.findIndex((tab) => tab.name === tabName);
  const removedTab = tabs.value[tabIndex];
  tabs.value.splice(tabIndex, 1);
  if (activeTab.value === tabName) {
    const newActiveTab = tabs.value[tabIndex - 1] || tabs.value[0];
    activeTab.value = newActiveTab.name;
    if (newActiveTab.name === "项目信息") {
      const id = newActiveTab.id || newActiveTab.label.match(/\((\d+)\)/)?.[1];
      if (id) {
        router.push({
          name: newActiveTab.name,
          params: { id },
        });
      } else {
        // 如果没有有效的 ID，跳转到项目列表
        activeTab.value = "项目列表";
        router.push({ name: "项目列表" });
      }
    } else {
      router.push({ name: newActiveTab.name });
    }
  }
};
// 修改添加标签页的方法
const addTab = (route) => {
  try {
    const isProjectInfo = route.name === "项目信息";
    if (isProjectInfo && !route.params.id) {
      console.warn("添加项目信息标签时缺少ID参数");
      return;
    }
    const tabName = isProjectInfo ? `项目信息-${route.params.id}` : route.name;
    const existingTab = tabs.value.find((tab) => {
      if (isProjectInfo) {
        return tab.label === `项目信息(${route.params.id})`;
      }
      return tab.name === route.name;
    });
    if (existingTab) {
      activeTab.value = existingTab.name;
    } else {
      const label = isProjectInfo ? `项目信息(${route.params.id})` : route.name;
      tabs.value.push({
        label,
        name: route.name,
        closable: true,
        id: route.params.id,
      });
      activeTab.value = route.name;
    }
  } catch (error) {
    console.error("添加标签页错误:", error);
  }
};
// 监听当前路由变化，动态添加标签页
watch(
  () => route.name,
  () => {
    addTab(route);
  },
  { immediate: true }
);
</script>
<template>
  <div class="tab-container">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-remove="removeTab"
      @tab-click="changeTab"
      class="custom-tabs"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
        :closable="tab.closable"
      >
        <template #label>
          <span class="tab-label">
            <!-- 可以根据不同的tab添加不同的图标 -->
            <el-icon class="tab-icon"><Document /></el-icon>
            {{ tab.label }}
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
  <div class="content-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
<style lang="scss" scoped>
.tab-container {
  background-color: #fff;
  padding: 6px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.custom-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none;

    .el-tabs__nav {
      border: none;
      border-radius: 4px;
    }
    .el-tabs__item {
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      border: 1px solid #e4e7ed;
      margin-right: 5px;
      border-radius: 4px;
      transition: all 0.3s;

      &:not(.is-active):hover {
        background-color: #f5f7fa;
        color: #1890ff;
      }

      &.is-active {
        background-color: #1890ff;
        border-color: #1890ff;
        color: #fff;

        .tab-icon {
          color: #fff;
        }
      }

      .tab-label {
        display: flex;
        align-items: center;
        font-size: 14px;

        .tab-icon {
          margin-right: 6px;
          font-size: 16px;
        }
      }
    }
    .el-tabs__nav-wrap::after {
      display: none;
    }
  }
}
.content-container {
  padding: 20px;
  background-color: #f0f2f5;
  // min-height: calc(100vh - 180px);
  width: 100%;
}
// 路由切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
// 关闭按钮样式
:deep(.el-tabs__item) {
  .el-icon-close {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: #ff4d4f;
    }
  }

  &.is-active {
    .el-icon-close {
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}
</style>
