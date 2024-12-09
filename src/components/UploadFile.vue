<template>
  <div class="upload-wrapper">
    <!-- 上传按钮 -->
    <el-button type="primary" :icon="Upload" @click="showUploadDialog">
      上传文件
    </el-button>

    <!-- 上传文件弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文件"
      width="400px"
      class="upload-dialog"
    >
      <el-form label-width="90px">
        <!-- 目录选择 -->
        <el-form-item label="选择目录" required>
          <div class="directory-tree-container">
            <el-tree
              ref="directoryTreeRef"
              :data="directoryTree"
              node-key="id"
              :props="{ label: 'name' }"
              @node-click="handleDirectorySelect"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <el-icon><Folder /></el-icon>
                  <span class="node-label">{{ node.label }}</span>
                  <el-tag
                    v-if="selectedDirectory === data.id"
                    size="small"
                    type="success"
                    effect="light"
                    class="selected-tag"
                  >
                    已选择
                  </el-tag>
                </div>
              </template>
            </el-tree>
          </div>
        </el-form-item>

        <!-- 文件上传区域 -->
        <el-form-item v-if="selectedDirectory" label="上传文件">
          <BatchUpload
            :projectId="projectId"
            :userId="userId"
            :directoryId="selectedDirectory"
            @uploadComplete="handleUploadComplete"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { Upload, Folder } from "@element-plus/icons-vue";
import BatchUpload from "@/components/BatchUpload.vue";
import { getDirectory } from "@/services/tree";

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
  userId: {
    type: [String, Number],
    required: true,
  },
});

// 控制弹窗显示
const uploadDialogVisible = ref(false);
const selectedDirectory = ref(null);
const directoryTree = ref([]);
const emit = defineEmits(['refreshTree']);
const handleUploadComplete = () => {
  uploadDialogVisible.value = false;
  emit('refreshTree'); // 向上传递刷新树的事件
};
// 显示上传弹窗
const showUploadDialog = async () => {
  uploadDialogVisible.value = true;
  selectedDirectory.value = null;
  await getDirectoryTree();
};

// 获取目录树数据
const getDirectoryTree = async () => {
  try {
    const res = await getDirectory(props.projectId);
    directoryTree.value = res.data;
  } catch (error) {
    console.error("获取目录树失败:", error);
    ElMessage.error("获取目录树失败");
  }
};

// 选择目录
const handleDirectorySelect = (dir) => {
  selectedDirectory.value = dir.id;
};
</script>

<style scoped>
.upload-wrapper {
  display: inline-block;
}

.upload-dialog :deep(.el-dialog__body) {
  padding: 20px 25px;
  max-height: 70vh;
  overflow-y: auto;
}

.directory-tree-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.directory-tree-container::-webkit-scrollbar {
  width: 6px;
}

.directory-tree-container::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

.directory-tree-container::-webkit-scrollbar-track {
  background-color: #f0f2f5;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  width: 100%;
}

.custom-tree-node .el-icon {
  color: #909399;
}

.node-label {
  flex: 1;
  margin-right: 8px;
}

.selected-tag {
  margin-left: auto;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f0f7ff;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #ecf5ff;
}
:deep(.el-tree) {
  min-height: 100px;
  max-height: 100px;
  width: 200px;
}
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
