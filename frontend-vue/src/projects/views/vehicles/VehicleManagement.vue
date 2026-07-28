<template>
  <div class="vehicle-management-page">
    <!-- Hero section with stats -->
    <AppSectionHero
      :title="$t('vehicleManagement.title')"
      :subtitle="$t('vehicleManagement.subtitle')"
      :stats="heroStats"
      :meta-label="$t('common.lastUpdated')"
      :meta-value="lastUpdatedLabel"
      @refresh="onRefresh"
    />

    <!-- Tab navigation -->
    <CCard class="border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
      <!-- Tab header -->
      <CCardHeader class="bg-white border-bottom px-0 pt-0 pb-0">
        <div class="vm-tabs">
          <button
            class="vm-tab"
            :class="{ 'vm-tab--active': activeTab === 'vehicles' }"
            @click="activeTab = 'vehicles'"
          >
            <CIcon name="cil-car-alt" class="mr-1" />
            รถทั้งหมด
            <span class="tab-count">{{ vehicles.length }}</span>
          </button>
          <button
            class="vm-tab"
            :class="{ 'vm-tab--active': activeTab === 'requests' }"
            @click="activeTab = 'requests'"
          >
            <CIcon name="cil-inbox" class="mr-1" />
            คำขอเพิ่มรถ
            <span class="tab-count tab-count--pending" v-if="pendingRequestCount > 0">
              {{ pendingRequestCount }}
            </span>
          </button>
        </div>
      </CCardHeader>

      <!-- ─── Tab: Vehicles ─────────────────────────────────── -->
      <template v-if="activeTab === 'vehicles'">
        <CCardHeader class="bg-white d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
          <div class="d-flex align-items-center mr-3 mb-2 mb-md-0">
            <CIcon name="cil-car-alt" class="mr-2 text-danger" size="xl" />
            <div>
              <h5 class="mb-0 font-weight-bold" style="color: #3c4b64;">{{ $t('vehicleManagement.sectionTitle') }}</h5>
              <small class="text-muted">{{ $t('vehicleManagement.showing', { count: vehicles.length, total: vehicles.length }) }}</small>
            </div>
          </div>
          <VehicleFilterBar
            @search="onSearch"
            @filter-status="onFilterStatus"
            @export="onExport"
          />
        </CCardHeader>

        <CCardBody class="p-0">
          <VehicleTable
            :vehicles="vehicles"
            :selectedIds="Array.from(selectedIds)"
            @approve="handleApprove"
            @reject="handleReject"
            @delete="handleDelete"
            @view="handleView"
            @toggle-select="handleToggleSelect"
          />
        </CCardBody>

        <CCardFooter class="bg-white border-top py-2">
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted small">{{ vehicles.length ? `1-${vehicles.length} / ${vehicles.length}` : '0 รายการ' }}</span>
            <CIcon v-if="loading" name="cil-loop-circular" class="text-muted" style="animation: spin 1s linear infinite;" />
          </div>
        </CCardFooter>
      </template>

      <!-- ─── Tab: Requests ────────────────────────────────── -->
      <template v-if="activeTab === 'requests'">
        <CCardHeader class="bg-white d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
          <div class="d-flex align-items-center mr-3 mb-2 mb-md-0">
            <CIcon name="cil-inbox" class="mr-2 text-primary" size="xl" />
            <div>
              <h5 class="mb-0 font-weight-bold" style="color: #3c4b64;">คำขอเพิ่มรถ / ต่ออายุ</h5>
              <small class="text-muted">แสดง {{ filteredRequests.length }} รายการ (รอดำเนินการ: {{ pendingRequestCount }})</small>
            </div>
          </div>
          <div class="d-flex align-items-center" style="gap: 0.75rem;">
            <!-- Request status filter -->
            <CSelect
              :value="requestStatusFilter"
              @update:value="requestStatusFilter = $event"
              :options="requestStatusOptions"
              size="sm"
              class="mb-0"
              style="min-width: 160px;"
            />
            <CButton size="sm" color="primary" variant="outline" @click="loadRequests">
              <CIcon name="cil-loop-circular" class="mr-1" />
              รีเฟรช
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody class="p-0">
          <VehicleRequestTable
            :requests="filteredRequests"
            :processingId="processingRequestId"
            @approve="openApproveModal"
            @reject="openRejectModal"
            @view="handleViewRequest"
          />
        </CCardBody>

        <CCardFooter class="bg-white border-top py-2">
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted small">{{ filteredRequests.length }} รายการ</span>
            <CIcon v-if="requestLoading" name="cil-loop-circular" class="text-muted" style="animation: spin 1s linear infinite;" />
          </div>
        </CCardFooter>
      </template>
    </CCard>

    <!-- Confirm Delete Modal (vehicles) -->
    <ConfirmDeleteModal
      :visible="showDeleteModal"
      :vehiclePlate="(currentVehicle && currentVehicle.vehicle && currentVehicle.vehicle.plate_number) || (currentVehicle && currentVehicle._id) || '-'"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      @update:visible="val => (showDeleteModal = val)"
    />

    <!-- Vehicle Verification Modal (vehicles) -->
    <VehicleVerificationModal
      :visible="showVerifyModal"
      :vehicleData="currentVehicle"
      @close="showVerifyModal = false"
      @approve="confirmVerify"
      @reject="confirmReject"
    />

    <!-- Confirm Request Modal (approve/reject request) -->
    <ConfirmRequestModal
      :visible="showRequestModal"
      :request="currentRequest"
      :mode="requestModalMode"
      :loading="requestModalLoading"
      @confirm="confirmReviewRequest"
      @cancel="showRequestModal = false"
      @update:visible="val => (showRequestModal = val)"
    />
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue'
import VehicleFilterBar from '@/projects/components/vehicles/VehicleFilterBar.vue'
import VehicleTable from '@/projects/components/vehicles/VehicleTable.vue'
import VehicleRequestTable from '@/projects/components/vehicles/VehicleRequestTable.vue'
import ConfirmDeleteModal from '@/projects/components/vehicles/ConfirmDeleteModal.vue'
import VehicleVerificationModal from '@/projects/components/vehicles/VehicleVerificationModal.vue'
import ConfirmRequestModal from '@/projects/components/vehicles/ConfirmRequestModal.vue'
import {
  fetchVehicles,
  approveVehicle,
  rejectVehicle,
  deleteVehicle,
  exportVehicles,
  fetchRequests,
  reviewRequest
} from '@/projects/views/vehicles/useVehicleApi'

export default {
  name: 'VehicleManagement',
  components: {
    AppSectionHero,
    VehicleFilterBar,
    VehicleTable,
    VehicleRequestTable,
    ConfirmDeleteModal,
    VehicleVerificationModal,
    ConfirmRequestModal
  },
  data () {
    return {
      // Tab
      activeTab: 'vehicles',

      // Vehicles tab
      lastUpdated: new Date(),
      vehicles: [],
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      searchQuery: '',
      statusFilter: 'all',
      selectedIds: new Set(),
      showDeleteModal: false,
      showVerifyModal: false,
      currentVehicle: null,
      loading: false,
      searchTimeout: null,

      // Requests tab
      requests: [],
      requestStatusFilter: 'pending_review',
      requestLoading: false,
      processingRequestId: null,

      // Request modal
      showRequestModal: false,
      requestModalMode: 'approve',
      currentRequest: null,
      requestModalLoading: false
    }
  },
  computed: {
    lastUpdatedLabel () {
      if (!this.lastUpdated) return ''
      const d = this.lastUpdated
      const dd = d.getDate().toString().padStart(2, '0')
      const m = (d.getMonth() + 1).toString().padStart(2, '0')
      const y = d.getFullYear() + 543
      const hh = d.getHours().toString().padStart(2, '0')
      const mm = d.getMinutes().toString().padStart(2, '0')
      const ss = d.getSeconds().toString().padStart(2, '0')
      return dd + '/' + m + '/' + y + ' ' + hh + ':' + mm + ':' + ss
    },
    heroStats () {
      return [
        { label: this.$t('vehicleManagement.statTotal'), value: String(this.stats.total), icon: 'cil-car-alt', iconClass: 'app-section-stat__icon--total' },
        { label: this.$t('vehicleManagement.statPending'), value: String(this.stats.pending), icon: 'cil-history', iconClass: 'app-section-stat__icon--attention' },
        { label: this.$t('vehicleManagement.statApproved'), value: String(this.stats.approved), icon: 'cil-check-circle', iconClass: 'app-section-stat__icon--active' },
        { label: this.$t('vehicleManagement.statRejected'), value: String(this.stats.rejected), icon: 'cil-x-circle', iconClass: 'app-section-stat__icon--danger' }
      ]
    },
    pendingRequestCount () {
      return this.requests.filter(r => r.request_status === 'pending_review').length
    },
    filteredRequests () {
      if (this.requestStatusFilter === 'all') return this.requests
      return this.requests.filter(r => r.request_status === this.requestStatusFilter)
    },
    requestStatusOptions () {
      return [
        { value: 'all', label: 'คำขอทั้งหมด' },
        { value: 'pending_review', label: 'รอตรวจสอบ' },
        { value: 'approved', label: 'อนุมัติแล้ว' },
        { value: 'rejected', label: 'ปฏิเสธ' }
      ]
    }
  },
  watch: {
    searchQuery () { this.debounceLoadVehicles() },
    statusFilter () { this.debounceLoadVehicles() },
    activeTab (tab) {
      if (tab === 'requests' && this.requests.length === 0) {
        this.loadRequests()
      }
    }
  },
  mounted () {
    this.loadVehicles()
    this.loadRequests()
  },
  methods: {
    // ─── Vehicles ────────────────────────────────────────────────────────────
    async loadVehicles () {
      try {
        this.loading = true
        this.lastUpdated = new Date()
        const response = await fetchVehicles(this.searchQuery, this.statusFilter)
        this.vehicles = response.vehicles || []
        this.stats = response.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
      } catch (error) {
        this.notifyToast(this.$t('ivts.toast.loadVehicleFailed'), 'danger')
      } finally {
        this.loading = false
      }
    },
    debounceLoadVehicles () {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(this.loadVehicles, 300)
    },
    onSearch (value) { this.searchQuery = value },
    onFilterStatus (value) { this.statusFilter = value },
    onRefresh () { this.loadVehicles(); this.loadRequests() },
    async onExport () {
      try {
        const blob = await exportVehicles(this.searchQuery, this.statusFilter)
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'vehicles.csv')
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        this.notifyToast(this.$t('ivts.toast.exportSuccess') || 'Export สำเร็จ', 'success')
      } catch {
        this.notifyToast(this.$t('ivts.toast.exportFailed') || 'Export ล้มเหลว', 'danger')
      }
    },
    async handleApprove (id) {
      try {
        await approveVehicle(id)
        this.notifyToast(this.$t('ivts.toast.approveSuccess'), 'success')
        await this.loadVehicles()
      } catch {
        this.notifyToast(this.$t('ivts.toast.approveFailed'), 'danger')
      }
    },
    handleReject (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) { this.currentVehicle = vehicle; this.showVerifyModal = true }
    },
    handleDelete (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) { this.currentVehicle = vehicle; this.showDeleteModal = true }
    },
    handleView (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) { this.currentVehicle = vehicle; this.showVerifyModal = true }
    },
    handleToggleSelect (id) {
      if (id === 'all') {
        this.selectedIds = this.selectedIds.size === this.vehicles.length
          ? new Set()
          : new Set(this.vehicles.map(v => v._id))
      } else if (id === null) {
        this.selectedIds = new Set()
      } else {
        const next = new Set(this.selectedIds)
        next.has(id) ? next.delete(id) : next.add(id)
        this.selectedIds = next
      }
    },
    async confirmDelete () {
      if (!this.currentVehicle) return
      try {
        await deleteVehicle(this.currentVehicle._id)
        this.showDeleteModal = false
        this.currentVehicle = null
        this.notifyToast(this.$t('ivts.toast.deleteSuccess'), 'success')
        await this.loadVehicles()
      } catch (err) {
        console.error('[VehicleManagement] confirmDelete error:', err?.response?.data || err?.message || err)
        this.notifyToast(this.$t('ivts.toast.deleteFailed'), 'danger')
      }
    },
    async confirmVerify () {
      if (!this.currentVehicle) return
      try {
        await approveVehicle(this.currentVehicle._id)
        this.showVerifyModal = false
        this.notifyToast(this.$t('ivts.toast.approveDocSuccess'), 'success')
        await this.loadVehicles()
      } catch {
        this.notifyToast(this.$t('ivts.toast.approveDocFailed'), 'danger')
      }
    },
    async confirmReject (id, reasons, note) {
      if (!id) return
      try {
        await rejectVehicle(id, { reasons, note })
        this.showVerifyModal = false
        this.notifyToast(this.$t('ivts.toast.rejectDocSuccess'), 'success')
        await this.loadVehicles()
      } catch {
        this.notifyToast(this.$t('ivts.toast.rejectDocFailed'), 'danger')
      }
    },

    // ─── Requests ────────────────────────────────────────────────────────────
    async loadRequests () {
      try {
        this.requestLoading = true
        const result = await fetchRequests({ limit: 200 })
        this.requests = result.rows || []
      } catch {
        this.notifyToast('ไม่สามารถโหลดคำขอได้', 'danger')
      } finally {
        this.requestLoading = false
      }
    },
    openApproveModal (req) {
      this.currentRequest = req
      this.requestModalMode = 'approve'
      this.showRequestModal = true
    },
    openRejectModal (req) {
      this.currentRequest = req
      this.requestModalMode = 'reject'
      this.showRequestModal = true
    },
    handleViewRequest (req) {
      this.currentRequest = req
      this.requestModalMode = 'approve'
      this.showRequestModal = true
    },
    async confirmReviewRequest (req) {
      if (!req || !req._id) return
      const status = this.requestModalMode === 'approve' ? 'approved' : 'rejected'
      try {
        this.requestModalLoading = true
        this.processingRequestId = req._id
        await reviewRequest(req._id, status)
        this.showRequestModal = false
        this.notifyToast(
          status === 'approved' ? 'อนุมัติคำขอสำเร็จ' : 'ปฏิเสธคำขอสำเร็จ',
          status === 'approved' ? 'success' : 'warning'
        )
        await Promise.all([this.loadRequests(), this.loadVehicles()])
      } catch (err) {
        const msg = err && err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'ดำเนินการไม่สำเร็จ'
        this.notifyToast(msg, 'danger')
      } finally {
        this.requestModalLoading = false
        this.processingRequestId = null
      }
    },

    // ─── Shared ──────────────────────────────────────────────────────────────
    notifyToast (message, color = 'info') {
      this.$store.dispatch('dialog/showToast', { message, color })
    }
  }
}
</script>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.vehicle-management-page { display: flex; flex-direction: column; gap: 1rem; }

/* Tabs */
.vm-tabs {
  display: flex;
  border-bottom: none;
  padding: 0 1rem;
  gap: 0;
}
.vm-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.vm-tab:hover { color: #3c4b64; background: rgba(0,0,0,0.03); }
.vm-tab--active { color: #c0392b; border-bottom-color: #c0392b; }

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 10px;
  background: #e9ecef;
  color: #495057;
}
.tab-count--pending {
  background: #dc3545;
  color: #fff;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
