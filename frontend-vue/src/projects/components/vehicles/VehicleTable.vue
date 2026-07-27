<template>
  <div class="vehicle-table-wrapper">
    <div v-if="vehicles.length === 0" class="vehicle-table-empty text-center py-5">
      <CIcon name="cil-car-alt" class="text-secondary mb-3" size="3xl" />
      <p class="text-muted mb-0">{{ $t('vehicleManagement.noItems') }}</p>
    </div>

    <div v-else class="vehicle-table-scroll">
      <table class="table table-hover vehicle-table mb-0">
        <thead>
          <tr>
            <th class="text-center" style="width: 48px;">
              <CInputCheckbox
                ref="selectAllCheckbox"
                :checked="isAllSelected"
                custom
                @update:checked="toggleSelectAll"
              />
            </th>
            <th>{{ $t('ivts.vehicles') }}</th>
            <th>{{ $t('ivts.owner') }}</th>
            <th>ประเภท</th>
            <th>วันหมดอายุ</th>
            <th>{{ $t('ivts.docStatus') }}</th>
            <th class="text-center">{{ $t('vehicleManagement.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in vehicles" :key="item._id" :class="{ 'selected-row': isSelected(item._id) }">
            <!-- Checkbox -->
            <td class="text-center">
              <CInputCheckbox
                :checked="isSelected(item._id)"
                custom
                @update:checked="toggleSelect(item._id)"
              />
            </td>

            <!-- Vehicle -->
            <td>
              <div class="vehicle-cell">
                <span class="vehicle-plate">{{ plateNumber(item) }}</span>
                <span v-if="vehicleCode(item)" class="vehicle-code text-muted">
                  {{ vehicleCode(item) }}
                </span>
                <span v-if="vehicleBrand(item)" class="vehicle-brand text-muted">
                  {{ vehicleBrand(item) }}
                </span>
              </div>
            </td>

            <!-- Owner -->
            <td>
              <span v-if="ownerName(item)" class="owner-name">{{ ownerName(item) }}</span>
              <span v-else class="text-muted">-</span>
            </td>

            <!-- Type -->
            <td>
              <CBadge :color="typeColor(item)" shape="rounded-pill" class="type-badge">
                {{ vehicleTypeLabel(item) }}
              </CBadge>
            </td>

            <!-- Validity expiry -->
            <td>
              <span :class="expiryClass(item)">{{ expiryLabel(item) }}</span>
            </td>

            <!-- Document Status -->
            <td>
              <CBadge
                :color="docStatusColor(item.document_status)"
                class="vehicle-badge"
                :class="docStatusClass(item.document_status)"
                shape="rounded-pill"
              >
                {{ docStatusLabel(item.document_status) }}
              </CBadge>
            </td>

            <!-- Actions -->
            <td class="text-center">
              <div class="vehicle-table-actions">
                <CButton
                  v-if="item.document_status === 'Pending'"
                  size="sm"
                  color="success"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipApprove'), placement: 'top' }"
                  @click="emitEvent('approve', item._id)"
                >
                  <CIcon name="cil-check" />
                </CButton>
                <CButton
                  v-if="item.document_status === 'Pending'"
                  size="sm"
                  color="warning"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipReject'), placement: 'top' }"
                  @click="emitEvent('reject', item._id)"
                >
                  <CIcon name="cil-x" />
                </CButton>
                <CButton
                  size="sm"
                  color="info"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipView'), placement: 'top' }"
                  @click="emitEvent('view', item._id)"
                >
                  <CIcon name="cil-magnifying-glass" />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipDelete'), placement: 'top' }"
                  @click="emitEvent('delete', item._id)"
                >
                  <CIcon name="cil-trash" />
                </CButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleTable',
  props: {
    vehicles: {
      type: Array,
      default: () => []
    },
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedIdsSet () {
      return new Set(this.selectedIds || [])
    },
    isAllSelected () {
      return this.vehicles.length > 0 && this.selectedIdsSet.size === this.vehicles.length
    },
    isSomeSelected () {
      return this.selectedIdsSet.size > 0 && this.selectedIdsSet.size < this.vehicles.length
    }
  },
  watch: {
    vehicles () { this.updateSelectAllState() },
    isAllSelected () { this.updateSelectAllState() },
    isSomeSelected () { this.updateSelectAllState() }
  },
  mounted () { this.updateSelectAllState() },
  methods: {
    // ─── Data accessors ──────────────────────────────────────────────────────
    plateNumber (item) {
      return (item.vehicle && item.vehicle.plate_number) || String(item._id) || '-'
    },
    vehicleCode (item) {
      const code = item.vehicle && item.vehicle.vehicle_code
      return code && code !== item._id ? code : null
    },
    vehicleBrand (item) {
      const v = item.vehicle || {}
      const parts = [v.brand, v.model, v.color].filter(Boolean)
      return parts.join(' · ') || null
    },
    ownerName (item) {
      if (item.user && (item.user.name || item.user.surname)) {
        return [item.user.name, item.user.surname].filter(Boolean).join(' ')
      }
      return (item.vehicle && item.vehicle.owner_name) || null
    },
    vehicleTypeLabel (item) {
      const t = (item.vehicle && item.vehicle.type) || ''
      if (t === 'car') return 'รถยนต์'
      if (t === 'motorcycle') return 'มอเตอร์ไซค์'
      return t || '-'
    },
    typeColor (item) {
      const t = (item.vehicle && item.vehicle.type) || ''
      if (t === 'car') return 'info'
      if (t === 'motorcycle') return 'warning'
      return 'secondary'
    },
    expiryLabel (item) {
      const exp = item.vehicle && item.vehicle.validity_expiry
      if (!exp) return '-'
      const d = new Date(exp)
      const dd = d.getDate().toString().padStart(2, '0')
      const mm = (d.getMonth() + 1).toString().padStart(2, '0')
      const yy = d.getFullYear() + 543
      return dd + '/' + mm + '/' + yy
    },
    expiryClass (item) {
      const exp = item.vehicle && item.vehicle.validity_expiry
      if (!exp) return 'text-muted'
      const diff = new Date(exp) - new Date()
      if (diff < 0) return 'text-danger font-weight-bold'
      if (diff < 30 * 24 * 60 * 60 * 1000) return 'text-warning font-weight-bold'
      return 'text-dark'
    },
    docStatusLabel (status) {
      if (status === 'Pending') return 'รอตรวจสอบ'
      if (status === 'Approved') return 'อนุมัติแล้ว'
      if (status === 'Rejected') return 'ปฏิเสธ'
      return status || '-'
    },
    docStatusColor (status) {
      if (status === 'Pending') return 'warning'
      if (status === 'Approved') return 'success'
      if (status === 'Rejected') return 'danger'
      return 'secondary'
    },
    docStatusClass (status) {
      if (status === 'Pending') return 'badge--pending'
      if (status === 'Approved') return 'badge--approved'
      if (status === 'Rejected') return 'badge--rejected'
      return ''
    },

    // ─── Selection ───────────────────────────────────────────────────────────
    isSelected (id) { return this.selectedIdsSet.has(id) },
    updateSelectAllState () {
      this.$nextTick(() => {
        const el = this.$refs.selectAllCheckbox && this.$refs.selectAllCheckbox.$el
          ? this.$refs.selectAllCheckbox.$el.querySelector('input')
          : null
        if (el) el.indeterminate = this.isSomeSelected
      })
    },
    toggleSelect (id) { this.$emit('toggle-select', id) },
    toggleSelectAll () {
      this.$emit('toggle-select', this.isAllSelected ? null : 'all')
    },
    emitEvent (name, id) { this.$emit(name, id) }
  }
}
</script>

<style scoped>
.vehicle-table-wrapper { width: 100%; }
.vehicle-table-scroll { width: 100%; overflow-x: auto; }

.vehicle-table {
  min-width: 860px;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.vehicle-table th {
  padding: 11px 14px;
  vertical-align: middle;
  font-weight: 700;
  font-size: 0.8rem;
  color: #3c4b64;
  background-color: #f8f9fa;
  border-bottom: 2px solid #d8dbe0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.vehicle-table td {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 1px solid #eaecf0;
}

.vehicle-table tbody tr { transition: background-color 0.15s ease; }
.vehicle-table tbody tr:hover { background-color: rgba(50, 110, 200, 0.04); }
.vehicle-table tbody tr.selected-row { background-color: rgba(50, 110, 200, 0.07); }

/* Vehicle cell */
.vehicle-cell { display: flex; flex-direction: column; gap: 2px; }
.vehicle-plate { font-weight: 700; color: #2c3e50; font-size: 0.92rem; }
.vehicle-code { font-size: 0.75rem; }
.vehicle-brand { font-size: 0.73rem; color: #8a9bb0; }

/* Owner */
.owner-name { font-size: 0.88rem; color: #3c4b64; }

/* Type badge */
.type-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.6rem; }

/* Document status badge */
.vehicle-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid transparent;
}
.vehicle-badge.badge--pending {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: #856404 !important;
  border-color: rgba(255, 193, 7, 0.3) !important;
}
.vehicle-badge.badge--approved {
  background-color: rgba(40, 167, 69, 0.12) !important;
  color: #1f6b3a !important;
  border-color: rgba(40, 167, 69, 0.22) !important;
}
.vehicle-badge.badge--rejected {
  background-color: rgba(220, 53, 69, 0.12) !important;
  color: #7a1f2a !important;
  border-color: rgba(220, 53, 69, 0.22) !important;
}

/* Actions */
.vehicle-table-actions {
  white-space: nowrap;
  display: inline-flex;
  justify-content: center;
  gap: 4px;
}
.vehicle-action-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
}

/* Empty state */
.vehicle-table-empty {
  background-color: #f8f9fa;
  border: 1px dashed #d0d7e0;
  border-radius: 0.75rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  margin: 1rem;
}
</style>
