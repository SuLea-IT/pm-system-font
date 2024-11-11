<template>
  <div class="users-sys">
    <!-- 搜索框 -->
    <el-input
      v-model="searchName"
      placeholder="请输入用户名搜索"
      clearable
      style="width: 300px; margin-bottom: 20px"
    >
      <template #append>
        <el-button @click="searchUsers" type="primary">搜索</el-button>
      </template>
    </el-input>

    <!-- 新建用户按钮 -->
    <el-button
      type="primary"
      @click="openCreateUserDialog"
      style="margin-bottom: 20px"
    >
      新建用户
    </el-button>

    <el-table :data="users" style="width: 100%" border fit>
      <!-- 头像展示列 -->
      <el-table-column label="头像" width="">
        <template #default="scope">
          <img
            :src="getAvatarUrl(scope.row.avatar)"
            alt="头像"
            style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
            "
          />
        </template>
      </el-table-column>

      <!-- 用户名列，带高亮效果 -->
      <el-table-column label="用户名">
        <template #default="scope">
          <span v-html="highlightText(scope.row.username, searchName)"></span>
        </template>
      </el-table-column>

      <!-- 邮箱列，不带高亮效果 -->
      <el-table-column label="邮箱">
        <template #default="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <!-- 姓名列，不带高亮效果 -->
      <el-table-column label="姓名">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <!-- 角色列，使用 el-tag 渲染角色 -->
      <el-table-column label="角色">
        <template #default="scope">
          <el-tag :type="scope.row.role === 0 ? 'danger' : 'info'">
            {{ scope.row.role === 0 ? "管理员" : "用户" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 邮箱激活状态 -->
      <el-table-column label="邮箱激活状态">
        <template #default="scope">
          <el-tag :type="scope.row.email_confirmed ? 'success' : 'danger'">
            {{ scope.row.email_confirmed ? "已激活" : "未激活" }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 用户状态列 -->
      <el-table-column label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="editUser(scope.row)" type="primary" size="small">
            编辑
          </el-button>
          <el-button @click="deleteUser(scope.row)" type="danger" size="small">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      layout="prev, pager, next, total"
      :total="total"
      :page-size="pageSize"
      v-model:currentPage="currentPage"
      @current-change="fetchUsers"
    />

    <!-- 编辑用户的悬浮窗 -->
    <el-dialog v-model="isDialogVisible" title="编辑用户信息" width="20%">
      <el-form :model="currentUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="currentUser.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="currentUser.role" placeholder="选择角色">
            <el-option label="管理员" :value="0"></el-option>
            <el-option label="用户" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="currentUser.status" placeholder="选择状态">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUserInfo">完成</el-button>
      </template>
    </el-dialog>

    <!-- 新建用户的悬浮窗 -->
    <el-dialog v-model="isCreateUserDialogVisible" title="新建用户" width="20%">
      <el-form :model="newUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="newUser.email" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="newUser.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.role" placeholder="选择角色">
            <el-option label="管理员" :value="0"></el-option>
            <el-option label="用户" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newUser.status" placeholder="选择状态">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="isCreateUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createUser">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchUsersList,
  fetchUsersByName,
  deleteUser as deleteUserService,
  createUser as createUserService,
  updateUser as updateUserService,
} from "@/services/admin"; // 引入服务函数

const users = ref([]);
const total = ref(0);
const pageSize = 5;
const currentPage = ref(1);

const isDialogVisible = ref(false); // 控制编辑弹出窗的显示
const isCreateUserDialogVisible = ref(false); // 控制新建用户弹出窗的显示
const currentUser = ref({}); // 当前正在编辑的用户信息
const newUser = ref({ username: "", email: "", name: "", role: "", status: 1 }); // 新建用户的信息

const searchName = ref(""); // 搜索框的输入内容

// 高亮关键词
const highlightText = (text, keyword) => {
  text = String(text || "");
  keyword = String(keyword || "");

  if (!keyword.trim()) return text;

  const regExp = new RegExp(`(${keyword})`, "gi");
  return text.replace(regExp, '<span class="highlight">$1</span>');
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    // 如果有搜索关键字，调用搜索接口，而非分页接口
    if (searchName.value) {
      await searchUsers();
      return;
    }

    const response = await fetchUsersList(currentPage.value, pageSize);
    users.value = response.data;
    total.value = response.total;
    ElMessage.success("获取用户列表成功");
  } catch (error) {
    ElMessage.error("获取用户列表失败");
    console.error(error);
  }
};
// 搜索用户
const searchUsers = async () => {
  // 在进行新搜索时，将 currentPage 设置为 1，避免触发分页请求
  currentPage.value = 1;

  if (!searchName.value) {
    await fetchUsers();
    return;
  }

  try {
    const response = await fetchUsersByName(
      searchName.value,
      currentPage.value,
      pageSize
    );
    users.value = response.data;
    total.value = response.total;
    ElMessage.success("搜索用户成功");
  } catch (error) {
    ElMessage.error("搜索用户失败");
    console.error(error);
  }
};
// 获取头像URL
const getAvatarUrl = (url) => {
  url = url.replace(/\\/g, "/");
  url = url.replace(/^http:\//, "http://");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `http://${url}`;
  }
  return url;
};

// 打开新建用户弹出窗
const openCreateUserDialog = () => {
  newUser.value = { username: "", email: "", name: "", role: "", status: 1 };
  isCreateUserDialogVisible.value = true;
};

// 创建新用户
const createUser = async () => {
  try {
    await createUserService(newUser.value);
    ElMessage.success("用户创建成功");
    isCreateUserDialogVisible.value = false;
    fetchUsers();
  } catch (error) {
    ElMessage.error("创建用户失败");
    console.error(error);
  }
};

// 删除用户
const deleteUser = async (user) => {
  try {
    await deleteUserService(user.id);
    ElMessage.success("用户删除成功");
    fetchUsers();
  } catch (error) {
    ElMessage.error("删除用户失败");
    console.error(error);
  }
};

// 编辑用户（打开编辑表单）
const editUser = (user) => {
  currentUser.value = { ...user };
  isDialogVisible.value = true;
};

// 更新用户信息
const updateUserInfo = async () => {
  try {
    await updateUserService(currentUser.value.id, currentUser.value);
    ElMessage.success("用户信息更新成功");
    isDialogVisible.value = false;
    fetchUsers();
  } catch (error) {
    ElMessage.error("更新用户信息失败");
    console.error(error);
  }
};

onMounted(fetchUsers);
</script>

<style  scoped  lang="scss">
.el-table {
  margin-bottom: 20px;
  ::v-deep .highlight {
    color: #0058ff;
    font-size: 15px;
  }
}
.users-sys {
  width: 100%;
}
</style>
