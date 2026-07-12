<template>
  <div class="vehicle-management-page">
    <h2 class="vehicle-management-page__title">{{ $t('vehicleManagement.title') }}</h2>

    <AppSectionHero
      :title="$t('vehicleManagement.title')"
      :subtitle="$t('vehicleManagement.subtitle')"
      :stats="heroStats"
      :meta-label="$t('common.lastUpdated')"
      :meta-value="lastUpdatedLabel"
    />

    <CCard>
      <CCardBody>
        <div class="vehicle-management-page__actions">
          <CButton color="primary" @click="openWebsite">
            {{ $t('vehicleManagement.actions.openWebsite') }}
          </CButton>
        </div>

        <div class="vehicle-management-page__content">
          <p>{{ $t('vehicleManagement.placeholder') }}</p>
        </div>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero'

export default {
  name: 'VehicleManagement',
  components: { AppSectionHero },
  data () {
    return {
      lastUpdatedLabel: '2026-07-11'
    }
  },
  computed: {
    heroStats () {
      return [
        { label: this.$t('Total Accounts'), value: '0', hint: this.$t('Profiles returned from IAM'), icon: 'cil-car-alt', iconClass: 'app-section-stat__icon--total' },
        { label: this.$t('Active'), value: '0', hint: this.$t('Ready for sign-in and access'), icon: 'cil-check-circle', iconClass: 'app-section-stat__icon--active' }
      ]
    }
  },
  methods: {
    openWebsite () {
      window.open('https://ivts.mfu.ac.th', '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style scoped lang="scss">
.vehicle-management-page {
  &__title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  &__actions {
    margin-bottom: 1rem;
  }

  &__content {
    color: #5c6873;
  }
}
</style>
