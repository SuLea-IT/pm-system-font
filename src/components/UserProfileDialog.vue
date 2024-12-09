<!-- components/UserProfileDialog.vue -->
<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="用户资料"
    width="500px"
    class="user-profile-dialog"
  >
    <el-descriptions
      title="用户信息"
      border
      :column="2"
      class="profile-descriptions"
    >
      <el-descriptions-item label="头像" :width="120" align="center">
        <el-image
          class="user-avatar"
          :src="userProfile.avatar"
          fit="cover"
          :preview-src-list="[userProfile.avatar]"
        >
          <template #error>
            <div class="avatar-error">
              <el-icon><Avatar /></el-icon>
            </div>
          </template>
        </el-image>
      </el-descriptions-item>

      <el-descriptions-item label="用户名" class="profile-item">
        <span class="profile-text">{{ userProfile.username }}</span>
      </el-descriptions-item>

      <el-descriptions-item label="姓名" class="profile-item">
        <span class="profile-text">{{ userProfile.name }}</span>
      </el-descriptions-item>

      <el-descriptions-item label="邮箱" class="profile-item">
        <span class="profile-text">{{ userProfile.email }}</span>
      </el-descriptions-item>

      <el-descriptions-item label="角色" class="profile-item">
        <el-tag
          :type="userProfile.role === 0 ? 'danger' : 'info'"
          class="role-tag"
          effect="dark"
        >
          {{ userProfile.role === 0 ? "管理员" : "用户" }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose" type="primary" plain class="close-btn">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { Avatar } from "@element-plus/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  userProfile: {
    type: Object,
    required: true,
    default: () => ({
      name: "",
      email: "",
      username: "",
      role: "",
      avatar: "",
      address: "",
    }),
  },
});

const emit = defineEmits(["update:visible"]);

const handleClose = () => {
  emit("update:visible", false);
};
</script>

<style scoped>
.user-profile-dialog {
  border-radius: 8px;
}

.profile-descriptions {
  padding: 20px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.profile-item {
  padding: 12px 16px;
}

.profile-text {
  color: #606266;
  font-size: 14px;
}

.role-tag {
  padding: 4px 12px;
  font-weight: 500;
}

.close-btn {
  min-width: 100px;
}

:deep(.el-descriptions__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}
</style>
