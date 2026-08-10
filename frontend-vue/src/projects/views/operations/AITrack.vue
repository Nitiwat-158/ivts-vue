<template>
  <div class="ai-track-page">
    <AppSectionHero
      :title="$t('aiTrack.title')"
      :subtitle="$t('aiTrack.subtitle')"
      meta-label="$t('common.lastUpdated')"
      :meta-value="lastUpdatedLabel"
      @refresh="refreshPage"
    />

    <CRow>
      <CCol lg="4" class="mb-3">
        <CCard class="ai-track-card h-100">
          <CCardBody>
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2>{{ $t('aiTrack.camerasTitle') }}</h2>
                <p class="text-muted mb-0">{{ $t('aiTrack.camerasSubtitle') }}</p>
              </div>
              <CButton size="sm" color="primary" @click="fetchCameras" :disabled="loadingCameras">
                {{ $t('aiTrack.refresh') }}
              </CButton>
            </div>

            <div v-if="loadingCameras" class="text-center text-muted">{{ $t('aiTrack.loading') }}</div>
            <div v-else-if="cameraRows.length === 0" class="text-center text-muted">{{ $t('aiTrack.noCameras') }}</div>
            <div v-else class="ai-track-camera-list">
              <div v-for="camera in cameraRows" :key="camera.id" class="ai-track-camera">
                <div class="ai-track-camera__name">{{ camera.name }}</div>
                <div class="ai-track-camera__meta">{{ camera.location_name || camera.location || camera.id }}</div>
                <div class="ai-track-camera__coords">{{ camera.lat }}, {{ camera.lng }}</div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="8" class="mb-3">
        <CCard class="ai-track-card h-100">
          <CCardBody>
            <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <div>
                <h2>{{ $t('aiTrack.recentVehiclesTitle') }}</h2>
                <p class="text-muted mb-0">{{ $t('aiTrack.recentVehiclesSubtitle') }}</p>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <CButton size="sm" color="primary" variant="outline" @click="fetchRecentVehicles" :disabled="loadingRecent">
                  {{ $t('aiTrack.refresh') }}
                </CButton>
                <CButton size="sm" color="secondary" variant="outline" @click="fetchFullRoute" :disabled="loadingFullRoute">
                  {{ $t('aiTrack.showFullRoute') }}
                </CButton>
              </div>
            </div>

            <div v-if="loadingRecent" class="text-center text-muted">{{ $t('aiTrack.loading') }}</div>
            <div v-else-if="recentVehicles.length === 0" class="text-center text-muted">{{ $t('aiTrack.noRecentVehicles') }}</div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>{{ $t('aiTrack.table.globalId') }}</th>
                      <th>{{ $t('aiTrack.table.camerasVisited') }}</th>
                      <th>{{ $t('aiTrack.table.firstSeen') }}</th>
                      <th>{{ $t('aiTrack.table.lastSeen') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="vehicle in recentVehicles"
                      :key="vehicle.global_id"
                      @click="selectVehicle(vehicle)"
                      :class="{ 'table-active': selectedVehicle && selectedVehicle.global_id === vehicle.global_id }"
                      class="ai-track-vehicle-row"
                    >
                      <td>{{ vehicle.global_id }}</td>
                      <td>{{ vehicle.cameras_visited }}</td>
                      <td>{{ formatTimestamp(vehicle.first_seen) }}</td>
                      <td>{{ formatTimestamp(vehicle.last_seen) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="selectedVehicle" class="ai-track-detail mt-4">
                <CCard class="mb-3">
                  <CCardBody>
                    <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                      <div>
                        <h3>{{ $t('aiTrack.detailTitle') }}</h3>
                        <p class="text-muted mb-0">{{ $t('aiTrack.detailSubtitle') }}</p>
                      </div>
                      <div class="d-flex flex-wrap gap-2">
                        <CButton size="sm" color="secondary" variant="outline" @click="fetchTimeline(selectedVehicle)" :disabled="loadingTimeline">
                          {{ $t('aiTrack.refreshTimeline') }}
                        </CButton>
                        <CButton size="sm" color="success" @click="openRegisterModal" :disabled="!selectedVehicle || !selectedVehicle.global_id || registerSubmitting">
                          {{ $t('aiTrack.registerOwnership') }}
                        </CButton>
                      </div>
                    </div>

                    <div class="mb-3">
                      <strong>{{ $t('aiTrack.table.globalId') }}:</strong> {{ selectedVehicle.global_id }}
                    </div>
                    <div class="mb-3">
                      <strong>{{ $t('aiTrack.table.camerasVisited') }}:</strong> {{ selectedVehicle.cameras_visited }}
                    </div>
                    <div class="mb-3">
                      <strong>{{ $t('aiTrack.table.firstSeen') }}:</strong> {{ formatTimestamp(selectedVehicle.first_seen) }}
                    </div>
                    <div class="mb-3">
                      <strong>{{ $t('aiTrack.table.lastSeen') }}:</strong> {{ formatTimestamp(selectedVehicle.last_seen) }}
                    </div>

                    <div v-if="timeline.length === 0" class="text-muted">{{ $t('aiTrack.noTimeline') }}</div>
                    <div v-else>
                      <div class="ai-track-timeline-list">
                        <div v-for="item in timeline" :key="item.log_id" class="ai-track-timeline-item">
                          <div class="ai-track-timeline-item__time">{{ formatTimestamp(item.timestamp) }}</div>
                          <div>
                            <div>{{ item.camera_id }} · {{ item.location_name || $t('aiTrack.unknownCamera') }}</div>
                            <div class="text-muted">{{ item.predicted_class }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-3">
                      <strong>{{ $t('aiTrack.routePoints', { count: routePolyline.length }) }}</strong>
                      <div class="text-muted">{{ $t('aiTrack.routeHint') }}</div>
                    </div>
                  </CCardBody>
                </CCard>
              </div>
              <CModal :show="registerModalVisible" @update:show="registerModalVisible = $event" size="lg" centered>
                <CModalHeader closeButton>
                  <h5 class="mb-0">{{ $t('aiTrack.registerOwnership') }}</h5>
                </CModalHeader>
                <CModalBody>
                  <form @submit.prevent="confirmRegister">
                    <div class="form-group">
                      <label>{{ $t('aiTrack.registerGlobalId') }}</label>
                      <input type="text" class="form-control" :value="selectedVehicle?.global_id" disabled />
                    </div>
                    <div class="form-group">
                      <label>{{ $t('aiTrack.registerVehicleId') }}</label>
                      <input type="text" class="form-control" v-model="registerVehicleId" placeholder="e.g. TEST-VEH-123" />
                    </div>
                    <div class="form-group">
                      <label>{{ $t('aiTrack.registerNickname') }}</label>
                      <input type="text" class="form-control" v-model="registerNickname" placeholder="Optional nickname" />
                    </div>
                    <div v-if="registerMessage" class="alert alert-info mt-3">
                      {{ registerMessage }}
                    </div>
                  </form>
                </CModalBody>
                <CModalFooter>
                  <CButton color="secondary" variant="outline" @click="closeRegisterModal" :disabled="registerSubmitting">
                    {{ $t('common.close') }}
                  </CButton>
                  <CButton color="primary" @click="confirmRegister" :disabled="registerSubmitting">
                    {{ $t('aiTrack.confirmRegister') }}
                  </CButton>
                </CModalFooter>
              </CModal>

              <div v-if="fullRouteVehicles.length > 0" class="ai-track-full-route mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h3 class="mb-0">{{ $t('aiTrack.fullRouteTitle') }}</h3>
                  <span class="text-muted">{{ fullRouteVehicles.length }} {{ $t('aiTrack.fullRouteCountLabel') }}</span>
                </div>
                <div class="ai-track-full-route-list">
                  <div v-for="vehicle in fullRouteVehicles.slice(0, 8)" :key="vehicle.global_id" class="ai-track-full-route-item">
                    <span>{{ vehicle.global_id }}</span>
                    <small class="text-muted">{{ vehicle.cameras_visited }} {{ $t('aiTrack.table.camerasVisited') }}</small>
                  </div>
                  <div v-if="fullRouteVehicles.length > 8" class="text-muted mt-2">
                    {{ $t('aiTrack.fullRouteMore', { count: fullRouteVehicles.length - 8 }) }}
                  </div>
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
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue'
import api from '@/service/api'

export default {
  name: 'AITrack',
  components: {
    AppSectionHero
  },
  data() {
    return {
      lastUpdated: new Date(),
      loadingCameras: false,
      loadingRecent: false,
      loadingTimeline: false,
      loadingFullRoute: false,
      cameras: [],
      recentVehicles: [],
      selectedVehicle: null,
      timeline: [],
      routePolyline: [],
      fullRouteVehicles: [],
      errorMessage: '',
      registerModalVisible: false,
      registerVehicleId: '',
      registerNickname: '',
      registerSubmitting: false,
      registerMessage: '',
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
    },
    cameraRows() {
      return this.cameras
    }
  },
  created() {
    this.refreshPage()
  },
  methods: {
    refreshPage() {
      this.lastUpdated = new Date()
      this.fetchCameras()
      this.fetchRecentVehicles()
    },
    async fetchCameras() {
      this.loadingCameras = true
      this.errorMessage = ''
      try {
        const response = await api.aiTrack('cameras')
        const body = response && response.data ? response.data : {}
        const cameraMap = body.data || body || {}
        this.cameras = Object.entries(cameraMap).map(([id, camera]) => ({
          id,
          name: camera.location_name || camera.name || `Camera ${id}`,
          location_name: camera.location_name || camera.location || '',
          location: camera.location || '',
          lat: camera.lat || '',
          lng: camera.lng || ''
        }))
      } catch (err) {
        console.error('AI Track cameras failed', err)
        this.errorMessage = this.$t('aiTrack.errorLoading')
      } finally {
        this.loadingCameras = false
      }
    },
    async fetchRecentVehicles() {
      this.loadingRecent = true
      this.errorMessage = ''
      try {
        const response = await api.aiTrack('recent-vehicles', { limit: 25 })
        const body = response && response.data ? response.data : {}
        this.recentVehicles = Array.isArray(body.vehicles) ? body.vehicles : []
        if (!this.selectedVehicle && this.recentVehicles.length > 0) {
          this.selectVehicle(this.recentVehicles[0])
        }
      } catch (err) {
        console.error('AI Track recent vehicles failed', err)
        this.errorMessage = this.$t('aiTrack.errorLoading')
      } finally {
        this.loadingRecent = false
      }
    },
    async fetchFullRoute() {
      this.loadingFullRoute = true
      this.errorMessage = ''
      try {
        const response = await api.aiTrack('full-route')
        const body = response && response.data ? response.data : {}
        this.fullRouteVehicles = Array.isArray(body.vehicles) ? body.vehicles : []
      } catch (err) {
        console.error('AI Track full route failed', err)
        this.errorMessage = this.$t('aiTrack.errorLoading')
      } finally {
        this.loadingFullRoute = false
      }
    },
    async fetchTimeline(vehicle) {
      if (!vehicle || !vehicle.global_id) return
      this.loadingTimeline = true
      this.errorMessage = ''
      this.selectedVehicle = vehicle
      this.timeline = []
      this.routePolyline = []
      try {
        const response = await api.aiTrack('timeline', { global_id: vehicle.global_id })
        const body = response && response.data ? response.data : {}
        this.timeline = Array.isArray(body.timeline) ? body.timeline : []
        this.routePolyline = Array.isArray(body.route) ? body.route : []
      } catch (err) {
        console.error('AI Track timeline failed', err)
        this.errorMessage = this.$t('aiTrack.errorLoadingTimeline')
      } finally {
        this.loadingTimeline = false
      }
    },
    selectVehicle(vehicle) {
      if (!vehicle || this.selectedVehicle?.global_id === vehicle.global_id) return
      this.selectedVehicle = vehicle
      this.fetchTimeline(vehicle)
    },
    openRegisterModal() {
      this.registerVehicleId = '';
      this.registerNickname = '';
      this.registerMessage = '';
      this.registerModalVisible = true;
    },
    async confirmRegister() {
      if (!this.selectedVehicle || !this.selectedVehicle.global_id) return;
      const profile = this.$store && this.$store.getters ? this.$store.getters['auth/profile'] : null;
      const userId = profile && (profile._id || profile.id) ? String(profile._id || profile.id) : '';
      if (!userId) {
        this.registerMessage = this.$t('aiTrack.registerNoUser');
        return;
      }
      if (!this.registerVehicleId || !this.registerVehicleId.trim()) {
        this.registerMessage = this.$t('aiTrack.registerNoVehicleId');
        return;
      }

      this.registerSubmitting = true;
      this.registerMessage = '';

      try {
        await api.aiTrack('register', {
          user_id: userId,
          vehicle_id: this.registerVehicleId.trim(),
          global_id: this.selectedVehicle.global_id,
          nickname: this.registerNickname.trim() || null,
        });
        this.registerMessage = this.$t('aiTrack.registerSuccess');
        this.registerModalVisible = false;
      } catch (err) {
        console.error('AI Track registration failed', err);
        this.registerMessage = (err && err.response && err.response.data && err.response.data.error)
          ? err.response.data.error
          : err && err.message ? err.message : this.$t('aiTrack.registerError');
      } finally {
        this.registerSubmitting = false;
      }
    },
    closeRegisterModal() {
      this.registerModalVisible = false;
      this.registerMessage = '';
    },
    formatTimestamp(value) {
      if (!value) return '-'
      const time = new Date(value)
      if (!Number.isFinite(time.getTime())) return String(value)
      const d = time.getDate().toString().padStart(2, '0')
      const m = (time.getMonth() + 1).toString().padStart(2, '0')
      const y = time.getFullYear() + 543
      const hh = time.getHours().toString().padStart(2, '0')
      const mm = time.getMinutes().toString().padStart(2, '0')
      const ss = time.getSeconds().toString().padStart(2, '0')
      return `${d}/${m}/${y} ${hh}:${mm}:${ss}`
    }
  }
}
</script>

<style scoped>
.ai-track-page {
  padding: 0.25rem;
}
.ai-track-card {
  border: 0;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}
.ai-track-camera-list {
  display: grid;
  gap: 0.75rem;
}
.ai-track-camera {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #ffffff;
}
.ai-track-camera__name {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.ai-track-camera__meta,
.ai-track-camera__coords {
  color: #6b7280;
  font-size: 0.95rem;
}
.ai-track-detail {
  margin-top: 1.5rem;
}
.ai-track-timeline-list {
  display: grid;
  gap: 0.75rem;
}
.ai-track-timeline-item {
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.ai-track-timeline-item__time {
  min-width: 9rem;
  font-size: 0.92rem;
  font-weight: 600;
}
.ai-track-full-route-list {
  display: grid;
  gap: 0.75rem;
}
.ai-track-full-route-item {
  display: flex;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f8fafc;
}
</style>
