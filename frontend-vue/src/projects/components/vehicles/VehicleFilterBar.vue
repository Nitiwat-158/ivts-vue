<template>
  <div class="vehicle-filter-bar d-flex align-items-center" style="gap: 1rem;">
    <div class="vehicle-filter-bar__field" style="min-width: 250px;">
      <CInput
        :value="searchTerm"
        @update:value="searchTerm = $event"
        :placeholder="$t('ivts.searchPlateUser')"
        size="sm"
        class="mb-0"
      />
    </div>

    <div class="vehicle-filter-bar__field" style="min-width: 180px;">
      <CSelect
        :value="status"
        @update:value="status = $event"
        :options="statusOptions"
        size="sm"
        class="mb-0"
      />
    </div>

    <!-- Optional Page Size Selector (to match Image 2) -->
    <div class="vehicle-filter-bar__field" style="width: 70px;">
      <CSelect
        value="25"
        :options="['25', '50', '100']"
        size="sm"
        class="mb-0"
      />
    </div>

    <div class="vehicle-filter-bar__action">
      <CButton size="sm" color="success" variant="outline" class="font-weight-bold" @click="onExport">
        <CIcon name="cil-cloud-download" class="mr-1" />
        {{ $t('vehicleManagement.export') }}
      </CButton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleFilterBar',
  data () {
    return {
      searchTerm: '',
      status: 'all',
      searchTimeout: null
    }
  },
  computed: {
    statusOptions() {
      return [
        { value: 'all', label: this.$t('ivts.filterAll') },
        { value: 'Pending', label: this.$t('ivts.filterPending') },
        { value: 'Approved', label: this.$t('ivts.filterApproved') },
        { value: 'Rejected', label: this.$t('ivts.filterRejected') }
      ]
    }
  },
  watch: {
    searchTerm () {
      this.debounceEmitSearch()
    },
    status (value) {
      this.$emit('filter-status', value)
    }
  },
  beforeDestroy () {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    debounceEmitSearch () {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.searchTerm)
      }, 300)
    },
    onExport () {
      this.$emit('export')
    }
  }
}
</script>

<style scoped>
.vehicle-filter-bar {
  width: 100%;
  align-items: center;
}

.vehicle-filter-bar__field {
  position: relative;
  min-width: 220px;
  flex: 1 1 auto;
}

.vehicle-filter-bar__field input,
.vehicle-filter-bar__field select {
  border-radius: 0.375rem;
  min-height: 36px;
  height: 36px;
  padding-right: 2.4rem;
  box-shadow: none;
  border-color: rgba(15, 23, 42, 0.16);
}

.vehicle-filter-bar__field select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg%20width='10'%20height='6'%20viewBox='0%200%2010%206'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cpath%20d='M1%201L5%205L9%201'%20stroke='%23333'%20stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  background-size: 10px 6px;
}

.vehicle-filter-bar__action {
  display: flex;
  align-items: center;
  height: 36px;
}

.vehicle-filter-bar__action .btn {
  min-height: 36px;
  height: 36px;
  border-radius: 0.375rem;
  padding: 0 1rem;
  align-items: center;
  display: inline-flex;
}

@media (max-width: 767.98px) {
  .vehicle-filter-bar {
    gap: 0.75rem;
  }

  .vehicle-filter-bar__field,
  .vehicle-filter-bar__action {
    width: 100%;
    min-width: auto;
  }
}
</style>