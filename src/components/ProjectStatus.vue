<!-- components/ProjectStatus.vue -->
<template>
  <el-descriptions class="margin-top" title="项目状态" :column="3" border>
    <el-descriptions-item label="单基因投影">
      <el-tag
        :type="projectStats.single_gene_projection === 1 ? 'success' : 'info'"
      >
        {{ projectStats.gene_set_projection === 1 ? "已完成" : "未开始" }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="基因集投影">
      <el-tag
        :type="projectStats.gene_set_projection === 1 ? 'success' : 'info'"
      >
        {{ projectStats.gene_set_projection === 1 ? "已完成" : "未开始" }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="聚类">
      <el-tag :type="projectStats.clustering === 1 ? 'success' : 'info'">
        {{ projectStats.clustering === 1 ? "已完成" : "未开始" }}
      </el-tag>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
defineProps({
  projectStats: {
    type: Object,
    required: true,
    default: () => ({
      single_gene_projection: 0,
      gene_set_projection: 0,
      clustering: 0,
    }),
  },
});
</script>
