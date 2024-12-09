<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { batchUploadFiles } from "@/services/tree";

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true,
  },
  userId: {
    type: [String, Number],
    required: true,
  },
  directoryId: {
    type: [String, Number],
    required: true,
  },
});

const files = ref([]);
const uploading = ref(false);
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

// 将文件切片
const createFileChunks = (file) => {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + CHUNK_SIZE));
    cur += CHUNK_SIZE;
  }
  return chunks;
};

const uploadFileChunks = async (file) => {
  const chunks = createFileChunks(file);
  const totalChunks = chunks.length;

  const uploadChunkPromises = chunks.map(async (chunk, index) => {
    const formData = new FormData();
    formData.append("files", chunk);
    formData.append("fileName", file.name);
    formData.append("index", index);
    formData.append("totalChunks", totalChunks);
    formData.append("projectId", String(props.projectId));
    formData.append("userId", String(props.userId));
    formData.append("directoryId", String(props.directoryId));
    formData.append("fileSize", String(file.size));

    return batchUploadFiles(formData);
  });

  return Promise.all(uploadChunkPromises);
};

// 添加 emit 定义
const emit = defineEmits(["uploadComplete"]);

// 在上传完成后触发事件
const submitUpload = async () => {
  if (files.value.length === 0) {
    ElMessage.warning("请先选择文件");
    return;
  }
  uploading.value = true;
  try {
    // 依次上传每个文件
    for (const file of files.value) {
      await uploadFileChunks(file.raw);
    }
    ElMessage.success("所有文件上传成功");
    files.value = []; // 清空文件列表
    emit("uploadComplete"); // 触发上传完成事件
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "文件上传发生错误");
    console.error(error);
  } finally {
    uploading.value = false;
  }
};

// 添加文件名格式化函数
const formatFileName = (fileName) => {
  if (fileName.length <= 10) return fileName;

  const ext =
    fileName.lastIndexOf(".") > -1
      ? fileName.substring(fileName.lastIndexOf("."))
      : "";
  const name = fileName.substring(0, fileName.length - ext.length);

  if (name.length > 10) {
    return `${name.substring(0, 4)}...${name.slice(-6)}${ext}`;
  }
  return fileName;
};

// 添加文件大小格式化函数
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + " B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + " KB";
  } else {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  }
};

// 移除文件类型和大小限制
const beforeUpload = (file) => {
  return true;
};

const handleChange = (file, fileList) => {
  files.value = fileList;
};
</script>

<template>
  <div class="batch-upload">
    <el-upload
      class="upload-demo"
      drag
      multiple
      action="#"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :show-file-list="true"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        拖拽文件到此处，或<em>点击上传</em>
        <div class="upload-tip">支持所有文件类型，文件大小不限</div>
      </div>

      <!-- 自定义文件列表 -->
      <template #file-list="{ files }">
        <ul class="el-upload-list">
          <li
            v-for="file in files"
            :key="file.uid"
            class="el-upload-list__item"
          >
            <div class="el-upload-list__item-info">
              <span class="file-name">{{ formatFileName(file.name) }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </li>
        </ul>
      </template>
    </el-upload>

    <el-button
      @click="submitUpload"
      type="primary"
      :disabled="files.length === 0"
    >
      开始上传
    </el-button>
  </div>
</template>

<style scoped>
.batch-upload {
  width: 100%;
}

.el-upload-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.el-upload-list__item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.el-upload-list__item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.file-name {
  color: #606266;
  font-size: 14px;
  margin-right: 10px;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
  margin-bottom: 15px;
}
</style>
