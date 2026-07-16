<template>
  <div class="cctv-viewer-page">
    <!-- Header Area based on IVTSRegistry layout -->
    <div class="ivts-header mb-4">
      <div>
        <div class="ivts-header__eyebrow">MFU Security Operations</div>
        <h1>{{ $t('nav.cctvViewer') }}</h1>
        <p>Live security monitoring nodes registered under the campus network security framework.</p>
      </div>
      <div class="ivts-header__actions">
        <CButton color="primary" variant="outline" @click="refreshAll">
          <CIcon name="cil-reload" class="mr-2" />
          Refresh Nodes
        </CButton>
      </div>
    </div>

    <!-- Main Layout Grid -->
    <CRow>
      <!-- Left sidebar menu (Camera Selection List) -->
      <CCol lg="4" class="mb-4">
        <CCard class="cctv-card h-100">
          <CCardHeader class="d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3 pb-0">
            <h5 class="mb-0 text-dark font-weight-bold">Camera Nodes</h5>
            <CBadge color="dark">{{ cameras.length }} Nodes</CBadge>
          </CCardHeader>
          <CCardBody>
            <CameraList
              :cameras="cameras"
              :selected-camera-id="selectedCamera ? selectedCamera.id : ''"
              @select="selectCamera"
            />
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Right detail view (Live Stream Player) -->
      <CCol lg="8" class="mb-4">
        <CameraView :camera="selectedCamera" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CameraList from '@/projects/components/cctv/CameraList.vue'
import CameraView from '@/projects/components/cctv/CameraView.vue'
import api from '@/service/api'

export default {
  name: 'CCTVViewer',
  components: {
    CameraList,
    CameraView
  },
  data() {
    return {
      cameras: [],
      selectedCamera: null,
      loading: false,
      errorMessage: ''
    }
  },
  created() {
    this.loadCamerasFromApi()
  },
  methods: {
    async loadCamerasFromApi() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await api.ivtsCctvs('list')
        const data = response && response.data ? response.data.data : null
        const rows = data && Array.isArray(data.rows) ? data.rows : []

        this.cameras = rows.map((camera) => ({
          id: camera._id || camera.id || camera.mediamtx_path,
          name: camera.camera_name || `Camera ${camera.mediamtx_path || ''}`,
          location: (camera.location && camera.location.description) || 'Campus Network Node',
          status: camera.status === 'active' ? 'online' : 'offline',
          mediamtx_path: camera.mediamtx_path,
          source_rtsp_url: camera.source_rtsp_url,
          stream_urls: camera.stream_urls || {}
        }))

        this.selectedCamera = this.cameras.length > 0 ? this.cameras[0] : null
      } catch (error) {
        console.error('Failed to load CCTV cameras:', error)
        this.errorMessage = 'ไม่สามารถโหลดรายการกล้องจากเซิร์ฟเวอร์ได้'
      } finally {
        this.loading = false
      }
    },
    selectCamera(camera) {
      this.selectedCamera = camera
    },
    async refreshAll() {
      const current = this.selectedCamera
      await this.loadCamerasFromApi()
      this.selectedCamera = null
      this.$nextTick(() => {
        if (current) {
          const found = this.cameras.find(c => c.id === current.id)
          this.selectedCamera = found || (this.cameras.length > 0 ? this.cameras[0] : null)
        }
      })
    }
  }
}
</script>

<style scoped>
.cctv-viewer-page {
  padding: 0.25rem;
}

.ivts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.ivts-header__eyebrow {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ivts-header h1 {
  margin: 0.25rem 0;
  color: #0f172a;
  font-size: 1.75rem;
  font-weight: 700;
}

.ivts-header p {
  max-width: 720px;
  margin: 0;
  color: #475569;
}

.cctv-card {
  border: 0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  /* ทำให้การ์ดยืดเต็มความสูงของ Grid Column */
  height: 100%;
}

.cctv-card h5 {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .ivts-header {
    flex-direction: column;
  }
  .ivts-header__actions {
    width: 100%;
  }
}
</style>