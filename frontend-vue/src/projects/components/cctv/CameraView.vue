<template>
  <div class="camera-view shadow-sm rounded">
    <div v-if="camera" class="viewer-wrapper">
      <div class="viewer-header d-flex justify-content-between align-items-center p-3 border-bottom">
        <div>
          <h4 class="mb-0 text-dark font-weight-bold d-flex align-items-center">
            <CIcon name="cil-camera" class="mr-2 text-danger" />
            {{ camera.name }}
          </h4>
          <small class="text-muted">{{ camera.location }}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <CBadge :color="statusColor" class="px-2 py-1">{{ camera.status.toUpperCase() }}</CBadge>
          <CButton size="sm" color="light" class="border" @click="refreshStream">
            <CIcon name="cil-reload" />
          </CButton>
        </div>
      </div>

      <div class="viewer-body position-relative bg-dark d-flex align-items-center justify-content-center overflow-hidden">
        <!-- Connecting overlay -->
        <div v-if="loading" class="overlay d-flex flex-column align-items-center justify-content-center text-white">
          <CSpinner color="light" size="sm" class="mb-2" />
          <span>Connecting to Stream...</span>
        </div>

        <!-- Offline screen -->
        <div v-else-if="camera.status === 'offline'" class="overlay d-flex flex-column align-items-center justify-content-center text-white">
          <CIcon name="cil-warning" size="xl" class="text-danger mb-2" />
          <h5 class="mb-0">Camera Connection Lost</h5>
          <small class="text-muted">Please check the device hardware or configuration</small>
        </div>

        <!-- Main Stream display -->
        <div v-else class="stream-container w-100 h-100 d-flex align-items-center justify-content-center">
          <img
            v-if="camera.streamUrl"
            :src="camera.streamUrl + '?t=' + timestamp"
            class="img-fluid stream-image"
            alt="CCTV Stream"
            @load="onLoaded"
            @error="onError"
          />
          <div v-else class="placeholder-fallback text-center text-white p-4">
            <CIcon name="cil-video" size="xl" class="mb-3 text-muted" />
            <h5>Mock CCTV Stream</h5>
            <p class="text-muted small">Live preview is active. Updates every 3 seconds.</p>
            <div class="mock-canvas rounded border border-secondary p-5 bg-black-50 position-relative">
              <span class="rec-dot"></span>
              <span class="time-overlay">{{ currentTime }}</span>
              <div class="mock-grid">
                <div>CH1 - {{ camera.id }}</div>
                <div>MFU SECURITY</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="viewer-footer p-3 border-top d-flex justify-content-between align-items-center text-muted small">
        <div>
          <span>Format: H.264 Main Profile · FPS: 30 · Bitrate: 2048 Kbps</span>
        </div>
        <div>
          <span>Source: IAM Centralized Network Gate</span>
        </div>
      </div>
    </div>
    <div v-else class="no-camera-selected d-flex flex-column align-items-center justify-content-center p-5 bg-light rounded text-muted">
      <CIcon name="cil-video" size="xl" class="mb-3" />
      <h5>No Camera Selected</h5>
      <p class="small">Choose a camera from the side menu to begin live monitoring.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CameraView',
  props: {
    camera: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      timestamp: Date.now(),
      currentTime: '',
      clockInterval: null
    }
  },
  computed: {
    statusColor() {
      if (!this.camera) return 'secondary'
      return {
        online: 'success',
        offline: 'danger',
        maintenance: 'warning'
      }[this.camera.status] || 'secondary'
    }
  },
  watch: {
    camera: {
      handler(newCam) {
        if (newCam && newCam.status === 'online') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
          }, 600);
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.updateClock();
    this.clockInterval = setInterval(this.updateClock, 1000);
  },
  beforeDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  },
  methods: {
    refreshStream() {
      this.loading = true;
      this.timestamp = Date.now();
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    onLoaded() {
      this.loading = false;
    },
    onError() {
      this.loading = false;
    },
    updateClock() {
      const now = new Date();
      this.currentTime = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  }
}
</script>

<style scoped>
.camera-view {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}

.viewer-body {
  height: 480px;
  background-color: #0b0f19;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(11, 15, 25, 0.9);
  z-index: 10;
}

.stream-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder-fallback {
  width: 100%;
  max-width: 500px;
}

.mock-canvas {
  height: 200px;
  background: radial-gradient(circle, #1a2035 0%, #0c0f1d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-dot {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 10px;
  height: 10px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.time-overlay {
  position: absolute;
  top: 12px;
  right: 15px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #10b981;
}

.mock-grid {
  position: absolute;
  bottom: 12px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  font-family: monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.gap-2 {
  gap: 0.5rem;
}

@keyframes pulse {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
