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
import yaml from 'js-yaml'

///import mediamtxConfigText from '!!raw-loader!@/assets/mediamtx.yml'

export default {
  name: 'CCTVViewer',
  components: {
    CameraList,
    CameraView
  },
  data() {
    return {
      cameras: [],
      selectedCamera: null
    }
  },
  created() {
    // โหลดข้อมูลกล้องทันทีที่เปิดหน้า
    this.loadCamerasFromYaml()
  },
  methods: {
    loadCamerasFromYaml() {
      try {
        // แปลงข้อความ YAML เป็น JavaScript Object
        const config = yaml.load(mediamtxConfigText)

        if (config && config.paths) {
          // ดึงรายชื่อกล้องจาก key 'paths'
          const loadedCameras = Object.keys(config.paths).map((pathName) => {
            return {
              id: `CAM-${pathName.toUpperCase()}`,
              name: `Node: ${pathName.toUpperCase()}`,
              location: 'Campus Network Node',
              status: 'online', // กำหนดสถานะตั้งต้นเป็น online
              // สร้าง URL สำหรับ HLS สตรีม (พอร์ตเริ่มต้นคือ 8888)
              streamUrl: `http://localhost:8888/${pathName}/index.m3u8`
            }
          })

          this.cameras = loadedCameras
          // เลือกกล้องตัวแรกเป็นค่าเริ่มต้น
          this.selectedCamera = this.cameras.length > 0 ? this.cameras[0] : null
        }
      } catch (error) {
        console.error('ไม่สามารถอ่านหรือแปลงไฟล์ mediamtx.yml ได้:', error)
      }
    },
    selectCamera(camera) {
      this.selectedCamera = camera
    },
    refreshAll() {
      // โหลดข้อมูลกล้องใหม่
      this.loadCamerasFromYaml()
      
      const current = this.selectedCamera
      this.selectedCamera = null
      
      this.$nextTick(() => {
        // พยายามเลือกกล้องตัวเดิมกลับมาหลังจากการรีเฟรช
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