<template>
  <div class="projects-sys">
    <!-- 顶部搜索和新建区域 -->
    <div class="header-actions">
      <el-input
        v-model="searchName"
        placeholder="请输入项目名称搜索"
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="searchProjects" type="primary">搜索</el-button>
        </template>
      </el-input>
      <el-button
        type="primary"
        @click="openCreateProjectDialog"
        class="create-btn"
      >
        <el-icon><Plus /></el-icon>新建项目
      </el-button>
    </div>
    <!-- 项目卡片列表 -->
    <el-row :gutter="24">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        v-for="project in projects"
        :key="project.id"
      >
        <el-card class="project-card" shadow="hover">
          <div
            class="project-cover"
            :style="{
              backgroundImage: `url(${
                project.avatar || '/default-project-bg.jpg'
              })`,
            }"
          >
            <div class="project-info">
              <h3
                class="project-title"
                v-html="highlightText(project.name, searchName)"
              ></h3>
              <p class="project-desc">
                {{ truncateDescription(project.description) }}
              </p>
              <div class="project-creator">
                <el-avatar :size="24" :src="project.creator_avatar">
                  {{ project.created_by_name?.charAt(0) }}
                </el-avatar>
                <span>{{ project.created_by_name }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <el-tooltip content="编辑项目" placement="top">
              <el-button
                @click="editProject(project)"
                type="primary"
                plain
                circle
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除项目" placement="top">
              <el-button
                @click="deleteProject(project)"
                type="danger"
                plain
                circle
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="进入项目" placement="top">
              <el-button
                @click="handleEnterProject(project.id)"
                type="success"
                plain
              >
                进入项目
              </el-button>
            </el-tooltip>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        v-model:currentPage="currentPage"
        @current-change="fetchProjects"
      />
    </div>

    <!-- 编辑项目的弹窗 -->
    <el-dialog v-model="isDialogVisible" title="编辑项目信息" width="20%">
      <el-form :model="currentProject" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="currentProject.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentProject.description" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProjectInfo">完成</el-button>
      </template>
    </el-dialog>

    <!-- 新建项目的弹窗 -->
    <el-dialog
      v-model="isCreateProjectDialogVisible"
      title="新建项目"
      width="20%"
    >
      <el-form :model="newProject" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="newProject.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newProject.description" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="isCreateProjectDialogVisible = false"
          >取消</el-button
        >
        <el-button type="primary" @click="createProject">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  createProject as createProjectService,
  updateProject,
  deleteProject as deleteProjectService,
  UserProjectsList,
  searchUserProjects,
} from "@/services/project";
import { useRouter } from "vue-router";
const projects = ref([]);
const total = ref(0);
const pageSize = 5;
const currentPage = ref(1);
const router = useRouter();
const isDialogVisible = ref(false); // 控制编辑弹出窗的显示
const isCreateProjectDialogVisible = ref(false); // 控制新建项目弹出窗的显示
const currentProject = ref({}); // 当前正在编辑的项目信息
const newProject = ref({ name: "", description: "" }); // 新建项目的信息

const searchName = ref(""); // 搜索框的输入内容
// 截取描述的前10个字
const truncateDescription = (description) => {
  return description.length > 10
    ? description.slice(0, 10) + "..."
    : description;
};

// 高亮关键词
const highlightText = (text, keyword) => {
  text = String(text || "");
  keyword = String(keyword || "");

  if (!keyword.trim()) return text;

  const regExp = new RegExp(`(${keyword})`, "gi");
  return text.replace(regExp, '<span class="highlight">$1</span>');
};

// 获取项目列表
const fetchProjects = async (page = 1) => {
  currentPage.value = page; // 更新当前页码
  try {
    if (searchName.value) {
      await searchProjects(); // 如果有搜索内容，则调用搜索方法
      return;
    }

    const response = await UserProjectsList({
      page: currentPage.value,
      size: pageSize, // 确保分页信息传递
    });

    projects.value = response.data.map((project) => ({
      ...project,
      avatar: project.avatar.replace(/\\/g, "/").replace(/^http:\//, "http://"),
    }));

    total.value = response.total;
    ElMessage.success("获取项目列表成功");
  } catch (error) {
    ElMessage.error("获取项目列表失败");
    console.error(error);
  }
};

// 搜索项目
const searchProjects = async () => {
  currentPage.value = 1;

  if (!searchName.value) {
    await fetchProjects(); // 如果没有搜索内容，获取所有项目
    return;
  }

  try {
    const response = await searchUserProjects({ name: searchName.value });

    projects.value = response.data.map((project) => ({
      ...project,
      avatar: project.avatar.replace(/\\/g, "/").replace(/^http:\//, "http://"),
    }));
    total.value = response.total;
    ElMessage.success("搜索项目成功");
  } catch (error) {
    ElMessage.error("搜索项目失败");
    console.error(error);
  }
};

// 进入项目页面的跳转方法
const handleEnterProject = (projectId) => {
  router.push({ name: "项目信息", params: { id: projectId } });
};
// 打开新建项目弹出窗
const openCreateProjectDialog = () => {
  newProject.value = { name: "", description: "" };
  isCreateProjectDialogVisible.value = true;
};

// 创建新项目
const createProject = async () => {
  try {
    await createProjectService(newProject.value);
    ElMessage.success("项目创建成功");
    isCreateProjectDialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    ElMessage.error("创建项目失败");
    console.error(error);
  }
};

// 删除项目
const deleteProject = async (project) => {
  try {
    await deleteProjectService(project.id);
    ElMessage.success("项目删除成功");
    fetchProjects();
  } catch (error) {
    ElMessage.error("删除项目失败");
    console.error(error);
  }
};

// 编辑项目（打开编辑表单）
const editProject = (project) => {
  currentProject.value = { ...project };
  isDialogVisible.value = true;
};

// 更新项目信息
const updateProjectInfo = async () => {
  try {
    await updateProject(currentProject.value.id, currentProject.value);
    ElMessage.success("项目信息更新成功");
    isDialogVisible.value = false;
    fetchProjects();
  } catch (error) {
    ElMessage.error("更新项目信息失败");
    console.error(error);
  }
};

onMounted(fetchProjects);
</script>

<style scoped lang="scss">
.projects-sys {
  padding: 24px;
  background-color: #f5f7fa;
  // min-width: 100%;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .search-input {
    width: 320px;
    transition: all 0.3s;

    &:focus-within {
      width: 360px;
    }
  }

  .create-btn {
    .el-icon {
      margin-right: 4px;
    }
  }
}
.project-card {
  margin-bottom: 24px;
  transition: all 0.3s;
  border: none;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.project-cover {
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }
}
.project-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  color: #fff;
}
.project-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;

  .highlight {
    color: #ffd700;
    text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  }
}
.project-desc {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.project-creator {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 8px;

  .el-avatar {
    border: 2px solid rgba(255, 255, 255, 0.8);
  }

  span {
    font-size: 14px;
  }
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 16px 0;
}
// 响应式适配
@media screen and (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 16px;

    .search-input {
      width: 100%;
    }

    .create-btn {
      width: 100%;
    }
  }
}
</style>
