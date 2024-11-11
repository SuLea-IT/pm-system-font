<!-- MainLayout.vue -->
<template>
  <div>
    <Navbar />
    <el-container>
      <Aside />
      <el-main>
        <div class="el-main-div">
          <TabsView />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import Navbar from "../components/Navbar.vue";
import Aside from "../components/Aside.vue";
import TabsView from "../components/TabsView.vue"; // 引入 TabsView 组件
</script>

<style scoped>
.el-main {
  height: calc(100vh - 74px);
  padding: 0;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-main-div {
  display: flex;
  width: 80%;
  flex-direction: column;
  align-items: center;
  height: 94%;
  background: #fff;
  padding: 0 130px;
}
</style>
