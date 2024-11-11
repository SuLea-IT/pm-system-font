<template>
  <div class="projects-sys">
    <!-- 搜索框 -->
    <el-input
      v-model="searchName"
      placeholder="请输入项目名称搜索"
      clearable
      style="width: 300px; margin-bottom: 20px"
    >
      <template #append>
        <el-button @click="searchProjects" type="primary">搜索</el-button>
      </template>
    </el-input>

    <!-- 新建项目按钮 -->
    <el-button
      type="primary"
      @click="openCreateProjectDialog"
      style="margin-bottom: 20px"
    >
      新建项目
    </el-button>

    <!-- 使用el-card展示项目信息 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="project in projects" :key="project.id">
        <el-card class="project-card" shadow="hover">
          <div
            class="project-content"
            :style="{ backgroundImage: `url(${project.avatar})` }"
          >
            <!-- 项目名称带高亮效果 -->
            <h3 v-html="highlightText(project.name, searchName)"></h3>
            <p>描述: {{ truncateDescription(project.description) }}</p>
            <p>创建人: {{ truncateDescription(project.created_by_name) }}</p>
          </div>
          <div class="card-actions">
            <el-button
              @click="editProject(project)"
              type="primary"
              size="small"
            >
              编辑
            </el-button>
            <el-button
              @click="deleteProject(project)"
              type="danger"
              size="small"
            >
              删除
            </el-button>
            <el-button
              @click="handleEnterProject(project.id)"
              type="success"
              size="small"
            >
              进入项目
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      layout="prev, pager, next, total"
      :total="total"
      :page-size="pageSize"
      v-model:currentPage="currentPage"
      @current-change="fetchProjects"
    />

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
  width: 100%;
}
.project-card {
  margin-bottom: 20px;
}
.project-content {
  padding: 10px;
  height: 140px;
  background-size: cover;
  background-position: center;
  border-radius: 5px;
  color: #fff;
  box-sizing: border-box;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
.highlight {
  color: #ffd700;
  font-size: 15px;
}
</style>
