<template>
  <CModal
    :show="visible"
    @update:show="onVisibleChange"
    size="lg"
    centered
    backdrop
  >
    <CModalHeader>{{ mode === 'view' ? 'Vehicle Details' : 'Verify Document' }}</CModalHeader>

    <CModalBody>
      <div class="verify-document-modal">
        <div class="verify-document-modal__image">
          <CImg
            v-if="hasDocImage && !imageLoadFailed"
            :src="vehicle.docImageUrl"
            alt="Document Image"
            fluid
            rounded
            @error="imageLoadFailed = true"
          />
          <div v-else class="verify-document-modal__placeholder">
            {{ $t('ivts.cannotLoadDoc') }}
          </div>
        </div>

        <div class="verify-document-modal__info">
          <div class="verify-document-modal__row">
            <span class="label">{{ $t('ivts.vehicles') }}</span>
            <span class="value">{{ vehiclePlateDisplay }}</span>
          </div>
          <div class="verify-document-modal__row">
            <span class="label">{{ $t('ivts.ownerName') }}</span>
            <span class="value">{{ ownerNameDisplay }}</span>
          </div>
          
          <div v-if="mode === 'view'" class="verify-document-modal__row mt-2">
            <span class="label">{{ $t('ivts.accountStatus') }}</span>
            <span class="value">
              <CBadge :color="accountStatusColor(vehicle.accountStatus)">
                {{ vehicle.accountStatus || '-' }}
              </CBadge>
            </span>
          </div>

          <div v-if="showRejectReason && mode === 'verify'" class="verify-document-modal__reason">
            <label class="reason-label">{{ $t('ivts.rejectReason') }}</label>
            <CTextarea
              v-model="rejectReason"
              rows="4"
              :placeholder="$t('ivts.rejectReasonPlaceholder')"
            />
          </div>
        </div>
      </div>
    </CModalBody>

    <template #footer>
      <CButton color="secondary" size="sm" variant="outline" @click="onCancel">
        {{ mode === 'view' ? 'Close' : 'Cancel' }}
      </CButton>
      <template v-if="mode === 'verify'">
        <CButton color="success" size="sm" class="ms-2" @click="onApprove">
          Approve
        </CButton>
        <CButton
          v-if="!showRejectReason"
          color="danger"
          size="sm"
          class="ms-2"
          variant="outline"
          @click="onStartReject"
        >
          Reject
        </CButton>
        <CButton
          v-else
          color="danger"
          size="sm"
          class="ms-2"
          @click="onConfirmReject"
          :disabled="isRejectReasonEmpty"
        >
          {{ $t('ivts.confirmReject') }}
        </CButton>
      </template>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'VerifyDocumentModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'verify' // 'verify' or 'view'
    },
    vehicle: {
      type: Object,
      default: () => ({ plate: '', docImageUrl: '', owner: '', accountStatus: '' })
    }
  },
  data () {
    return {
      showRejectReason: false,
      rejectReason: '',
      imageLoadFailed: false
    }
  },
  computed: {
    hasDocImage () {
      return !!(this.vehicle && this.vehicle.docImageUrl)
    },
    vehiclePlateDisplay () {
      return (this.vehicle && this.vehicle.plate) || '-'
    },
    ownerNameDisplay () {
      return (this.vehicle && this.vehicle.owner) || '-'
    },
    isRejectReasonEmpty () {
      return !this.rejectReason.trim()
    }
  },
  watch: {
    visible (newValue) {
      if (!newValue) {
        this.showRejectReason = false
        this.rejectReason = ''
      } else {
        this.imageLoadFailed = false
      }
    },
    vehicle () {
      this.imageLoadFailed = false
    }
  },
  methods: {
    accountStatusColor (status) {
      if (status === 'Active') return 'success'
      if (status === 'Suspended') return 'secondary'
      return 'secondary'
    },
    onVisibleChange (value) {
      this.$emit('update:visible', value)
    },
    onCancel () {
      this.$emit('update:visible', false)
    },
    onApprove () {
      this.$emit('approve', this.vehicle)
      this.$emit('update:visible', false)
    },
    onStartReject () {
      this.showRejectReason = true
    },
    onConfirmReject () {
      if (!this.rejectReason.trim()) return
      this.$emit('reject', { vehicle: this.vehicle, reason: this.rejectReason.trim() })
      this.$emit('update:visible', false)
      this.showRejectReason = false
      this.rejectReason = ''
    }
  }
}
</script>

<style scoped>
.verify-document-modal {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.verify-document-modal__image {
  flex: 1 1 320px;
  min-width: 320px;
}

.verify-document-modal__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  background-color: var(--cui-tertiary-bg);
  color: var(--cui-secondary);
  border-radius: 0.5rem;
  text-align: center;
  padding: 1rem;
}

.verify-document-modal__info {
  flex: 1 1 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verify-document-modal__row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.verify-document-modal__row .label {
  font-size: 0.85rem;
  color: var(--cui-secondary);
}

.verify-document-modal__row .value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--cui-body-color);
}

.verify-document-modal__reason {
  width: 100%;
}

.reason-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--cui-body-color);
}
</style>