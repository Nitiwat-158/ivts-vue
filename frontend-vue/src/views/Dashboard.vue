<template>
  <div class="dashboard-page">
    <!-- 1) Top Bar -->
    <AppSectionHero
      :title="$t('ivts.dashboard')"
      :subtitle="$t('ivts.dashboardSubtitle')"
      meta-label="LAST UPDATED"
      :meta-value="lastUpdatedLabel"
      @refresh="refreshData"
    />
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
      <div class="d-flex align-items-center mb-3 mb-md-0">
        <div class="top-links d-none d-md-flex">
          <router-link to="/vehicles/management" class="mr-4">{{ $t('ivts.vehicles') }}</router-link>
          <router-link to="/cctv/viewer" class="mr-4">{{ $t('ivts.cameras') }}</router-link>
          <router-link to="/users/management" class="mr-4">{{ $t('ivts.userManagement') }}</router-link>
          <router-link to="/ivts/registry">{{ $t('ivts.reports') }}</router-link>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <CInput
          :placeholder="$t('ivts.searchByPlateOrOwner')"
          class="mb-0 mr-3"
          style="width: 250px;"
        />
        <CSelect
          :options="[$t('ivts.timeRange.today'), $t('ivts.timeRange.thisWeek'), $t('ivts.timeRange.custom')]"
          class="mb-0"
          style="width: 140px;"
        />
      </div>
    </div>

    <!-- 2) Main Section -->
    <CRow class="mb-4">
      <!-- Map Column -->
      <CCol lg="7" class="mb-4 mb-lg-0">
        <CCard class="h-100 mb-0">
          <CCardHeader>
            <strong style="font-size: 1.1rem;">{{ $t('ivts.cameraLocations') }}</strong>
          </CCardHeader>
          <CCardBody class="d-flex flex-column p-0">
            <div id="map-container" class="flex-grow-1" style="min-height: 400px; z-index: 1;"></div>
            <div class="map-legend p-3 d-flex align-items-center text-muted border-top">
              <span class="mr-4 d-flex align-items-center">
                <span class="legend-dot bg-success"></span> {{ $t('ivts.cameraActive') }}
              </span>
              <span class="d-flex align-items-center">
                <span class="legend-dot bg-danger"></span> {{ $t('ivts.cameraInactive') }}
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Alerts Column -->
      <CCol lg="5">
        <CCard class="h-100 mb-0">
          <CCardHeader>
            <strong style="font-size: 1.1rem;">{{ $t('ivts.alerts') }}</strong>
          </CCardHeader>
          <CCardBody class="p-0 overflow-auto" style="max-height: 480px;">
            <CListGroup flush>
              <CListGroupItem 
                v-for="(alert, index) in alerts" 
                :key="index"
                action
                class="d-flex justify-content-between align-items-start alert-item border-bottom"
                @click="onAlertClick(alert)"
              >
                <div class="d-flex w-100 py-1">
                  <div class="alert-icon mr-3 mt-1">
                    <div class="alert-circle" :class="alert.type === 'offline' ? 'bg-danger' : 'bg-warning'"></div>
                  </div>
                  <div>
                    <h6 class="mb-1 font-weight-bold" :class="alert.type === 'offline' ? 'text-danger' : 'text-warning'">
                      {{ alert.type === 'offline' ? $t('ivts.cameraOffline') : $t('ivts.unregisteredVehicle') }}
                    </h6>
                    <p class="mb-1 text-dark" style="font-size: 0.9rem;">
                      <span class="font-weight-bold">{{ alert.cameraId }}</span>
                      <template v-if="alert.type === 'offline'">
                        <span class="text-muted ml-1">— {{ $t('ivts.noSignalFor', { min: alert.duration }) }}</span>
                      </template>
                    </p>
                    <small class="text-muted">{{ alert.time }}</small>
                  </div>
                </div>
              </CListGroupItem>
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Divider -->
    <hr class="mb-4" style="border-top: 1px solid #e2e8f0;" />

    <!-- 3) Stats Section -->
    <CRow class="mb-4">
      <!-- Small Cards -->
      <CCol sm="6" lg="3" class="mb-3 mb-lg-0">
        <CCard class="h-100 mb-0 stat-card">
          <CCardBody class="text-center d-flex flex-column justify-content-center">
            <div class="text-muted font-weight-bold small mb-2">{{ $t('ivts.totalCameras') }}</div>
            <h2 class="mb-0 font-weight-bold text-dark">42</h2>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3 mb-lg-0">
        <CCard class="h-100 mb-0 stat-card">
          <CCardBody class="text-center d-flex flex-column justify-content-center">
            <div class="text-muted font-weight-bold small mb-2">Active / Inactive</div>
            <h2 class="mb-0 font-weight-bold">
              <span class="text-success">38</span> 
              <span class="text-muted mx-1">/</span> 
              <span class="text-danger">4</span>
            </h2>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3 mb-lg-0">
        <CCard class="h-100 mb-0 stat-card">
          <CCardBody class="text-center d-flex flex-column justify-content-center">
            <div class="text-muted font-weight-bold small mb-2">{{ $t('ivts.vehiclesToday') }}</div>
            <h2 class="mb-1 font-weight-bold text-dark">1,284</h2>
            <div class="small font-weight-bold text-success">▲ 12% {{ $t('ivts.comparedToYesterday') }}</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm="6" lg="3" class="mb-3 mb-lg-0">
        <CCard class="h-100 mb-0 stat-card">
          <CCardBody class="d-flex flex-column justify-content-center">
            <div class="text-muted font-weight-bold small mb-2 text-center">{{ $t('ivts.hourlyTraffic') }} (Mock)</div>
            <div class="mock-chart-container mt-2">
              <svg viewBox="0 0 100 35" class="w-100" style="height: 40px; overflow: visible;">
                <polyline 
                  fill="none" 
                  stroke="#321fdb" 
                  stroke-width="2" 
                  points="0,30 15,15 30,20 45,5 60,10 75,0 90,15 100,5" 
                />
                <circle cx="0" cy="30" r="2.5" fill="#321fdb"/>
                <circle cx="15" cy="15" r="2.5" fill="#321fdb"/>
                <circle cx="30" cy="20" r="2.5" fill="#321fdb"/>
                <circle cx="45" cy="5" r="2.5" fill="#321fdb"/>
                <circle cx="60" cy="10" r="2.5" fill="#321fdb"/>
                <circle cx="75" cy="0" r="2.5" fill="#321fdb"/>
                <circle cx="90" cy="15" r="2.5" fill="#321fdb"/>
                <circle cx="100" cy="5" r="2.5" fill="#321fdb"/>
              </svg>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Top Locations -->
    <CRow>
      <CCol>
        <CCard class="mb-0 shadow-sm border-0 bg-light">
          <CCardBody class="py-3">
            <div class="d-flex align-items-center flex-wrap">
              <strong class="mr-4 text-dark mb-2 mb-md-0">{{ $t('ivts.topLocationsToday') }}:</strong>
              <div class="d-flex flex-wrap flex-grow-1 justify-content-around">
                <div class="px-3 d-flex align-items-center mt-2 mt-md-0">
                  <span class="badge badge-primary mr-2" style="font-size: 0.9rem;">#1</span>
                  <span class="font-weight-bold mr-2 text-dark">CAM01_Gate_in</span>
                  <span class="text-muted">— 450 {{ $t('ivts.unitCars') }}</span>
                </div>
                <div class="px-3 d-flex align-items-center mt-2 mt-md-0">
                  <span class="badge badge-secondary mr-2" style="font-size: 0.9rem;">#2</span>
                  <span class="font-weight-bold mr-2 text-dark">CAM05_MainRoad</span>
                  <span class="text-muted">— 380 {{ $t('ivts.unitCars') }}</span>
                </div>
                <div class="px-3 d-flex align-items-center mt-2 mt-md-0">
                  <span class="badge badge-secondary mr-2" style="font-size: 0.9rem;">#3</span>
                  <span class="font-weight-bold mr-2 text-dark">CAM02_ParkingA</span>
                  <span class="text-muted">— 210 {{ $t('ivts.unitCars') }}</span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default {
  name: 'Dashboard',
  components: {
    AppSectionHero
  },
  data() {
    return {
      lastUpdated: new Date(),
      map: null,
      cameras: [
        { id: 'CAM01_Gate_in', status: 'active', lat: 20.045121, lng: 99.889515 },
        { id: 'CAM02_Gate_in', status: 'active', lat: 20.045117, lng: 99.889724 },
        { id: 'CAM03_M_Tjunction', status: 'active', lat: 20.045144, lng: 99.891147 },
        { id: 'CAM04_M_landao', status: 'active', lat: 20.045144, lng: 99.891147 },
        { id: 'CAM05_Mgemstaion_landao', status: 'active', lat: 20.045634, lng: 99.891312 },
        { id: 'CAM06_E1_Parking', status: 'inactive', lat: 20.045749, lng: 99.892071 },
        { id: 'CAM07_E3_Parking', status: 'inactive', lat: 20.045764, lng: 99.892975 }
      ],
      alerts: [
        { type: 'unregistered', cameraId: 'CAM01_Gate_in', time: '14:23' },
        { type: 'offline', cameraId: 'CAM07_E3_Parking', duration: 120, time: '14:00' },
        { type: 'unregistered', cameraId: 'CAM05_MainRoad', time: '13:45' },
        { type: 'unregistered', cameraId: 'CAM02_ParkingA', time: '12:10' },
        { type: 'offline', cameraId: 'CAM06_E1_Parking', duration: 300, time: '11:00' }
      ]
    }
  },
  computed: {
    lastUpdatedLabel() {
      if (!this.lastUpdated) return ''
      const d = this.lastUpdated.getDate().toString().padStart(2, '0')
      const m = (this.lastUpdated.getMonth() + 1).toString().padStart(2, '0')
      const y = this.lastUpdated.getFullYear() + 543
      const hh = this.lastUpdated.getHours().toString().padStart(2, '0')
      const mm = this.lastUpdated.getMinutes().toString().padStart(2, '0')
      const ss = this.lastUpdated.getSeconds().toString().padStart(2, '0')
      return `${d}/${m}/${y} ${hh}:${mm}:${ss}`
    }
  },
  mounted() {
    this.initMap();
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    refreshData() {
      this.lastUpdated = new Date()
    },
    initMap() {
      // ตั้งค่าแผนที่เริ่มต้นที่เชียงราย (Dummy location)
      this.map = L.map('map-container').setView([20.04489, 99.878202], 13);
      
      // ใช้ OpenStreetMap (ฟรี ไม่ใช้ API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // วาด Marker จาก Dummy Data
      this.cameras.forEach(cam => {
        const iconHtml = `<div class="camera-dot ${cam.status === 'active' ? 'bg-success' : 'bg-danger'}"></div>`;
        const icon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: iconHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([cam.lat, cam.lng], { icon }).addTo(this.map);
        marker.on('click', () => {
          this.onCameraClick(cam);
        });
        marker.bindTooltip(cam.id);
      });
    },
    onCameraClick(cam) {
      window.alert(`${this.$t('dashboard.cctvAlert')} ${cam.id}`);
    },
    onAlertClick(alert) {
      console.log('Clicked alert:', alert);
      window.alert(`${this.$t('dashboard.eventAlert')} ${alert.cameraId}`);
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 1rem 0.5rem;
}

.top-links a {
  color: #4f5d73;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}
.top-links a:hover {
  color: #321fdb;
}

.camera-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #fff;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}
.camera-dot:hover {
  transform: scale(1.3);
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  z-index: 10;
}

::v-deep .custom-leaflet-icon {
  background: transparent;
  border: none;
}

.legend-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 6px;
}

.alert-item {
  cursor: pointer;
  transition: background-color 0.2s;
}
.alert-item:hover {
  background-color: #f8f9fa;
}

.alert-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.stat-card {
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #e2e8f0;
}

.text-warning {
  color: #f9b115 !important;
}
.bg-warning {
  background-color: #f9b115 !important;
}
</style>
