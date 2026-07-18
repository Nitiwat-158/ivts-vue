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
          <span>{{ $t('cctvViewer.connecting') }}</span>
        </div>

        <!-- Offline screen -->
        <div v-else-if="camera.status === 'offline'" class="overlay d-flex flex-column align-items-center justify-content-center text-white">
          <CIcon name="cil-warning" size="xl" class="text-danger mb-2" />
          <h5 class="mb-0">{{ $t('cctvViewer.connectionLost') }}</h5>
          <small class="text-muted">{{ $t('cctvViewer.checkHardware') }}</small>
        </div>

        <!-- Main Stream display -->
        <div v-else class="stream-container w-100 h-100 d-flex align-items-center justify-content-center">
          <video
            v-if="showVideoPlayer"
            ref="videoPlayer"
            :key="timestamp"
            class="w-100 h-100 stream-video"
            controls
            autoplay
            muted
            playsinline
            @loadeddata="onLoaded"
            @error="onError"
          />

          <img
            v-else-if="showImagePlayer"
            :key="timestamp"
            :src="buildStreamUrl(this.streamSourceUrl)"
            class="img-fluid stream-image"
            alt="CCTV Stream"
            @load="onLoaded"
            @error="onError"
          />

          <div v-else class="overlay d-flex flex-column align-items-center justify-content-center text-white px-4 text-center">
            <CIcon name="cil-ban" size="xl" class="text-warning mb-2" />
            <h5 class="mb-1">{{ $t('cctvViewer.cannotStream') }}</h5>
            <small class="text-muted">
              {{ unsupportedMessage }}
            </small>
          </div>

          <div v-if="streamError && !loading" class="overlay d-flex flex-column align-items-center justify-content-center text-white px-4 text-center">
            <CIcon name="cil-warning" size="xl" class="text-danger mb-2" />
            <h5 class="mb-1">{{ $t('cctvViewer.connectionError') }}</h5>
            <small class="text-muted">{{ $t('cctvViewer.checkUrlAccess') }}</small>
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
      <h5>{{ $t('cctvViewer.noCamera') }}</h5>
      <p class="small">{{ $t('cctvViewer.selectCameraHint') }}</p>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js'

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
      streamError: false,
      timestamp: Date.now(),
      currentTime: '',
      clockInterval: null,
      hlsInstance: null
    }
  },
  computed: {
    statusColor() {
      if (!this.camera) return 'secondary'
      return {
        online: 'success',
        active: 'success',
        offline: 'danger',
        inactive: 'danger',
        maintenance: 'warning'
      }[this.camera.status] || 'secondary'
    },
    streamSourceUrl() {
      if (!this.camera || !this.camera.stream_urls) return null
      return this.camera.stream_urls.hls_proxy || this.camera.stream_urls.hls || null
    },
    streamSourceType() {
      if (!this.streamSourceUrl) {
        return 'none'
      }
      const url = String(this.streamSourceUrl).trim().toLowerCase()
      if (url.startsWith('rtsp://')) {
        return 'rtsp'
      }
      if (url.includes('/stream/hls') || url.includes('.m3u8') || url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
        return 'video'
      }
      return 'image'
    },
    showVideoPlayer() {
      return this.streamSourceType === 'video'
    },
    showImagePlayer() {
      return this.streamSourceType === 'image'
    },
    unsupportedMessage() {
      if (this.streamSourceType === 'rtsp') {
        return this.$t('cctvViewer.rtspUnsupported')
      }
      return this.$t('cctvViewer.unsupportedUrl')
    }
  },
  watch: {
    camera: {
      handler(newCam) {
        this.streamError = false
        if (newCam && newCam.status === 'online') {
          this.loading = true
          this.initHls()
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
    this.destroyHls()
  },
  methods: {
    destroyHls() {
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }
    },
    initHls() {
      this.destroyHls()
      if (!this.showVideoPlayer || !this.camera || !this.streamSourceUrl) {
        setTimeout(() => { this.loading = false }, 600)
        return
      }
      
      this.$nextTick(() => {
        const video = this.$refs.videoPlayer
        const streamUrl = this.buildStreamUrl(this.streamSourceUrl)
        
        // Fallback manual timeout just in case hls.js hangs without firing events
        const manualTimeout = setTimeout(() => {
          if (this.loading) {
            this.destroyHls()
            this.onError()
            console.error('Manual connection timeout triggered (10 seconds)')
          }
        }, 10000)

        if (!video) return
        
        if (Hls.isSupported()) {
          this.hlsInstance = new Hls({
            debug: true,
            enableWorker: true,
            lowLatencyMode: true,
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 1,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 1
          })
          
          this.hlsInstance.loadSource(streamUrl)
          this.hlsInstance.attachMedia(video)
          
          this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.warn('Auto-play blocked:', e))
            this.loading = false
          })
          
          this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Fatal network error encountered:', data)
                  this.destroyHls()
                  this.onError()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Fatal media error encountered:', data)
                  this.hlsInstance.recoverMediaError()
                  break
                default:
                  this.destroyHls()
                  this.onError()
                  break
              }
            }
          })
        }
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(e => console.warn('Auto-play blocked:', e))
            this.loading = false
          })
          video.addEventListener('error', this.onError)
        } else {
          this.onError()
        }
      })
    },
    refreshStream() {
      this.loading = true
      this.streamError = false
      this.timestamp = Date.now()
      this.initHls()
    },
    onLoaded() {
      this.loading = false
      this.streamError = false
    },
    onError() {
      this.loading = false
      this.streamError = true
    },
    buildStreamUrl(url) {
      if (!url) return ''
      return `${url}${url.includes('?') ? '&' : '?'}t=${this.timestamp}`
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
