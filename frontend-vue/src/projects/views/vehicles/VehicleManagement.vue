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

    <VehicleFilterBar
      @search="onSearch"
      @filter-status="onFilterStatus"
      @export="onExport"
    />

    <VehicleTable
      :vehicles="vehicles"
      :selectedIds="Array.from(selectedIds)"
      @approve="handleApprove"
      @reject="handleReject"
      @delete="handleDelete"
      @view="handleView"
      @toggle-select="handleToggleSelect"
    />

    <ConfirmDeleteModal
      :visible="showDeleteModal"
      :vehiclePlate="(currentVehicle && currentVehicle.plate) || ''"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
      @update:visible="val => (showDeleteModal = val)"
    />

    <VerifyDocumentModal
      :visible="showVerifyModal"
      :vehicle="currentVehicle"
      @approve="confirmVerify"
      @reject="confirmReject"
      @update:visible="val => (showVerifyModal = val)"
    />
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue'
import VehicleFilterBar from '@/projects/components/vehicles/VehicleFilterBar.vue'
import VehicleTable from '@/projects/components/vehicles/VehicleTable.vue'
import ConfirmDeleteModal from '@/projects/components/vehicles/ConfirmDeleteModal.vue'
import VerifyDocumentModal from '@/projects/components/vehicles/VerifyDocumentModal.vue'
import {
  fetchVehicles,
  approveVehicle,
  rejectVehicle,
  deleteVehicle
} from '@/projects/views/vehicles/useVehicleApi'

export default {
  name: 'VehicleManagement',
  components: {
    AppSectionHero,
    VehicleFilterBar,
    VehicleTable,
    ConfirmDeleteModal,
    VerifyDocumentModal
  },
  data () {
    return {
      lastUpdatedLabel: '2026-07-11',
      vehicles: [],
      stats: { total: 0, pending: 0, approved: 0, rejected: 0 },
      searchQuery: '',
      statusFilter: 'all',
      selectedIds: new Set(),
      showDeleteModal: false,
      showVerifyModal: false,
      currentVehicle: null,
      loading: false,
      searchTimeout: null
    }
  },
  computed: {
    heroStats () {
      return [
        {
          label: this.$t('Total Vehicles'),
          value: String(this.stats.total),
          icon: 'cil-car-alt',
          iconClass: 'app-section-stat__icon--total'
        },
        {
          label: this.$t('Pending Verification'),
          value: String(this.stats.pending),
          icon: 'cil-history',
          iconClass: 'app-section-stat__icon--attention'
        },
        {
          label: this.$t('Approved'),
          value: String(this.stats.approved),
          icon: 'cil-check-circle',
          iconClass: 'app-section-stat__icon--active'
        },
        {
          label: this.$t('Rejected'),
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
        this.loading = true
        const response = await fetchVehicles(this.searchQuery, this.statusFilter)
        this.vehicles = response
        this.calculateStats(response)
      } catch (error) {
        this.notifyToast('ไม่สามารถโหลดข้อมูลรถได้', 'danger')
      } finally {
        this.loading = false
      }
    },
    calculateStats (items) {
      this.stats = {
        total: items.length,
        pending: items.filter(item => item.docStatus === 'Pending').length,
        approved: items.filter(item => item.docStatus === 'Approved').length,
        rejected: items.filter(item => item.docStatus === 'Rejected').length
      }
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
    onExport () {
      this.notifyToast('Export triggered', 'info')
    },
    async handleApprove (id) {
      try {
        await approveVehicle(id)
        this.notifyToast('อนุมัติเรียบร้อย', 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast('อนุมัติไม่สำเร็จ', 'danger')
      }
    },
    handleReject (id) {
      const vehicle = this.vehicles.find(item => item.id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.showVerifyModal = true
      }
    },
    handleDelete (id) {
      const vehicle = this.vehicles.find(item => item.id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.showDeleteModal = true
      }
    },
    handleView (id) {
      const vehicle = this.vehicles.find(item => item.id === id)
      if (vehicle) {
        this.currentVehicle = vehicle
        this.showVerifyModal = true
      }
    },
    handleToggleSelect (id) {
      if (id === 'all') {
        if (this.selectedIds.size === this.vehicles.length) {
          this.selectedIds = new Set()
        } else {
          this.selectedIds = new Set(this.vehicles.map(v => v.id))
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
        await deleteVehicle(this.currentVehicle.id)
        this.showDeleteModal = false
        this.notifyToast('ลบรถเรียบร้อย', 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast('ลบรถไม่สำเร็จ', 'danger')
      }
    },
    async confirmVerify () {
      if (!this.currentVehicle) return
      try {
        await approveVehicle(this.currentVehicle.id)
        this.showVerifyModal = false
        this.notifyToast('อนุมัติเอกสารเรียบร้อย', 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast('อนุมัติเอกสารไม่สำเร็จ', 'danger')
      }
    },
    async confirmReject ({ vehicle, reason }) {
      if (!vehicle) return
      try {
        await rejectVehicle(vehicle.id, reason)
        this.showVerifyModal = false
        this.notifyToast('ปฏิเสธเอกสารเรียบร้อย', 'success')
        await this.loadVehicles()
      } catch (error) {
        this.notifyToast('ปฏิเสธเอกสารไม่สำเร็จ', 'danger')
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