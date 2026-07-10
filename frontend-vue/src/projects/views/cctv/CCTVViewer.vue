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

export default {
  name: 'CCTVViewer',
  components: {
    CameraList,
    CameraView
  },
  data() {
    return {
      cameras: [
        { id: 'CAM-AS-01', name: 'AS Building Entrance', location: 'AS Building, 1st Floor Lobby', status: 'online', streamUrl: '' },
        { id: 'CAM-AS-02', name: 'AS Building OSS Center', location: 'AS Building, 4th Floor One Stop Service', status: 'online', streamUrl: '' },
        { id: 'CAM-GATE-01', name: 'Main Gate Entrance', location: 'Main Campus Entrance Road', status: 'online', streamUrl: '' },
        { id: 'CAM-GATE-02', name: 'Main Gate Exit', location: 'Main Campus Exit Road', status: 'online', streamUrl: '' },
        { id: 'CAM-LIB-01', name: 'M-Learning Space', location: 'Library and Information Center, Entrance', status: 'online', streamUrl: '' },
        { id: 'CAM-LIB-02', name: 'M-Learning Space Inside', location: 'Library Zone A Reading Area', status: 'offline', streamUrl: '' },
        { id: 'CAM-C3-01', name: 'C3 Building Parking', location: 'C3 Academic Building Parking Lot', status: 'maintenance', streamUrl: '' }
      ],
      selectedCamera: null
    }
  },
  created() {
    // Select first online camera as default
    const defaultCam = this.cameras.find(cam => cam.status === 'online') || this.cameras[0]
    this.selectedCamera = defaultCam
  },
  methods: {
    selectCamera(camera) {
      this.selectedCamera = camera
    },
    refreshAll() {
      // Logic to trigger refresh on current child stream
      const current = this.selectedCamera
      this.selectedCamera = null
      this.$nextTick(() => {
        this.selectedCamera = current
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
