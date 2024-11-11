<template>
  <div class="project-info">
    <div class="project-container">
      <!-- 左侧：项目成员 -->
      <div class="left-section">
        <DirectoryTree :projectId="projectId" />
      </div>

      <!-- 右侧：项目基本信息 -->
      <div class="right-section">
        <el-descriptions class="margin-top" title="项目信息" :column="3" border>
          <template #extra>
            <el-button type="primary" @click="editProject">编辑项目</el-button>
            <!-- 邀请成员按钮 -->
            <el-button type="success" @click="showInviteDialog"
              >邀请成员</el-button
            >
          </template>

          <!-- 项目名称 -->
          <el-descriptions-item label="项目名称">
            {{ project.name }}
          </el-descriptions-item>

          <!-- 创建人 -->
          <el-descriptions-item label="创建人">
            <el-tag @click="showUserProfile(project.created_by)">
              {{ project.created_by_name }}
            </el-tag>
          </el-descriptions-item>

          <!-- 创建时间 -->
          <el-descriptions-item label="创建时间">
            {{ formatDate(project.created_at) }}
          </el-descriptions-item>

          <!-- 项目描述 -->
          <el-descriptions-item label="描述">
            {{ project.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 项目完成状态 -->
        <el-descriptions class="margin-top" title="项目状态" :column="3" border>
          <el-descriptions-item label="单基因投影">
            <el-tag
              :type="
                projectStats.single_gene_projection === 1 ? 'success' : 'info'
              "
            >
              {{ "单基因投影" }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="基因集投影">
            <el-tag
              :type="
                projectStats.gene_set_projection === 1 ? 'success' : 'info'
              "
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

        <div v-if="projectMember && projectMember.length" class="members">
          <h3>项目成员</h3>
          <el-table :data="projectMember" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="role" label="角色" />

            <!-- 操作列 -->
            <el-table-column label="操作" width="180px">
              <template #default="{ row }">
                <el-button @click="removeMember(row)" type="danger" size="small"
                  >移除</el-button
                >
                <el-button @click="manageMember(row)" type="info" size="small"
                  >管理</el-button
                >
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
    <el-dialog v-model="isUserDialogVisible" title="用户资料" width="40%">
      <el-descriptions title="用户信息" border>
        <el-descriptions-item label="头像" :width="120" align="center">
          <el-image
            style="width: 80px; height: 80px; border-radius: 50%"
            :src="userProfile.avatar"
          />
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ userProfile.username }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ userProfile.name }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userProfile.email }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="userProfile.role === 0 ? 'danger' : 'info'">
            {{ userProfile.role === 0 ? "管理员" : "用户" }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="isUserDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <!-- 邀请成员的弹窗 -->
    <el-dialog v-model="isInviteDialogVisible" title="邀请成员" width="26%">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户"
        suffix-icon="el-icon-search"
      >
        <template #append>
          <el-button @click="searchUsers">搜索</el-button>
        </template></el-input
      >

      <el-table
        :data="filteredUsers"
        border
        style="margin-top: 20px; max-height: 300px; overflow-y: auto"
      >
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="120px">
          <template #default="{ row }">
            <el-button
              @click="toggleUserSelection(row)"
              :type="isUserSelected(row) ? 'success' : 'primary'"
              size="small"
            >
              {{ isUserSelected(row) ? "已选择" : "选择" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 选择的用户 -->
      <el-descriptions
        v-if="selectedUsers.length"
        title="已选择的成员"
        border
        :column="1"
        style="width: 300px"
      >
        <template v-for="user in selectedUsers" :key="user.id">
          <el-descriptions-item label="姓名" width="100">
            {{ user.name }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱" width="200">
            {{ user.email }}
          </el-descriptions-item>
        </template>
      </el-descriptions>

      <template #footer>
        <el-button @click="isInviteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="inviteMember">邀请</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import DirectoryTree from "@/components/ProjectTree.vue";

import {
  getProjectInfo,
  updateProject as updateProjectService,
  removeProjectMember,
  inviteProjectMember,
} from "@/services/project";
import {
  getUserIDProfile,
  getExcludeSelf,
  getUsersBySearch,
} from "@/services/users";
import { formatDate } from "@/util/day";
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
const projectMember = ref([]);
const projectStats = ref({
  single_gene_projection: 0,
  gene_set_projection: 0,
  clustering: 0,
});
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
  width: 100%;
  //   padding: 20px;
}

.project-container {
  display: flex;
  justify-content: space-between;
  gap: 20px; /* 控制左右间距 */
}

.left-section {
  width: 20%;
  flex: 2;
  padding: 20px;
}

.right-section {
  width: 80%;
  flex: 3;
  background-color: #6289ff; /* 深色背景 */
  color: white; /* 文字颜色设置为白色 */
  padding: 10px;
  box-sizing: border-box;
  border-radius: 8px; /* 圆角效果 */
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.members {
  margin-top: 20px;
}

.el-table {
  margin-top: 10px;
}

.el-descriptions-item {
  padding: 10px 0;
}

.el-button {
  margin-right: 10px;
}
</style>
