<template>
  <CRow class="vehicle-stats-cards gx-3 gy-3">
    <CCol xl="3" md="6" sm="6" col="12">
      <CCard class="vehicle-stats-card">
        <CCardBody class="vehicle-stats-card__body">
          <div class="vehicle-stats-card__label">Total Vehicles</div>
          <div class="vehicle-stats-card__value">{{ stats.total }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xl="3" md="6" sm="6" col="12">
      <CCard class="vehicle-stats-card">
        <CCardBody class="vehicle-stats-card__body">
          <div class="vehicle-stats-card__label">Pending Verification</div>
          <div class="vehicle-stats-card__value vehicle-stats-card__value--warning">
            {{ stats.pending }}
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xl="3" md="6" sm="6" col="12">
      <CCard class="vehicle-stats-card">
        <CCardBody class="vehicle-stats-card__body">
          <div class="vehicle-stats-card__label">Approved</div>
          <div class="vehicle-stats-card__value vehicle-stats-card__value--success">
            {{ stats.approved }}
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <CCol xl="3" md="6" sm="6" col="12">
      <CCard class="vehicle-stats-card">
        <CCardBody class="vehicle-stats-card__body">
          <div class="vehicle-stats-card__label">Rejected</div>
          <div class="vehicle-stats-card__value vehicle-stats-card__value--danger">
            {{ stats.rejected }}
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script setup>
import { PropType } from 'vue'

const props = defineProps({
  stats: {
    type: Object as PropType<{
      total: NumberConstructor | number
      pending: NumberConstructor | number
      approved: NumberConstructor | number
      rejected: NumberConstructor | number
    }>,
    required: true
  }
})
</script>

<style scoped>
.vehicle-stats-cards {
  width: 100%;
}

.vehicle-stats-card {
  background-color: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  min-height: 130px;
}

.vehicle-stats-card__body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.vehicle-stats-card__label {
  font-size: 13px;
  line-height: 1.4;
  color: var(--cui-body-color);
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.vehicle-stats-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--cui-body-color);
}

.vehicle-stats-card__value--warning {
  color: var(--cui-warning);
}

.vehicle-stats-card__value--success {
  color: var(--cui-success);
}

.vehicle-stats-card__value--danger {
  color: var(--cui-danger);
}

@media (max-width: 767.98px) {
  .vehicle-stats-card {
    min-height: 120px;
  }
}
</style>
