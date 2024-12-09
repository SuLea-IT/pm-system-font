<template>
  <div class="tasks-container">
    <div class="header">
      <div class="header-left">
        <div class="task-tabs">
          <el-radio-group v-model="activeTab" size="large">
            <el-radio-button label="all">项目组任务</el-radio-button>
            <el-radio-button label="my">我的任务</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="table-container">
      <!-- 任务列表 -->
      <el-table v-loading="loading" :data="tasks" style="width: 100%" border>
        <el-table-column prop="name" label="任务名称" width="100">
          <template #default="{ row }">
            <el-tag type="success" effect="plain">
              {{ row.name }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 添加项目名称列 -->
        <el-table-column prop="project_name" label="所属项目" width="100">
          <template #default="{ row }">
            <el-tag type="success" effect="plain">
              {{ row.project_name }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 创建者列 -->
        <el-table-column prop="creator_name" label="创建人" width="120">
          <template #default="{ row }">
            <el-tag
              type="info"
              effect="plain"
              class="creator-tag"
              @click="showUserProfile(row.user_id)"
            >
              {{ row.creator_name }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="任务等级" width="100">
          <template #default="{ row }">
            <el-tag type="success" effect="plain">
              {{ row.priority == 1 ? "重要" : "普通" }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- 修改文件名称列 -->
        <el-table-column label="文件名称" min-width="180">
          <template #default="{ row }">
            <div class="file-names">
              <div class="file-list">
                <template
                  v-for="(filePath, index) in getFileList(row.file_paths)"
                  :key="index"
                >
                  <!-- 只显示前4个文件 -->
                  <el-tooltip
                    v-if="index < 2"
                    effect="dark"
                    :content="filePath"
                    placement="top-start"
                    :hide-after="0"
                  >
                    <el-tag class="file-tag" size="small" effect="plain">
                      {{ truncateFileName(filePath) }}
                    </el-tag>
                  </el-tooltip>
                </template>

                <!-- 如果文件数量超过2个，显示查看更多按钮 -->
                <el-button
                  v-if="getFileList(row.file_paths).length > 2"
                  type="primary"
                  link
                  @click="showAllFiles(row.file_paths)"
                >
                  查看全部({{ getFileList(row.file_paths).length }})
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="task_type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeTag(row.task_type)">
              {{ getTaskTypeName(row.task_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <!-- 开始按钮：仅在待处理状态显示 -->
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              size="small"
              @click="handleStartTask(row)"
            >
              开始
            </el-button>

            <!-- 取消按钮：仅在待处理状态显示 -->
            <el-button
              v-if="row.status === 'pending'"
              type="warning"
              size="small"
              @click="handleCancelTask(row)"
            >
              取消
            </el-button>

            <!-- 删除按钮：根据状态控制是否禁用 -->
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteTask(row)"
              :disabled="row.status === 'processing'"
              v-if="
                ['processing', 'completed', 'failed', 'cancelled'].includes(
                  row.status
                )
              "
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[3]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 添加文件列表弹窗 -->
    <el-dialog
      v-model="fileDialogVisible"
      title="文件列表"
      width="500px"
      :close-on-click-modal="true"
    >
      <div class="file-dialog-content">
        <el-tag
          v-for="(file, index) in currentFiles"
          :key="index"
          class="file-dialog-tag"
          size="small"
          effect="plain"
        >
          {{ file }}
        </el-tag>
      </div>
    </el-dialog>
    <!-- 创建任务对话框组件 -->
    <create-task
      v-if="projectId"
      :project-id="projectId"
      @task-created="fetchTasks"
    />
    <user-profile-dialog
      v-model:visible="profileDialogVisible"
      :user-profile="currentUserProfile"
    />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import UserProfileDialog from "@/components/UserProfileDialog.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, onMounted, watch, computed } from "vue";
import {
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
  deleteTask,
  cancelTask,
} from "@/services/tasks";
import CreateTask from "@/components/CreateTask.vue";
import { getUserProfile } from "@/services/users"; // 假设有这个API服务
const route = useRoute();
const projectId = ref(route.query.projectId);
const profileDialogVisible = ref(false);
const currentUserProfile = ref({});
// 状态变量
const loading = ref(false);
const tasks = ref([]);
const currentPage = ref(1);
const pageSize = ref(3);
const total = ref(0);

// 任务类型映射
const taskTypes = {
  0: { name: "单基因投影", type: "" },
  1: { name: "基因集投影", type: "success" },
  2: { name: "聚类分析", type: "warning" },
};

// 状态映射
const statusMap = {
  pending: { name: "待处理", type: "info" },
  processing: { name: "处理中", type: "warning" },
  completed: { name: "已完成", type: "success" },
  failed: { name: "失败", type: "danger" },
  cancelled: { name: "已取消", type: "" },
};
// 新增的响应式变量
const activeTab = ref("all");
// 监听标签页变化
watch(activeTab, (newVal) => {
  currentPage.value = 1;
  fetchTasks();
});
// 添加状态变量
const fileDialogVisible = ref(false);
const currentFiles = ref([]);
// 添加显示所有文件的方法
const showAllFiles = (filePaths) => {
  currentFiles.value = getFileList(filePaths);
  fileDialogVisible.value = true;
};

// 文件列表处理函数 - 只返回文件名
const getFileList = (filePaths) => {
  if (!filePaths) return [];

  let countForwardSlashes = 0;
  let countBackslashes = 0;

  // 统计出现的分隔符，并找出文件名
  for (let i = 0; i < filePaths.length; i++) {
    if (filePaths[i] === "/") countForwardSlashes++;
    if (filePaths[i] === "\\") countBackslashes++;
  }

  // 根据哪个分隔符更多来决定使用哪个分隔符
  const separator = countForwardSlashes > countBackslashes ? "/" : "\\";

  // 分割路径并只取文件名
  return filePaths.split(";").map((path) => {
    const lastSeparatorIndex = path.lastIndexOf(separator);
    return lastSeparatorIndex === -1
      ? path
      : path.slice(lastSeparatorIndex + 1);
  });
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

// 修改获取任务的方法
const fetchTasks = async () => {
  loading.value = true;
  try {
    const response =
      activeTab.value === "my"
        ? await getMyTasks(currentPage.value, pageSize.value)
        : await getProjectTasks(currentPage.value, pageSize.value);
    tasks.value = response.data.tasks;
    total.value = response.data.total;
  } catch (error) {
    ElMessage.error("获取任务列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};
// 添加取消任务的处理函数
const handleCancelTask = async (task) => {
  try {
    await ElMessageBox.confirm("确定要取消该任务吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await cancelTask(task.id);
    ElMessage.success("任务已取消");
    await fetchTasks(); // 刷新任务列表
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("取消任务失败");
      console.error(error);
    }
  }
};
// 处理任务状态更新
const handleUpdateStatus = async (taskId, status) => {
  try {
    await updateTaskStatus(taskId, status);
    ElMessage.success("状态更新成功");
    await fetchTasks();
  } catch (error) {
    ElMessage.error("状态更新失败");
    console.error(error);
  }
};
const showUserProfile = async (userId) => {
  try {
    // 调用获取用户资料的API
    const response = await getUserProfile(userId);
    currentUserProfile.value = response.data.user;
    profileDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取用户资料失败");
  }
};
// 处理任务删除
const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm("确定要删除该任务吗？此操作不可恢复", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await deleteTask(task.id);
    ElMessage.success("任务删除成功");
    await fetchTasks();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除任务失败");
      console.error(error);
    }
  }
};

// 开始任务
const handleStartTask = (task) => {
  handleUpdateStatus(task.id, "processing");
};

// 完成任务
// const handleCompleteTask = (task) => {
//   handleUpdateStatus(task.id, "completed");
// };

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchTasks();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchTasks();
};

// 工具函数
const getTaskTypeName = (type) => taskTypes[type]?.name || "未知类型";
const getTaskTypeTag = (type) => taskTypes[type]?.type || "";
const getStatusName = (status) => statusMap[status]?.name || "未知状态";
const getStatusTag = (status) => statusMap[status]?.type || "";
const formatDate = (date) => new Date(date).toLocaleString();

// 页面加载时获取任务列表
onMounted(fetchTasks);
</script>
<style lang="scss" scoped>
.tasks-container {
  padding: 24px;
  //   background-color: #f5f7fa;

  .header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 20px;
      color: #303133;
      font-weight: 600;
    }

    .el-button {
      height: 40px;

      .el-icon {
        margin-right: 4px;
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
      min-height: 340px; // 设置表格最小高度，根据需要调整
    }
    .el-table {
      .file-names {
        .file-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;

          .file-tag {
            max-width: 200px;
            cursor: pointer;

            &:hover {
              color: #409eff;
              border-color: #409eff;
              background-color: #ecf5ff;
            }
          }
        }
      }
      .file-dialog-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;

        .file-dialog-tag {
          margin-bottom: 8px;

          &:hover {
            color: #409eff;
            border-color: #409eff;
            background-color: #ecf5ff;
          }
        }
      }
      .file-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .file-tag {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          background-color: #f4f4f5;
          border-color: #e9e9eb;
          color: #909399;
          &:hover {
            color: #409eff;
            border-color: #409eff;
            background-color: #ecf5ff;
          }
        }
      }
      .project-tag {
        font-weight: 500;
      }
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

      .creator-tag {
        cursor: pointer;
        transition: all 0.3s;
        padding: 4px 8px;
        border-radius: 4px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .file-path {
        display: inline-block;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #606266;
      }

      .el-tag {
        // padding: 0 12px;
        height: 28px;
        line-height: 26px;
        border-radius: 4px;
        font-weight: 500;
        margin-right: 8px;

        &.cancelled {
          background-color: #f5f7fa;
          color: #909399;
          border-color: #e4e7ed;
        }
      }

      .el-button {
        margin-left: 8px;

        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    padding: 10px 0;
    display: flex;
    justify-content: flex-end;

    :deep(.el-pagination) {
      --el-pagination-button-width: 32px;
      --el-pagination-button-height: 32px;
      --el-pagination-button-disabled-color: #c0c4cc;
      --el-pagination-button-bg-color: #ffffff;
      --el-pagination-hover-color: #409eff;

      .el-pagination__total {
        margin-right: 16px;
      }

      .el-pagination__sizes {
        margin-right: 16px;
      }

      .el-pager li {
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

      .btn-prev,
      .btn-next {
        background: transparent;

        &:disabled {
          background: #f5f7fa;
        }
      }

      .el-pagination__jump {
        margin-left: 16px;

        .el-input__inner {
          height: 28px;
          line-height: 28px;
        }
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .tasks-container {
    padding: 16px;

    .header {
      flex-direction: column;
      gap: 16px;
    }

    .el-button {
      width: 100%;
      margin: 8px 0;
    }
  }
}
</style>
