<template>
  <CModal
    :show="visible"
    @update:show="onVisibleChange"
    size="lg"
    centered
    backdrop
  >
    <CModalHeader>Verify Document</CModalHeader>

    <CModalBody>
      <div class="verify-document-modal">
        <div class="verify-document-modal__image">
          <CImg
            v-if="hasDocImage"
            :src="vehicle.docImageUrl"
            alt="Document Image"
            fluid
            rounded
          />
          <div v-else class="verify-document-modal__placeholder">
            ไม่มีรูปเอกสาร
          </div>
        </div>

        <div class="verify-document-modal__info">
          <div class="verify-document-modal__row">
            <span class="label">ทะเบียนรถ</span>
            <span class="value">{{ vehiclePlateDisplay }}</span>
          </div>
          <div class="verify-document-modal__row">
            <span class="label">ชื่อเจ้าของ</span>
            <span class="value">{{ ownerNameDisplay }}</span>
          </div>

          <div v-if="showRejectReason" class="verify-document-modal__reason">
            <label class="reason-label">เหตุผลการปฏิเสธ</label>
            <CTextarea
              v-model="rejectReason"
              rows="4"
              placeholder="กรุณาระบุเหตุผลการปฏิเสธ"
            />
          </div>
        </div>
      </div>
    </CModalBody>

    <CModalFooter class="justify-content-end">
      <CButton color="secondary" size="sm" variant="outline" @click="onCancel">
        Cancel
      </CButton>
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
        ยืนยัน Reject
      </CButton>
    </CModalFooter>
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
    vehicle: {
      type: Object,
      default: () => ({ plate: '', docImageUrl: '', ownerName: '' })
    }
  },
  data () {
    return {
      showRejectReason: false,
      rejectReason: ''
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
      return (this.vehicle && this.vehicle.ownerName) || '-'
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
      }
    }
  },
  methods: {
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