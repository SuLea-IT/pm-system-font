<!-- components/CreateTask.vue -->
<template>
  <div>
    <!-- 新建任务按钮 -->
    <el-button type="primary" @click="showCreateTaskDialog">
      <el-icon><Plus /></el-icon>
      新建任务
    </el-button>

    <!-- 新建任务弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建任务"
      width="800px"
      destroy-on-close
    >
      <div class="task-dialog-content">
        <!-- 左侧目录树 -->
        <div class="directory-section">
          <h4>选择文件</h4>
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            :expand-on-click-node="true"
            :default-expanded-keys="expandedNodes"
            show-checkbox
            node-key="id"
            @check="handleCheckChange"
            class="custom-tree"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <div
                  class="node-content"
                  :class="{ 'is-directory': data.type === 'directory' }"
                >
                  <el-icon :size="18" class="node-icon">
                    <Folder v-if="data.type === 'directory'" />
                    <Document v-else-if="data.type === 'file'" />
                  </el-icon>
                  <el-tooltip
                    v-if="data.type === 'file'"
                    :content="data.filename"
                    placement="top"
                    :hide-after="0"
                  >
                    <span class="node-label">{{
                      truncateFileName(data.filename)
                    }}</span>
                  </el-tooltip>
                  <span v-else class="node-label">{{ data.name }}</span>
                </div>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 右侧任务选择 -->
        <div class="task-section">
          <h4>任务配置</h4>
          <el-form :model="taskForm" label-width="100px">
            <!-- 添加数据格式选择 -->
            <el-form-item label="数据格式" required>
              <el-select
                v-model="taskForm.dataFormat"
                placeholder="请选择数据格式"
              >
                <el-option label="格式0" :value="0" />
                <el-option label="格式1" :value="1" />
                <el-option label="格式2" :value="2" />
                <el-option label="格式3" :value="3" />
                <el-option label="格式4" :value="4" />
              </el-select>
            </el-form-item>
            <el-form-item label="任务类型" required>
              <el-select
                v-model="taskForm.taskType"
                placeholder="请选择任务类型"
              >
                <el-option label="单基因投影" :value="0" />
                <el-option label="基因集投影" :value="1" />
                <el-option label="聚类分析" :value="2" />
              </el-select>
            </el-form-item>

            <el-form-item label="任务名称" required>
              <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
            </el-form-item>

            <el-form-item label="已选文件">
              <el-scrollbar height="280px">
                <div v-if="selectedFiles.length === 0" class="no-files">
                  请在左侧选择文件
                </div>

                <!-- 已选文件列表部分 -->
                <el-tag
                  v-for="file in selectedFiles"
                  :key="file.id"
                  class="file-tag"
                  closable
                  @close="removeFile(file)"
                >
                  <el-tooltip
                    :content="file.filename"
                    placement="top"
                    :show-after="500"
                  >
                    <span>{{ truncateFileName(file.filename) }}</span>
                  </el-tooltip>
                </el-tag>
              </el-scrollbar>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="createTasks"
            :disabled="!canCreateTask"
          >
            创建任务
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Document, Folder, Plus } from "@element-plus/icons-vue";
import { getDirectoryTree } from "@/services/tree";
import { createTask } from "@/services/tasks";

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
});

// 状态变量
const dialogVisible = ref(false);
const treeData = ref([]);
const expandedNodes = ref([]);
const selectedFiles = ref([]);
const taskForm = ref({
  taskType: null,
  name: "",
  dataFormat: null, // 新增数据格式字段
});

// 树形配置
const treeProps = {
  label: (data) => data.name || data.filename,
  children: "children",
};
// 文件名截断函数
const truncateFileName = (fileName) => {
  if (fileName.length <= 8) return fileName;

  // 获取最后一个点的位置
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // 如果没有后缀名，直接截断
    return fileName.substring(0, 8) + "...";
  } else {
    // 获取后缀名（最多4个字符）
    const extension = fileName.slice(lastDotIndex - 4, lastDotIndex + 8);
    // 计算前面部分应该保留的长度（12 - 后缀长度）
    const nameLength = Math.max(1, 8 - extension.length);
    // 组合文件名
    return fileName.slice(0, nameLength) + "..." + extension;
  }
};
// 修改创建任务的方法
const createTasks = async () => {
  try {
    const taskData = {
      projectId: props.projectId,
      name: taskForm.value.name,
      taskType: taskForm.value.taskType,
      dataFormat: taskForm.value.dataFormat, // 添加数据格式
      fileIds: selectedFiles.value.map((file) => file.id),
    };
    const response = await createTask(taskData);
    if (response.code === 200) {
      ElMessage.success(response.msg || "任务创建成功");
      dialogVisible.value = false;
      emit("task-created");
    } else {
      throw new Error(response.msg || "任务创建失败");
    }
  } catch (error) {
    console.error("创建任务错误:", error);
    ElMessage.error(error.message || "创建任务失败");
  }
};
const formatFileName = (filename) => {
  if (filename.length > 12) {
    return filename.substring(0, 12) + "...";
  }
  return filename;
};
// 计算属性：是否可以创建任务
const canCreateTask = computed(() => {
  return (
    taskForm.value.taskType !== null &&
    taskForm.value.name &&
    taskForm.value.dataFormat !== null && // 添加数据格式验证
    selectedFiles.value.length > 0
  );
});
const treeRef = ref(null);
// 修改 handleFileCheck 函数
const handleFileCheck = (file, isChecked) => {
  console.log("File check:", isChecked); // 添加调试日志

  if (isChecked) {
    const exists = selectedFiles.value.some((f) => f.id === file.id);
    if (!exists) {
      const fileObj = {
        id: file.id,
        filename: file.filename, // 直接使用 filename
        filepath: file.filepath,
        type: "file",
      };
      selectedFiles.value.push(fileObj);
    }
  } else {
    const index = selectedFiles.value.findIndex((f) => f.id === file.id);
    if (index !== -1) {
      selectedFiles.value.splice(index, 1);
    }
  }
};
// 获取目录树数据
const fetchTreeData = async () => {
  try {
    const response = await getDirectoryTree(props.projectId);
    if (response.data) {
      const processNode = (node) => {
        const processedNode = {
          ...node,
          type: "directory",
          children: [],
        };
        // 处理子目录
        if (node.children) {
          processedNode.children = node.children.map((child) =>
            processNode(child)
          );
        }
        // 处理文件
        if (node.files && node.files.length > 0) {
          const processedFiles = node.files.map((file) => ({
            ...file,
            type: "file",
            filename: file.filename || file.name,
          }));
          processedNode.children.push(...processedFiles);
        }
        return processedNode;
      };

      treeData.value = response.data.map((node) => processNode(node));

      // 收集所有目录节点的 ID
      const collectAllDirectoryIds = (nodes) => {
        let ids = [];
        nodes.forEach((node) => {
          if (node.type === "directory") {
            ids.push(node.id);
            if (node.children) {
              ids = [...ids, ...collectAllDirectoryIds(node.children)];
            }
          }
        });
        return ids;
      };

      expandedNodes.value = collectAllDirectoryIds(treeData.value);
    }
  } catch (error) {
    console.error("获取目录树失败", error);
    ElMessage.error("获取目录树失败");
  }
};

const showCreateTaskDialog = async () => {
  // 重置状态
  selectedFiles.value = [];
  taskForm.value = {
    taskType: null,
    name: "",
    dataFormat: null, // 重置数据格式
  };
  dialogVisible.value = true;
  await fetchTreeData();
};

// 修改 handleCheckChange 函数，添加日志
const handleCheckChange = (data, checked) => {
  console.log("Check change:", data, checked);

  // 更新选中的文件列表
  const checkedNodes = checked.checkedNodes.filter(
    (node) => node.type === "file"
  );
  selectedFiles.value = checkedNodes.map((file) => ({
    id: file.id,
    filename: file.filename,
    filepath: file.filepath,
    type: "file",
  }));
};
// 移除已选文件
const removeFile = (file) => {
  treeRef.value?.setChecked(file.id, false);
};
// 处理目录选中
// 修改 handleDirectoryCheck 函数
const handleDirectoryCheck = (directory, isChecked) => {
  // 递归获取目录下所有文件
  const getAllFiles = (node) => {
    let files = [];
    if (node.type === "file") {
      files.push(node);
    } else if (node.children) {
      node.children.forEach((child) => {
        files = files.concat(getAllFiles(child));
      });
    }
    return files;
  };
  const files = getAllFiles(directory);

  files.forEach((file) => {
    // 更新树的选中状态
    treeRef.value?.setChecked(file.id, isChecked);
    // 更新 selectedFiles 数组
    handleFileCheck(file, isChecked);
  });
};

// 定义事件
const emit = defineEmits(["task-created"]);
</script>

<style scoped>
.task-dialog-content {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.directory-section,
.task-section {
  flex: 1;
  padding: 10px;
}

.directory-section {
  border-right: 1px solid #dcdfe6;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-tag {
  margin: 4px;
  display: inline-flex;
  align-items: center;
}

.no-files {
  color: #909399;
  text-align: center;
  padding: 20px;
}

.custom-tree {
  margin-top: 10px;
}
</style>
