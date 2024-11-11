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
  label: "name",
  children: "children",
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

// 控制弹窗显示
const addDialogVisible = ref(false); // 控制新建目录弹窗显示
const renameDialogVisible = ref(false); // 控制重命名目录弹窗显示
const newDirName = ref(""); // 新建目录的名称
const renameData = ref({ id: null, newName: "" }); // 用于重命名目录

// 获取目录树数据
const fetchTreeData = async () => {
  try {
    const response = await getDirectoryTree(props.projectId);
    if (response.data) {
      treeData.value = response.data;
      const allNodeIds = [];

      const extractNodeIds = (nodes) => {
        nodes.forEach((node) => {
          allNodeIds.push(node.id); // 收集节点id
          if (node.children && node.children.length > 0) {
            extractNodeIds(node.children); // 递归获取子节点
          }
        });
      };

      extractNodeIds(treeData.value);
      expandedNodes.value = allNodeIds; // 设置所有节点为展开
      console.log(expandedNodes.value); // 确认展开的节点
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
  const isExpanded = expandedNodes.value.includes(data.id);

  if (isExpanded) {
    // 如果节点已展开，折叠它
    expandedNodes.value = expandedNodes.value.filter((id) => id !== data.id);
    node.isExpand = false;
  } else {
    // 如果节点未展开，展开它
    expandedNodes.value.push(data.id);
    node.isExpand = true;
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
const addDirectory = async () => {
  try {
    const response = await createDirectory({
      projectId: props.projectId,
      parentId: renameData.value.parentId,
      name: newDirName.value,
      userId: 1,
    });

    if (response.code == 200) {
      // 找到父节点
      const parent = treeData.value.find(
        (item) => item.id === renameData.value.parentId
      );

      if (parent) {
        // 如果父节点存在，添加新目录
        if (!parent.children) {
          parent.children = []; // 如果没有 children 属性，初始化为空数组
        }
        parent.children.push(response.data); // 新目录添加到父目录的子节点中
      } else {
        console.error("未找到父目录");
      }

      addDialogVisible.value = false; // 关闭弹窗
      fetchTreeData(); // 更新目录树数据
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
</script>

<template>
  <div>
    <div
      v-if="treeData.length === 0"
      class="add-directory-button"
      @click="openAddDialog({ id: null })"
    >
      <el-icon size="40">
        <Plus />
      </el-icon>
    </div>
    <el-tree
      :data="treeData"
      :props="treeProps"
      :expand-on-click-node="false"
      :default-expanded-keys="expandedNodes"
      @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <!-- 显示名称或者输入框 -->
        <span
          v-if="!data.isEditing"
          @dblclick="openRenameDialog(data)"
          @click="expandDirectory(data)"
        >
          {{ data.name }}
        </span>

        <!-- 图标按钮容器，添加一定的间距 -->
        <div
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding-left: 20px;
          "
        >
          <el-icon @click.stop="openAddDialog(data)" :size="16">
            <Plus />
          </el-icon>
          <el-icon @click.stop="openRenameDialog(data)" :size="16">
            <Edit />
          </el-icon>
          <el-icon @click.stop="openDeleteDialog(data)" :size="16">
            <Delete />
          </el-icon>
        </div>
      </template>
    </el-tree>

    <!-- 新建目录弹窗 -->
    <el-dialog title="新建目录" v-model="addDialogVisible" width="400px">
      <el-input
        v-model="newDirName"
        size="small"
        placeholder="请输入目录名称"
      />
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addDirectory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重命名目录弹窗 -->
    <el-dialog title="重命名目录" v-model="renameDialogVisible" width="400px">
      <el-input
        v-model="renameData.newName"
        size="small"
        placeholder="请输入新目录名称"
      />
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDirectoryName">确定</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog title="确认删除" v-model="deleteDialogVisible" width="400px">
      <p>您确定要删除目录 "{{ deleteData.name }}" 吗？</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteDirectory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.el-tree {
  min-height: 300px;
}

.el-input {
  width: 150px;
  margin-right: 10px;
}

/* 大的 + 按钮样式 */
.add-directory-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  cursor: pointer;
  font-size: 40px;
  color: #409eff;
}
</style>
