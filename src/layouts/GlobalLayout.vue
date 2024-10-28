<template>
  <div>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import Navbar from "../components/Navbar.vue";
</script>

<style scoped>
.el-main {
  padding: 0;
  background-color: #dcdefe;
}
</style>
