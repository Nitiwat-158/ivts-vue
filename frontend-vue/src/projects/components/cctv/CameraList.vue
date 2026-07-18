<template>
  <div class="camera-list">
    <div class="search-box mb-3">
      <CInput
        v-model="searchQuery"
        :placeholder="$t('cctvViewer.searchPlaceholder')"
        size="sm"
        class="mb-0"
      >
        <template #prepend-content>
          <CIcon name="cil-search" />
        </template>
      </CInput>
    </div>

    <div class="list-container">
      <div
        v-for="camera in filteredCameras"
        :key="camera.id"
        class="camera-item"
        :class="{ active: selectedCameraId === camera.id }"
        @click="$emit('select', camera)"
      >
        <div class="camera-info">
          <div class="camera-name">{{ camera.name }}</div>
          <div class="camera-location">{{ camera.location }}</div>
        </div>
        <div class="camera-status">
          <span :class="['status-dot', camera.status]"></span>
        </div>
      </div>
      <div v-if="filteredCameras.length === 0" class="empty-state text-center p-3 text-muted">
        {{ $t('cctvViewer.noCamerasFound') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CameraList',
  props: {
    cameras: {
      type: Array,
      required: true
    },
    selectedCameraId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    filteredCameras() {
      const q = this.searchQuery.toLowerCase().trim()
      if (!q) return this.cameras
      return this.cameras.filter(cam =>
        cam.name.toLowerCase().includes(q) ||
        cam.location.toLowerCase().includes(q)
      )
    }
  }
}
</script>

<style scoped>
.camera-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-container {
  overflow-y: auto;
  max-height: 500px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.camera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-item:last-child {
  border-bottom: none;
}

.camera-item:hover {
  background-color: #f8fafc;
}

.camera-item.active {
  background-color: #f1f5f9;
  border-left: 4px solid #8c1515;
}

.camera-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.camera-location {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.15rem;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-dot.offline {
  background-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}

.status-dot.maintenance {
  background-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}
</style>
