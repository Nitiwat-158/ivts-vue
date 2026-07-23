<template>
  <div class="vehicle-management-page">
    <AppSectionHero
      :title="$t('vehicleManagement.title')"
      :subtitle="$t('vehicleManagement.subtitle')"
      :stats="heroStats"
      :meta-label="$t('common.lastUpdated')"
      :meta-value="lastUpdatedLabel"
      @refresh="loadVehicles"
    />

    <CCard class="border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
      <CCardHeader class="bg-white d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
        <div class="d-flex align-items-center mr-3 mb-2 mb-md-0">
          <CIcon name="cil-car-alt" class="mr-2 text-danger" size="xl" />
          <div>
            <h5 class="mb-0 font-weight-bold" style="color: #3c4b64;">{{ $t('vehicleManagement.sectionTitle') }}</h5>
            <small class="text-muted">{{ $t('vehicleManagement.showing', { count: vehicles.length || 0, total: vehicles.length || 0 }) }}</small>
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
      
      <CCardFooter class="bg-white border-top py-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="text-muted small font-weight-bold">
            {{ vehicles.length ? `1-${vehicles.length} / ${vehicles.length}` : '0-0 / 0' }}
          </span>
          <!-- A placeholder loading spinner or pagination can go here -->
          <CIcon v-if="loading" name="cil-loop-circular" class="text-muted" style="animation: spin 1s linear infinite;" />
        </div>
      </CCardFooter>
    </CCard>

    <ConfirmDeleteModal
      :visible="showDeleteModal"
      :vehiclePlate="(currentVehicle && currentVehicle.vehicle && currentVehicle.vehicle.license_plate) || '-'"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      @update:visible="val => (showDeleteModal = val)"
    />

    <VehicleVerificationModal
      :visible="showVerifyModal"
      :vehicleData="currentVehicle"
      @close="showVerifyModal = false"
      @approve="confirmVerify"
      @reject="confirmReject"
    />
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue'
import VehicleFilterBar from '@/projects/components/vehicles/VehicleFilterBar.vue'
import VehicleTable from '@/projects/components/vehicles/VehicleTable.vue'
import ConfirmDeleteModal from '@/projects/components/vehicles/ConfirmDeleteModal.vue'
import VehicleVerificationModal from '@/projects/components/vehicles/VehicleVerificationModal.vue'
import {
  fetchVehicles,
  approveVehicle,
  rejectVehicle,
  deleteVehicle,
  exportVehicles
} from '@/projects/views/vehicles/useVehicleApi'

export default {
  name: 'VehicleManagement',
  components: {
    AppSectionHero,
    VehicleFilterBar,
    VehicleTable,
    ConfirmDeleteModal,
    VehicleVerificationModal
  },
  data () {
    return {
      lastUpdated: new Date(),
      vehicles: [],
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      searchQuery: '',
      statusFilter: 'all',
      selectedIds: new Set(),
      showDeleteModal: false,
      showVerifyModal: false,
      verifyModalMode: 'verify',
      currentVehicle: null,
      loading: false,
      searchTimeout: null
    }
  },
  computed: {
    lastUpdatedLabel () {
      if (!this.lastUpdated) return ''
      const d = this.lastUpdated.getDate().toString().padStart(2, '0')
      const m = (this.lastUpdated.getMonth() + 1).toString().padStart(2, '0')
      const y = this.lastUpdated.getFullYear() + 543
      const hh = this.lastUpdated.getHours().toString().padStart(2, '0')
      const mm = this.lastUpdated.getMinutes().toString().padStart(2, '0')
      const ss = this.lastUpdated.getSeconds().toString().padStart(2, '0')
      return `${d}/${m}/${y} ${hh}:${mm}:${ss}`
    },
    heroStats () {
      return [
        {
          label: this.$t('vehicleManagement.statTotal'),
          value: String(this.stats.total),
          icon: 'cil-car-alt',
          iconClass: 'app-section-stat__icon--total'
        },
        {
          label: this.$t('vehicleManagement.statPending'),
          value: String(this.stats.pending),
          icon: 'cil-history',
          iconClass: 'app-section-stat__icon--attention'
        },
        {
          label: this.$t('vehicleManagement.statApproved'),
          value: String(this.stats.approved),
          icon: 'cil-check-circle',
          iconClass: 'app-section-stat__icon--active'
        },
        {
          label: this.$t('vehicleManagement.statRejected'),
          value: String(this.stats.rejected),
          icon: 'cil-x-circle',
          iconClass: 'app-section-stat__icon--danger'
        }
      ]
    }
  },
  watch: {
    searchQuery () {
      this.debounceLoadVehicles()
    },
    statusFilter () {
      this.debounceLoadVehicles()
    }
  },
  mounted () {
    this.loadVehicles()
  },
  methods: {
    async loadVehicles () {
      try {
        console.log('Fetching vehicles with status filter:', this.statusFilter)
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
    calculateStats (items) {
      // Kept for compatibility but stats are now handled via backend response.
    },
    debounceLoadVehicles () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(this.loadVehicles, 300)
    },
    onSearch (value) {
      this.searchQuery = value
    },
    onFilterStatus (value) {
      this.statusFilter = value
    },
    async onExport () {
      try {
        const blob = await exportVehicles(this.searchQuery, this.statusFilter)
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'owner_vehicles.csv')
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
        this.notifyToast(this.$t('ivts.toast.exportSuccess') || 'Export successful', 'success')
      } catch (error) {
        this.notifyToast(this.$t('ivts.toast.exportFailed') || 'Export failed', 'danger')
      }
    },
    async handleApprove (id) {
      try {
        await approveVehicle(id)
        this.notifyToast(this.$t('ivts.toast.approveSuccess'), 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast(this.$t('ivts.toast.approveFailed'), 'danger')
      }
    },
    handleReject (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.verifyModalMode = 'verify'
        this.showVerifyModal = true
      }
    },
    handleDelete (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.showDeleteModal = true
      }
    },
    handleView (id) {
      const vehicle = this.vehicles.find(item => item._id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.verifyModalMode = 'view'
        this.showVerifyModal = true
      }
    },
    handleToggleSelect (id) {
      if (id === 'all') {
        if (this.selectedIds.size === this.vehicles.length) {
          this.selectedIds = new Set()
        } else {
          this.selectedIds = new Set(this.vehicles.map(v => v._id))
        }
      } else if (id === null) {
        this.selectedIds = new Set()
      } else {
        const next = new Set(this.selectedIds)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        this.selectedIds = next
      }
    },
    async confirmDelete () {
      if (!this.currentVehicle) return
      try {
        await deleteVehicle(this.currentVehicle._id)
        this.showDeleteModal = false
        this.notifyToast(this.$t('ivts.toast.deleteSuccess'), 'success')
        await this.loadVehicles()
      } catch (error) {
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
      } catch (error) {
        this.notifyToast(this.$t('ivts.toast.approveDocFailed'), 'danger')
      }
    },
    async confirmReject (id, reasons, note) {
      if (!id) return
      try {
        // Need to pass the reasons and note to the backend
        // Update this line according to your rejectVehicle API signature
        await rejectVehicle(id, { reasons, note })
        this.showVerifyModal = false
        this.notifyToast(this.$t('ivts.toast.rejectDocSuccess'), 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast(this.$t('ivts.toast.rejectDocFailed'), 'danger')
      }
    },
    notifyToast (message, color = 'info') {
      this.$store.dispatch('dialog/showToast', { message, color })
    }
  }
}
</script>

<style scoped lang="scss">
.vehicle-management-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>