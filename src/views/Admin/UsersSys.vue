<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchUsersList,
  fetchUsersByName,
  deleteUser as deleteUserService,
  createUser as createUserService,
  updateUser as updateUserService,
  resetUserPassword as resetUserPasswordService,
} from "@/services/admin"; // 引入服务函数

const users = ref([]);
const total = ref(0);
const pageSize = ref(5);

const currentPage = ref(1);

const isDialogVisible = ref(false); // 控制编辑弹出窗的显示
const isCreateUserDialogVisible = ref(false); // 控制新建用户弹出窗的显示
const currentUser = ref({}); // 当前正在编辑的用户信息
const newUser = ref({ username: "", email: "", name: "", role: "", status: 1 }); // 新建用户的信息

const searchName = ref(""); // 搜索框的输入内容
// 在 script 部分添加以下处理函数
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  fetchUsers();
};
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

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
// 重置密码
const resetPassword = async (user) => {
  try {
    // 调用服务函数，传入用户 ID
    await resetUserPasswordService(user.id);
    ElMessage.success("密码重置成功");
  } catch (error) {
    ElMessage.error("密码重置失败");
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
<template>
  <div class="users-sys">
    <div class="header-section">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchName"
          placeholder="请输入用户名搜索"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="searchUsers" type="primary">
              <el-icon><Search /></el-icon>搜索
            </el-button>
          </template>
        </el-input>
      </div>
      <!-- 新建用户按钮 -->
      <el-button
        type="primary"
        @click="openCreateUserDialog"
        class="create-btn"
      >
        <el-icon><Plus /></el-icon>新建用户
      </el-button>
    </div>
    <!-- 表格部分 -->
    <div class="table-container">
      <el-table
        :data="users"
        style="width: 100%"
        border
        fit
        highlight-current-row
        class="custom-table"
      >
        <!-- 原有的表格列内容 -->
        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-avatar
              :size="40"
              :src="getAvatarUrl(scope.row.avatar)"
              class="user-avatar"
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
        <el-table-column label="角色" width="90px">
          <template #default="scope">
            <el-tag :type="scope.row.role === 0 ? 'danger' : 'info'">
              {{ scope.row.role === 0 ? "管理员" : "用户" }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 邮箱激活状态 -->
        <el-table-column label="邮箱激活状态" width="90px">
          <template #default="scope">
            <el-tag :type="scope.row.email_confirmed ? 'success' : 'danger'">
              {{ scope.row.email_confirmed ? "已激活" : "未激活" }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 用户状态列 -->
        <el-table-column label="状态" width="90px">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" align="center">
          <template #default="scope">
            <el-button-group class="action-buttons">
              <el-button
                @click="editUser(scope.row)"
                type="primary"
                size="small"
              >
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button
                @click="deleteUser(scope.row)"
                type="danger"
                size="small"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
              <el-button
                @click="resetPassword(scope.row)"
                type="warning"
                size="small"
              >
                <el-icon><RefreshRight /></el-icon>重置密码
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10]"
          :total="total"
          class="custom-pagination"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 优化对话框样式 -->
    <el-dialog
      v-model="isDialogVisible"
      title="编辑用户信息"
      width="500px"
      class="custom-dialog"
    >
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
      <!-- 对话框内容保持不变 -->
    </el-dialog>
    <el-dialog
      v-model="isCreateUserDialogVisible"
      title="新建用户"
      width="500px"
      class="custom-dialog"
    >
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
      <!-- 对话框内容保持不变 -->
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.users-sys {
  // padding: 24px;
  // background-color: #f5f7fa;
  // min-height: calc(100vh - 120px);
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    .search-box {
      .search-input {
        width: 360px;

        :deep(.el-input__wrapper) {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        :deep(.el-input__inner) {
          height: 40px;
        }
      }
    }
    .create-btn {
      height: 40px;
      padding: 0 20px;
      font-weight: 500;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
  .table-container {
    .el-table {
      flex: 1; // 表格占据剩余空间
      min-height: 400px; // 设置表格最小高度，根据需要调整
    }
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    .custom-table {
      :deep(.el-table__header) {
        background-color: #f8f9fb;

        th {
          background-color: #f8f9fb;
          color: #606266;
          font-weight: 600;
          height: 50px;
        }
      }
      :deep(.el-table__row) {
        td {
          padding: 12px 0;
        }

        &:hover {
          background-color: #f5f7fa;
        }
      }
      .user-avatar {
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .highlight {
        color: #409eff;
        font-weight: bold;
      }
      .action-buttons {
        .el-button {
          margin: 0 4px;

          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
// 对话框样式
.custom-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
  }
  :deep(.el-dialog__body) {
    padding: 24px;
  }
  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
// Element Plus 标签样式优化
:deep(.el-tag) {
  padding: 0 12px;
  height: 28px;
  line-height: 26px;
  border-radius: 4px;
  font-weight: 500;
}
.pagination-container {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: flex-end;

  .custom-pagination {
    :deep(.el-pagination__total) {
      margin-right: 16px;
    }

    :deep(.el-pagination__sizes) {
      margin-right: 16px;
    }

    :deep(.el-pager li) {
      background: transparent;

      &:not(.is-active):hover {
        color: #409eff;
      }

      &.is-active {
        background-color: #409eff;
        color: #fff;
        font-weight: bold;
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      background: transparent;

      &:disabled {
        background: #f5f7fa;
      }
    }

    :deep(.el-pagination__jump) {
      margin-left: 16px;

      .el-input__inner {
        height: 28px;
        line-height: 28px;
      }
    }
  }
}
// 为了确保分页组件与表格样式协调，可以添加以下全局样式
.el-pagination {
  --el-pagination-button-width: 32px;
  --el-pagination-button-height: 32px;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-hover-color: #409eff;
}
</style>
