<script setup>
import { ref, onMounted } from "vue";
import {
  getDirectoryTree,
  createDirectory,
  renameDirectory,
  deleteDirectory as deleteDirectoryServices,
} from "@/services/tree"; // 导入封装好的服务

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
});

const treeData = ref([]); // 目录树数据
const expandedNodes = ref([]); // 用于存储已展开的节点

const treeProps = {
  label: (data) => data.name || data.filename, // 使用函数来处理不同类型节点的显示
  children: "children", // 只需要指定children即可，files会作为独立节点处理
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

const deleteDialogVisible = ref(false); // 控制删除目录弹窗显示
const deleteData = ref({ id: null, name: "" }); // 存储要删除的目录信息

// 打开删除目录弹窗
const openDeleteDialog = (data) => {
  deleteData.value = { id: data.id, name: data.name }; // 保存要删除的目录信息
  deleteDialogVisible.value = true; // 显示删除确认弹窗
};

// 删除目录
const deleteDirectory = async () => {
  try {
    const response = await deleteDirectoryServices(deleteData.value.id); // 调用删除接口
    if (response.code === 200) {
      // 删除目录后，更新树数据
      const parent = findNodeById(treeData.value, deleteData.value.parentId);
      if (parent) {
        parent.children = parent.children.filter(
          (child) => child.id !== deleteData.value.id
        );
      }
      deleteDialogVisible.value = false; // 关闭弹窗
      fetchTreeData(); // 更新目录树
    }
  } catch (error) {
    console.error("删除目录失败", error);
  }
};
const openAddRootDialog = () => {
  newDirName.value = ""; // 清空输入框
  addDialogVisible.value = true;
  renameData.value.parentId = null; // 根目录的parentId设为0或null
};
// 控制弹窗显示
const addDialogVisible = ref(false); // 控制新建目录弹窗显示
const renameDialogVisible = ref(false); // 控制重命名目录弹窗显示
const newDirName = ref(""); // 新建目录的名称
const renameData = ref({ id: null, newName: "" }); // 用于重命名目录
// 获取目录树数据
const fetchTreeData = async () => {
  try {
    const response = await getDirectoryTree(props.projectId);
    console.log(response.data);
    if (response.data) {
      // 处理数据，将文件转换为节点
      const processNode = (node) => {
        // 处理目录节点
        if (node.children) {
          node.children = node.children.map((child) => processNode(child));
        }
        // 将文件转换为节点并添加到children中
        if (node.files && node.files.length > 0) {
          if (!node.children) node.children = [];
          node.children.push(...node.files);
        }
        return node;
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

      // 设置所有目录节点为展开状态
      expandedNodes.value = collectAllDirectoryIds(treeData.value);
    }
  } catch (error) {
    console.error("获取目录树失败", error);
  }
};

// 目录展开或折叠的逻辑
const expandDirectory = (data) => {
  const isExpanded = expandedNodes.value.includes(data.id);

  if (isExpanded) {
    // 如果节点已展开，折叠它
    expandedNodes.value = expandedNodes.value.filter((id) => id !== data.id);
  } else {
    // 如果节点未展开，展开它
    expandedNodes.value.push(data.id);
  }
};

// 点击树节点时的处理
const handleNodeClick = (data, node) => {
  if (data.type === "directory") {
    const isExpanded = expandedNodes.value.includes(data.id);
    if (isExpanded) {
      expandedNodes.value = expandedNodes.value.filter((id) => id !== data.id);
    } else {
      expandedNodes.value.push(data.id);
    }
  } else if (data.type === "file") {
    // 处理文件点击
    console.log("Clicked file:", data.filename);
  }
};

// 打开新建目录弹窗
const openAddDialog = (parentData) => {
  newDirName.value = ""; // 清空输入框
  addDialogVisible.value = true;
  renameData.value.parentId = parentData.id; // 保存父目录ID
};

// 打开重命名目录弹窗
const openRenameDialog = (data) => {
  renameData.value.id = data.id;
  renameData.value.newName = data.name; // 回显当前名称
  renameDialogVisible.value = true;
};

// 新建下级目录
// 修改addDirectory方法，处理根目录的情况
const addDirectory = async () => {
  try {
    const response = await createDirectory({
      projectId: props.projectId,
      parentId: renameData.value.parentId,
      name: newDirName.value,
      userId: 1,
    });
    if (response.code == 200) {
      if (renameData.value.parentId === 0) {
        // 如果是根目录，直接添加到treeData
        treeData.value.push(response.data);
      } else {
        // 原有的添加子目录逻辑
        const parent = findNodeById(treeData.value, renameData.value.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(response.data);
        }
      }
      addDialogVisible.value = false;
      fetchTreeData();
    }
  } catch (error) {
    console.error("新建目录失败", error);
  }
};

// 保存编辑的目录名称
const saveDirectoryName = async () => {
  if (
    renameData.value.newName &&
    renameData.value.newName !== renameData.value.oldName
  ) {
    try {
      const response = await renameDirectory(
        renameData.value.id,
        renameData.value.newName
      );

      if (response.code == 200) {
        // 更新名称
        const node = findNodeById(treeData.value, renameData.value.id);
        node.name = renameData.value.newName;
        renameDialogVisible.value = false; // 关闭弹窗
        fetchTreeData(); // 更新目录树数据
      }
    } catch (error) {
      console.error("修改目录名称失败", error);
    }
  } else {
    renameDialogVisible.value = false; // 取消编辑
  }
};

// 查找目录树中的节点
const findNodeById = (nodes, id) => {
  for (let node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 组件挂载时获取目录数据
onMounted(() => {
  fetchTreeData();
});

// 在DirectoryTree组件中
defineExpose({
  fetchTreeData,
});
</script>

<template>
  <div class="project-tree-wrapper">
    <!-- 空状态 -->
    <div v-if="!treeData.length" class="empty-state">
      <el-empty description="暂无目录">
        <el-button
          type="primary"
          class="create-root-btn"
          @click="openAddRootDialog"
        >
          <el-icon><Plus /></el-icon>
          新建根目录
        </el-button>
      </el-empty>
    </div>
    <!-- 目录树 -->
    <div v-else class="directory-tree-container">
      <el-tree
        :data="treeData"
        :props="treeProps"
        :expand-on-click-node="true"
        :default-expanded-keys="expandedNodes"
        @node-click="handleNodeClick"
        default-expand-all
        class="custom-tree"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <!-- 文件/目录图标和名称 -->
            <div
              class="node-content"
              :class="{ 'is-directory': data.type === 'directory' }"
              @dblclick="
                data.type === 'directory' ? openRenameDialog(data) : null
              "
              @click="data.type === 'directory' ? expandDirectory(data) : null"
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
            <!-- 目录操作按钮 -->
            <div v-if="data.type === 'directory'" class="node-actions">
              <el-tooltip content="新建子目录" placement="top">
                <el-icon @click.stop="openAddDialog(data)" class="action-icon">
                  <Plus />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="删除目录" placement="top">
                <el-icon
                  @click.stop="openDeleteDialog(data)"
                  class="action-icon"
                >
                  <Delete />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    <!-- 弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新建目录"
      width="400px"
      class="custom-dialog"
    >
      <el-input
        v-model="newDirName"
        placeholder="请输入目录名称"
        class="dialog-input"
        autofocus
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addDirectory">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除目录"
      width="400px"
      class="custom-dialog"
    >
      <div class="delete-warning">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p>确定要删除目录 "{{ deleteData.name }}" 吗？</p>
        <p class="warning-text">该操作将删除该目录下的所有文件，且不可恢复</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteDirectory">确定删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped lang="scss">
.directory-tree-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.custom-tree {
  min-height: 300px;
}
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
}
.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}
.node-content:hover {
  background-color: #f5f7fa;
}
.node-icon {
  color: #909399;
}
.is-directory .node-icon {
  color: #409eff;
}
.node-label {
  font-size: 14px;
  color: #606266;
}
.node-actions {
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}
.tree-node:hover .node-actions {
  opacity: 1;
}
.action-icon {
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #909399;
  transition: all 0.3s;
}
.action-icon:hover {
  background-color: #ecf5ff;
  color: #409eff;
}
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.create-root-btn {
  margin-top: 16px;
  padding: 12px 24px;
}
.custom-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
.dialog-input {
  width: 100%;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.delete-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.warning-icon {
  font-size: 48px;
  color: #f56c6c;
}
.warning-text {
  color: #909399;
  font-size: 13px;
}
</style>
