<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatDate } from "@/util/day";
import {
  fetchProjectsList,
  deleteProject as deleteProjectService,
  fetchProjectDetails,
  searchProjects as searchProjectsService,
  forceDissolveProject,
  fetchProjectMembers as fetchProjectMembersService,
  addMemberToProject,
} from "@/services/admin";

// 定义响应式数据
const projects = ref([]);
const total = ref(0);
const pageSize = ref(5);

const currentPage = ref(1);
const searchQuery = ref("");
const memberDialogVisible = ref(false);
const projectMembers = ref([]);
const currentProjectId = ref(null);
const newMemberId = ref("");
const newMemberRole = ref("member");
const roleOptions = [
  { label: "成员", value: "member" },
  { label: "管理员", value: "admin" },
];
// 获取头像URL
const getAvatarUrl = (url) => {
  if (!url) return "";
  url = url.replace(/\\/g, "/");
  url = url.replace(/^http:\//, "http://");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `http://${url}`;
  }
  return url;
};

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await fetchProjectsList(currentPage.value, pageSize);
    projects.value = response.data;
    total.value = response.total;
    ElMessage.success("获取项目列表成功");
  } catch (error) {
    ElMessage.error("获取项目列表失败");
    console.error(error);
  }
};

// 查看项目成员
const handleViewMembers = async (projectId) => {
  try {
    currentProjectId.value = projectId;
    const response = await fetchProjectMembersService(projectId);
    projectMembers.value = response.data;
    memberDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取项目成员失败");
    console.error(error);
  }
};

// 添加项目成员

// 强制解散项目
const handleForceDissolve = async (projectId) => {
  try {
    await ElMessageBox.confirm("确定要强制解散该项目吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await forceDissolveProject(projectId);
    ElMessage.success("项目已解散");
    fetchProjects();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("解散项目失败");
      console.error(error);
    }
  }
};

// 其他原有的方法保持不变...
const handleSearch = async () => {
  if (searchQuery.value) {
    try {
      const response = await searchProjectsService(
        searchQuery.value,
        currentPage.value,
        pageSize
      );
      projects.value = response.data;
      total.value = response.total;
    } catch (error) {
      ElMessage.error("搜索项目失败");
      console.error(error);
    }
  } else {
    fetchProjects();
  }
};

const handleDeleteProject = async (projectId) => {
  try {
    await ElMessageBox.confirm("确定要删除该项目吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteProjectService(projectId);
    ElMessage.success("项目删除成功");
    fetchProjects();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除项目失败");
      console.error(error);
    }
  }
};

const handleViewProject = async (projectId) => {
  try {
    const response = await fetchProjectDetails(projectId);
    ElMessage.success("项目详情加载成功");
    console.log(response.data);
  } catch (error) {
    ElMessage.error("获取项目详情失败");
    console.error(error);
  }
};

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchProjects();
};
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  fetchProjects();
};

const formatProjectDate = (row) => {
  return formatDate(row.created_at, "YYYY-MM-DD HH:mm");
};

onMounted(fetchProjects);
</script>

<template>
  <div class="project-sys">
    <div class="header-section">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="请输入项目名称或描述搜索"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" type="primary">
              <el-icon><Search /></el-icon>搜索
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 项目列表卡片 -->
    <div class="table-container">
      <el-table
        :data="projects"
        border
        class="custom-table"
        highlight-current-row
      >
        <el-table-column prop="id" label="项目ID" width="80" align="center">
          <template #default="{ row }">
            <span class="id-badge">{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="头像" width="80" align="center">
          <template #default="scope">
            <el-avatar
              :size="40"
              :src="getAvatarUrl(scope.row.avatar)"
              class="project-avatar"
            />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="项目名称" width="180">
          <template #default="{ row }">
            <div class="project-name">{{ row.name }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述">
          <template #default="{ row }">
            <div class="description">{{ row.description }}</div>
          </template>
        </el-table-column>

        <el-table-column
          :formatter="formatProjectDate"
          label="创建时间"
          width="180"
          align="center"
        />

        <el-table-column
          prop="created_by"
          label="创建者"
          width="180"
          align="center"
        />

        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button-group class="action-buttons">
              <el-button
                size="small"
                type="primary"
                @click="handleViewMembers(row.id)"
              >
                <el-icon><User /></el-icon>成员
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleForceDissolve(row.id)"
              >
                <el-icon><Delete /></el-icon>解散
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          background
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10]"
          :total="total"
          layout="total, prev, pager, next, jumper, sizes"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 成员对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      title="项目成员"
      width="800px"
      class="custom-dialog"
    >
      <el-table :data="projectMembers" border class="member-table">
        <el-table-column prop="id" label="用户ID" width="80" align="center">
          <template #default="{ row }">
            <span class="id-badge">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.role === 'admin' ? 'danger' : 'success'"
              class="role-tag"
            >
              {{ row.role === "admin" ? "管理员" : "成员" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.project-sys {
  // padding: 24px;
  // background-color: #f5f7fa;
  // min-height: calc(100vh - 120px);

  .header-section {
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
  }

  .table-container {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    .el-table {
      flex: 1; // 表格占据剩余空间
      min-height: 400px; // 设置表格最小高度，根据需要调整
    }
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

      .id-badge {
        background: #f0f2f5;
        padding: 4px 8px;
        border-radius: 4px;
        color: #606266;
        font-family: monospace;
      }

      .project-avatar {
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .project-name {
        font-weight: 500;
        color: #303133;
      }

      .description {
        color: #606266;
        line-height: 1.5;
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

.custom-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  .role-tag {
    padding: 0 12px;
    height: 28px;
    line-height: 26px;
    font-weight: 500;
  }
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
