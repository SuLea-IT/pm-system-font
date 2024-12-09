<template>
  <div class="project-info">
    <div class="project-container">
      <!-- 左侧栏 -->
      <div class="left-section">
        <div class="action-buttons">
          <UploadFile
            :projectId="projectId"
            :userId="project.created_by"
            @refreshTree="refreshDirectoryTree"
            class="upload-btn"
          />
          <CreateTask
            :projectId="projectId"
            @task-created="handleTaskCreated"
          />
        </div>
        <DirectoryTree
          ref="directoryTreeRef"
          :projectId="projectId"
          class="directory-tree"
        />
      </div>
      <!-- 右侧栏 -->
      <div class="right-section">
        <!-- 项目基本信息 -->
        <el-card class="info-card">
          <el-descriptions title="项目信息" :column="3" border>
            <template #extra>
              <div class="action-group">
                <el-button type="primary" @click="editProject">
                  <el-icon><Edit /></el-icon>
                  编辑项目
                </el-button>
                <el-button type="success" @click="showInviteDialog">
                  邀请成员
                </el-button>
              </div>
            </template>
            <el-descriptions-item label="项目名称">
              <span class="project-name">{{ project.name }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建人">
              <el-tag
                class="creator-tag"
                @click="showUserProfile(project.created_by)"
              >
                {{ project.created_by_name }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              <span class="creation-time">{{
                formatDate(project.created_at)
              }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="描述" :span="3">
              <span class="project-desc">{{ project.description }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        <!-- 项目状态 -->
        <ProjectStatus :projectStats="projectStats" class="status-section" />
        <!-- 成员列表 -->
        <div
          v-if="projectMember && projectMember.length"
          class="members-section"
        >
          <div class="section-header">
            <h3>项目成员</h3>
            <el-button type="primary" plain @click="showInviteDialog">
              <el-icon><Plus /></el-icon>
              添加成员
            </el-button>
          </div>

          <el-table
            :data="projectMember"
            border
            class="member-table"
            :header-cell-style="{ background: '#f5f7fa' }"
          >
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
                  {{ row.role }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button-group>
                  <el-button
                    @click="manageMember(row)"
                    type="primary"
                    size="small"
                  >
                    管理
                  </el-button>
                  <el-button
                    @click="removeMember(row)"
                    type="danger"
                    size="small"
                  >
                    移除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 编辑项目的弹窗 -->
    <el-dialog v-model="isDialogVisible" title="编辑项目信息" width="30%">
      <el-form :model="editData" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="editData.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editData.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProject">保存</el-button>
      </template>
    </el-dialog>

    <!-- 用户资料弹窗 -->
    <UserProfileDialog
      v-model:visible="isUserDialogVisible"
      :userProfile="userProfile"
    />
    <el-dialog
      v-model="isInviteDialogVisible"
      title="邀请成员"
      width="560px"
      class="invite-dialog"
    >
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="输入姓名或邮箱搜索用户"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="searchUsers">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>
      <!-- 用户列表 -->
      <el-table
        :data="filteredUsers"
        border
        class="users-table"
        :max-height="300"
        highlight-current-row
      >
        <el-table-column prop="name" label="姓名" min-width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar">{{
                row.name.charAt(0)
              }}</el-avatar>
              <span class="user-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="邮箱" min-width="200" />

        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              @click="toggleUserSelection(row)"
              :type="isUserSelected(row) ? 'success' : 'primary'"
              size="small"
              class="select-btn"
            >
              <el-icon v-if="isUserSelected(row)"><Check /></el-icon>
              {{ isUserSelected(row) ? "已选择" : "选择" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 已选成员 -->
      <div v-if="selectedUsers.length" class="selected-users-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon class="title-icon"><User /></el-icon>
            <span>已选择的成员</span>
            <el-tag type="info" class="member-count" round>
              {{ selectedUsers.length }}
            </el-tag>
          </div>
          <el-button
            type="text"
            size="small"
            @click="clearSelectedUsers"
            class="clear-btn"
          >
            <el-icon><Delete /></el-icon>
            清空选择
          </el-button>
        </div>
        <el-scrollbar max-height="150px" class="members-scrollbar">
          <el-space wrap size="large">
            <el-tag
              v-for="user in selectedUsers"
              :key="user.id"
              class="selected-user-tag"
              closable
              @close="toggleUserSelection(user)"
              effect="light"
            >
              <div class="tag-wrapper">
                <el-avatar :size="28" :src="user.avatar" class="user-avatar">
                  {{ user.name.charAt(0) }}
                </el-avatar>
                <div class="tag-content">
                  <span class="tag-name">{{ user.name }}</span>
                  <span class="tag-email">{{ user.email }}</span>
                </div>
              </div>
            </el-tag>
          </el-space>
        </el-scrollbar>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isInviteDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="inviteMember"
            :disabled="!selectedUsers.length"
          >
            <el-icon><Plus /></el-icon>
            邀请成员
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 管理成员的弹窗 -->
    <el-dialog v-model="isManageDialogVisible" title="管理成员" width="30%">
      <el-form :model="selectedMember" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="selectedMember.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="selectedMember.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedMember.role">
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isManageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateMember">保存</el-button>
      </template>
    </el-dialog>
    <!-- 上传文件弹窗 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="30%">
      <el-form :model="uploadForm" label-width="80px">
        <!-- 目录选择 -->
        <el-form-item label="选择目录" required>
          <el-tree
            ref="directoryTreeRef"
            :data="directoryTree"
            node-key="id"
            :props="{ label: 'name' }"
            @node-click="handleDirectorySelect"
            default-expand-all
          />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="文件" required>
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :data="uploadData"
            :disabled="!selectedDirectory"
            :auto-upload="false"
            multiple
          >
            <el-button :disabled="!selectedDirectory" type="primary">
              选择文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                {{
                  selectedDirectory
                    ? "已选择目录: " + selectedDirectoryName
                    : "请先选择目录"
                }}
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleUpload"
          :disabled="!selectedDirectory"
        >
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import UserProfileDialog from "@/components/UserProfileDialog.vue";
import DirectoryTree from "@/components/ProjectTree.vue";
import ProjectStatus from "@/components/ProjectStatus.vue";
import CreateTask from "@/components/CreateTask.vue";

import {
  getProjectInfo,
  updateProject as updateProjectService,
  removeProjectMember,
  inviteProjectMember,
} from "@/services/project";
import UploadFile from "@/components/UploadFile.vue";

import {
  getUserIDProfile,
  getExcludeSelf,
  getUsersBySearch,
} from "@/services/users";
import { formatDate } from "@/util/day";
const directoryTreeRef = ref(null);
const selectedUsers = ref([]);
const route = useRoute();
const router = useRouter();
const project = ref({
  name: "",
  description: "",
  created_by: "",
  created_by_name: "", // 创建人名字
  created_at: "",
});
const uploadDialogVisible = ref(false);
const projectMember = ref([]);
const projectStats = ref({
  single_gene_projection: 0,
  gene_set_projection: 0,
  clustering: 0,
});
const refreshDirectoryTree = () => {
  console.log(1111);
  directoryTreeRef.value?.fetchTreeData();
};
const directoryId = ref(22);
const isDialogVisible = ref(false); // 控制编辑对话框的显示
const editData = ref({}); // 存储编辑后的数据
const filteredUsers = ref([]);
const searchQuery = ref("");
// 邀请成员相关数据
const isInviteDialogVisible = ref(false); // 控制邀请弹窗显示
const isManageDialogVisible = ref(false); // 控制管理弹窗显示
const selectedMember = ref({}); // 存储当前选中的成员
const inviteData = ref([]);

// 用户资料弹窗的控制
const isUserDialogVisible = ref(false);
const userProfile = ref({
  name: "",
  email: "",
  username: "",
  role: "",
  avatar: "", // 用户头像
  address: "", // 用户地址
});
// 处理任务创建成功的回调
const handleTaskCreated = () => {
  // 可以刷新任务列表或做其他操作
};
// 获取项目 ID
const projectId = Number(route.params.id);

// 获取项目详情
const fetchProjectInfo = async () => {
  try {
    const response = await getProjectInfo(projectId);
    if (response.data && response.data.project) {
      project.value = response.data.project;
      projectMember.value = response.data.members;
      projectStats.value = response.data.projectStats; // 获取项目状态
    } else {
      console.error("项目数据不完整", response);
    }
  } catch (error) {
    ElMessage.error("获取项目信息失败");
    console.error(error);
  }
};
const updateMember = async () => {
  try {
    // 执行更新成员信息的请求（例如更新角色）
    const response = await updateProjectMember(projectId, selectedMember.value);
    if (response.data.success) {
      ElMessage.success("成员信息更新成功");
      isManageDialogVisible.value = false; // 关闭弹窗
      fetchProjectInfo(); // 重新加载项目成员
    } else {
      ElMessage.error("更新成员信息失败");
    }
  } catch (error) {
    ElMessage.error("更新成员信息失败");
    console.error(error);
  }
};

const toggleUserSelection = (user) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);
  if (index === -1) {
    console.log(user.email);
    selectedUsers.value.push(user);
    inviteData.value.push({ email: user.email, userid: user.id });
  } else {
    selectedUsers.value.splice(index, 1);
  }
};
const isUserSelected = (user) => {
  return selectedUsers.value.some((u) => u.id === user.id);
};

// 获取用户列表，排除当前用户
const fetchUsers = async () => {
  try {
    const response = await getExcludeSelf();
    if (response.data) {
      filteredUsers.value = users.value; // 初始时显示所有用户
    } else {
      ElMessage.error("获取用户列表失败");
    }
  } catch (error) {
    ElMessage.error("获取用户列表失败");
    console.error(error);
  }
};
// 搜索用户
const searchUsers = async () => {
  if (searchQuery.value.trim() === "") {
    filteredUsers.value = [];
    return;
  }

  try {
    // 判断是否包含@符号，如果包含则按email搜索，否则按name搜索
    let response;
    if (searchQuery.value.includes("@")) {
      // 按email搜索
      response = await getUsersBySearch({ email: searchQuery.value });
    } else {
      // 按name搜索
      response = await getUsersBySearch({ name: searchQuery.value });
    }

    if (response && response.data) {
      console.log("搜索结果:", response.data);
      filteredUsers.value = [response.data]; // 确保直接赋值为返回的数据
      console.log(filteredUsers.value);
    } else {
      filteredUsers.value = [];
    }
  } catch (error) {
    ElMessage.error("搜索用户失败");
    console.error(error);
  }
};

// 选择用户
const selectUser = (user) => {
  selectedUsers.value = user;
};
// 点击管理按钮后
const manageMember = (member) => {
  // 假设你希望在弹窗中显示该成员的详情
  selectedMember.value = member;
  isManageDialogVisible.value = true; // 控制弹窗显示
};

// 进入编辑模式
const editProject = () => {
  editData.value = { ...project.value };
  isDialogVisible.value = true;
};

// 更新项目信息
const updateProject = async () => {
  try {
    await updateProjectService(projectId, editData.value);
    project.value = { ...editData.value }; // 更新页面显示的数据
    isDialogVisible.value = false;
    ElMessage.success("项目更新成功");
  } catch (error) {
    ElMessage.error("更新项目失败");
    console.error(error);
  }
};

const showInviteDialog = async () => {
  isInviteDialogVisible.value = true;
  const response = await getExcludeSelf({ project_id: projectId });
  filteredUsers.value = response.data;
};
const inviteMember = async () => {
  try {
    const response = await inviteProjectMember(projectId, inviteData.value);
    if (response.code === 200) {
      ElMessage.success("成员邀请成功");
      isInviteDialogVisible.value = false;
      // 重新加载成员列表
      fetchProjectInfo();
    } else {
      ElMessage.error("邀请成员失败");
    }
  } catch (error) {
    ElMessage.error("邀请成员失败");
  }
};

// 显示用户资料
const showUserProfile = async (userId) => {
  try {
    const response = await getUserIDProfile({ userId });
    if (response.data && response.data) {
      userProfile.value = response.data.user;
      console.log(userProfile.value);
      userProfile.value.avatar = userProfile.value.avatar
        .replace(/\\/g, "/")
        .replace(/^http:\//, "http://");
      isUserDialogVisible.value = true; // 打开用户资料弹窗
    } else {
      ElMessage.error("获取用户资料失败");
    }
  } catch (error) {
    ElMessage.error("获取用户资料失败");
    console.error(error);
  }
};

onMounted(fetchProjectInfo);
</script>

<style scoped lang="scss">
.project-info {
  padding: 24px;
  background: #f5f7fa;
  // min-height: 100vh;
  // min-width: 100%;
}
.project-container {
  display: flex;
  gap: 24px;
  // height: calc(100vh - 48px);
}
.left-section {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .action-buttons {
    display: flex;
    flex-direction: row;
    gap: 12px;
    .upload-btn,
    .create-task-btn {
      width: 100%;
      height: 40px;
    }
  }
  .directory-tree {
    flex: 1;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
}
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  padding-right: 8px;
  .info-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  .project-name {
    font-weight: 500;
    color: #2c3e50;
  }
  .creator-tag {
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      transform: translateY(-2px);
    }
  }
  .project-desc {
    color: #606266;
    line-height: 1.5;
  }
  .status-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  .members-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      h3 {
        margin: 0;
        color: #2c3e50;
      }
    }
    .member-table {
      :deep(.el-table__header) {
        font-weight: 500;
      }
    }
  }
}
.action-group {
  display: flex;
  gap: 8px;
}
// 自定义滚动条样式
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: #f5f7fa;
}
.invite-dialog {
  --el-dialog-padding-primary: 24px;
}
.search-section {
  margin-bottom: 20px;
}
.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.users-table {
  margin-bottom: 20px;
  border-radius: 4px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  font-weight: 500;
}
.select-btn {
  padding: 6px 16px;
}
.selected-users-section {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.selected-user-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 4px;
}
.tag-content {
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}
.tag-name {
  font-weight: 500;
}
.tag-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}
.selected-users-section {
  margin: 24px 0;
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.title-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}
.member-count {
  margin-left: 8px;
  font-size: 12px;
  padding: 2px 10px;
}
.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
  transition: color 0.3s;
}
.clear-btn:hover {
  color: var(--el-color-danger);
}
.members-scrollbar {
  padding: 4px;
}
.selected-user-tag {
  margin: 4px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.3s;
}
.selected-user-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.tag-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.tag-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tag-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.tag-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.close-icon {
  margin-left: 4px;
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.3s;
}
.close-icon:hover {
  opacity: 1;
}
:deep(.el-tag .el-tag__close) {
  color: var(--el-text-color-secondary);
  right: 8px;
}
:deep(.el-scrollbar__wrap) {
  padding-bottom: 8px;
}
</style>