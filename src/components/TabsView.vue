<template>
  <div class="tab-div">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-remove="removeTab"
      @tab-click="changeTab"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
        :closable="tab.closable"
      >
      </el-tab-pane>
    </el-tabs>
  </div>
  <router-view />
</template>

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
]);

const activeTab = ref(route.name); // 设置当前激活的 tab

// 动态添加标签页
const addTab = (route) => {
  const existingTab = tabs.value.find((tab) => tab.name === route.name);
  if (existingTab) {
    activeTab.value = existingTab.name;
  } else {
    // 使用 route.name 作为 label 和 name 以确保一致
    tabs.value.push({
      label: route.name,
      name: route.name,
      closable: true,
    });
    activeTab.value = route.name;
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

// 切换标签页
const changeTab = (tab) => {
  if (activeTab.value !== tab.name) {
    activeTab.value = tab.name;
    if (tab.name === "项目信息") {
      // 如果跳转到 "项目信息" 标签页，确保带上 id
      router.push({ name: "项目信息", params: { id: route.params.id } });
    } else {
      router.push({ name: tab.name });
    }
  }
};

// 监听 activeTab 的变化，确保每次更新标签时导航到正确的路径
watch(activeTab, (newTab) => {
  if (route.name !== newTab) {
    router.push({ name: newTab });
  }
});

// 移除标签页
const removeTab = (tabName) => {
  const tabIndex = tabs.value.findIndex((tab) => tab.name === tabName);
  tabs.value.splice(tabIndex, 1);

  // 如果关闭的是当前激活的标签页，自动切换到前一个标签
  if (activeTab.value === tabName) {
    const newActiveTab = tabs.value[tabIndex - 1] || tabs.value[0];
    activeTab.value = newActiveTab.name;
    router.push({ name: newActiveTab.name });
  }
};
</script>

<style lang="scss" scoped>
.tab-div {
  width: 100%;
  padding: 10px 0;
}
</style>
