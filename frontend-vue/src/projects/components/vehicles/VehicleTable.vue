<template>
  <div class="vehicle-table-wrapper">
    <div v-if="vehicles.length === 0" class="vehicle-table-empty text-center py-5" style="background-color: #f1f3f5; min-height: 200px; display: flex; align-items: center; justify-content: center;">
      <h4 class="text-secondary font-weight-normal mb-0" style="color: #4f5d73;">
        {{ $t('vehicleManagement.noItems') }} <CIcon name="cil-ban" class="text-danger ml-2" size="xl" />
      </h4>
    </div>

    <div v-else class="vehicle-table-scroll">
      <table class="table table-hover vehicle-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 56px;">
              <CInputCheckbox
                ref="selectAllCheckbox"
                :checked="isAllSelected"
                custom
                @update:checked="toggleSelectAll"
              />
            </th>
            <th>{{ $t('ivts.vehicles') }}</th>
            <th>{{ $t('ivts.owner') }}</th>
            <th>{{ $t('ivts.docStatus') }}</th>
            <th>{{ $t('ivts.accountStatus') }}</th>
            <th class="text-end">{{ $t('vehicleManagement.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicles" :key="vehicle._id">
            <td class="text-center">
              <CInputCheckbox
                :checked="isSelected(vehicle._id)"
                custom
                @update:checked="toggleSelect(vehicle._id)"
              />
            </td>
            <td>{{ vehicle.vehicle ? vehicle.vehicle.license_plate : '-' }}</td>
            <td>{{ vehicle.user ? `${vehicle.user.name || ''} ${vehicle.user.surname || ''}`.trim() : '-' }}</td>
            <td>
              <CBadge
                :color="docStatusColor(vehicle.document_status)"
                class="vehicle-badge vehicle-badge--doc"
                :class="{
                  'vehicle-badge--pending': vehicle.document_status === 'Pending',
                  'vehicle-badge--approved': vehicle.document_status === 'Approved',
                  'vehicle-badge--rejected': vehicle.document_status === 'Rejected'
                }"
                shape="rounded-pill"
              >
                {{ vehicle.document_status }}
              </CBadge>
            </td>
            <td>
              <CBadge
                :color="accountStatusColor(vehicle.account_status)"
                class="vehicle-badge vehicle-badge--account"
                :class="{
                  'vehicle-badge--active': vehicle.account_status === 'Active',
                  'vehicle-badge--suspended': vehicle.account_status === 'Suspended',
                  'vehicle-badge--inactive': vehicle.account_status === 'Inactive'
                }"
                shape="rounded-pill"
              >
                {{ vehicle.account_status }}
              </CBadge>
            </td>
            <td class="text-end">
              <div class="vehicle-table-actions">
                <CButton
                  v-if="vehicle.document_status === 'Pending'"
                  size="sm"
                  color="success"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipApprove'), placement: 'top' }"
                  @click="emitEvent('approve', vehicle._id)"
                >
                  <CIcon name="cil-check" />
                </CButton>
                <CButton
                  v-if="vehicle.document_status === 'Pending'"
                  size="sm"
                  color="danger"
                  variant="outline"
                  shape="pill"
                  class="vehicle-action-btn"
                  v-c-tooltip="{ content: $t('vehicleManagement.tooltipReject'), placement: 'top' }"
                  @click="emitEvent('reject', vehicle._id)"
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
                  @click="emitEvent('view', vehicle._id)"
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
                  @click="emitEvent('delete', vehicle._id)"
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
    vehicles () {
      this.updateSelectAllState()
    },
    isAllSelected () {
      this.updateSelectAllState()
    },
    isSomeSelected () {
      this.updateSelectAllState()
    }
  },
  mounted () {
    this.updateSelectAllState()
  },
  methods: {
    isSelected (id) {
      return this.selectedIdsSet.has(id)
    },
    updateSelectAllState () {
      this.$nextTick(() => {
        const checkboxEl = this.$refs.selectAllCheckbox && this.$refs.selectAllCheckbox.$el
          ? this.$refs.selectAllCheckbox.$el.querySelector('input')
          : null
        if (checkboxEl) {
          checkboxEl.indeterminate = this.isSomeSelected
        }
      })
    },
    toggleSelect (vehicleId) {
      this.$emit('toggle-select', vehicleId)
    },
    toggleSelectAll () {
      this.$emit('toggle-select', this.isAllSelected ? null : 'all')
    },
    emitEvent (name, id) {
      this.$emit(name, id)
    },
    docStatusColor (status) {
      if (status === 'Pending') return 'warning'
      if (status === 'Approved') return 'success'
      if (status === 'Rejected') return 'danger'
      return 'secondary'
    },
    accountStatusColor (status) {
      if (status === 'Active') return 'success'
      if (status === 'Suspended') return 'secondary'
      return 'secondary'
    }
  }
}
</script>

<style scoped>
.vehicle-table-wrapper {
  width: 100%;
}

.vehicle-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.vehicle-table {
  min-width: 780px;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.vehicle-table th {
  padding: 12px 16px;
  vertical-align: middle;
  font-weight: 700;
  color: #3c4b64;
  background-color: #f8f9fa;
  border-bottom: 2px solid #d8dbe0;
  text-transform: capitalize;
}

.vehicle-table td {
  padding: 12px 16px;
  vertical-align: middle;
  border-bottom: 1px solid #d8dbe0;
}

.vehicle-table tbody tr {
  transition: background-color 0.2s ease;
}

.vehicle-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.vehicle-table-actions {
  white-space: nowrap;
  display: inline-flex;
  justify-content: flex-end;
  gap: 4px;
}

.vehicle-action-btn {
  width: 32px;
  height: 32px;
  min-width: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.vehicle-action-btn .c-icon,
.vehicle-action-btn .cil {
  font-size: 1rem;
}

.vehicle-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid transparent;
}

.vehicle-badge--doc.vehicle-badge--pending {
  background-color: rgba(255, 216, 0, 0.14) !important;
  color: #8f6a00 !important;
  border-color: rgba(255, 216, 0, 0.28) !important;
}

.vehicle-badge--doc.vehicle-badge--approved {
  background-color: rgba(40, 167, 69, 0.12) !important;
  color: #1f6b3a !important;
  border-color: rgba(40, 167, 69, 0.2) !important;
}

.vehicle-badge--doc.vehicle-badge--rejected {
  background-color: rgba(220, 53, 69, 0.12) !important;
  color: #7a1f2a !important;
  border-color: rgba(220, 53, 69, 0.2) !important;
}

.vehicle-badge--account.vehicle-badge--success {
  background-color: rgba(40, 167, 69, 0.12) !important;
  color: #1f6b3a !important;
  border-color: rgba(40, 167, 69, 0.2) !important;
}

.vehicle-badge--account.vehicle-badge--secondary {
  background-color: rgba(108, 117, 125, 0.12) !important;
  color: #495057 !important;
  border-color: rgba(108, 117, 125, 0.2) !important;
}

.vehicle-table-empty {
  padding: 2rem;
  text-align: center;
  color: var(--cui-secondary);
  background-color: var(--cui-tertiary-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.5rem;
}
</style>