<template>
  <CModal :show="visible" @update:show="onClose" centered backdrop size="lg">
    <CModalHeader closeButton :class="isApprove ? 'bg-success text-white' : 'bg-danger text-white'">
      <h5 class="mb-0 font-weight-bold">
        <CIcon :name="isApprove ? 'cil-check-circle' : 'cil-x-circle'" class="mr-2" />
        {{ isApprove ? 'ยืนยันการอนุมัติคำขอ' : 'ยืนยันการปฏิเสธคำขอ' }}
      </h5>
    </CModalHeader>

    <CModalBody class="p-4" v-if="request">
      <!-- Request ID -->
      <div class="info-row mb-3">
        <span class="info-label">รหัสคำขอ</span>
        <span class="req-id">{{ request._id }}</span>
      </div>

      <!-- Vehicle Info -->
      <div class="info-section mb-3">
        <h6 class="section-title">ข้อมูลรถ</h6>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ทะเบียน</span>
            <span class="info-value font-weight-bold">
              {{ (request.vehicle_info && request.vehicle_info.license_plate) || '-' }}
              <small v-if="request.vehicle_info && request.vehicle_info.province_license" class="text-muted ml-1">
                {{ request.vehicle_info.province_license }}
              </small>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">ยี่ห้อ / รุ่น</span>
            <span class="info-value">
              {{ vehicleBrand }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">สี</span>
            <span class="info-value">{{ (request.vehicle_info && request.vehicle_info.color) || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ประเภท</span>
            <span class="info-value">{{ vehicleType }}</span>
          </div>
        </div>
      </div>

      <!-- Owner Info -->
      <div class="info-section mb-3" v-if="request.owner_info">
        <h6 class="section-title">ข้อมูลเจ้าของ</h6>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ชื่อ-นามสกุล</span>
            <span class="info-value">{{ ownerName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ประเภทผู้ใช้</span>
            <span class="info-value">{{ userTypeLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Warning for reject -->
      <div v-if="!isApprove" class="alert alert-danger mt-3 mb-0 rounded">
        <CIcon name="cil-warning" class="mr-2" />
        การปฏิเสธคำขอนี้จะไม่สามารถย้อนกลับได้ กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
      </div>

      <!-- Success message for approve -->
      <div v-if="isApprove" class="alert alert-success mt-3 mb-0 rounded">
        <CIcon name="cil-check-circle" class="mr-2" />
        การอนุมัติจะเพิ่มรถเข้าสู่ระบบและเปิดใช้งาน IVTS ให้รถคันนี้ทันที
      </div>
    </CModalBody>

    <template #footer>
      <CButton color="secondary" variant="outline" size="sm" @click="onClose(false)">
        ยกเลิก
      </CButton>
      <CButton
        :color="isApprove ? 'success' : 'danger'"
        size="sm"
        class="ml-2"
        :disabled="loading"
        @click="onConfirm"
      >
        <CIcon v-if="loading" name="cil-loop-circular" class="mr-1" style="animation: spin 1s linear infinite;" />
        {{ isApprove ? 'ยืนยันอนุมัติ' : 'ยืนยันปฏิเสธ' }}
      </CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'ConfirmRequestModal',
  props: {
    visible: { type: Boolean, default: false },
    request: { type: Object, default: null },
    mode: { type: String, default: 'approve' }, // 'approve' | 'reject'
    loading: { type: Boolean, default: false }
  },
  computed: {
    isApprove () { return this.mode === 'approve' },
    vehicleBrand () {
      const vi = this.request && this.request.vehicle_info
      if (!vi) return '-'
      return [vi.brand, vi.model].filter(Boolean).join(' ') || '-'
    },
    vehicleType () {
      const t = this.request && this.request.vehicle_info && this.request.vehicle_info.vehicle_type
      if (t === 'car') return 'รถยนต์'
      if (t === 'motorcycle') return 'มอเตอร์ไซค์'
      return t || '-'
    },
    ownerName () {
      const oi = this.request && this.request.owner_info
      if (!oi) return '-'
      return [oi.name, oi.surname].filter(Boolean).join(' ') || '-'
    },
    userTypeLabel () {
      const t = this.request && this.request.user_type
      if (t === 'student') return 'นักศึกษา'
      if (t === 'staff') return 'บุคลากร'
      if (t === 'outsider') return 'บุคคลภายนอก'
      return t || '-'
    }
  },
  methods: {
    onClose (val) {
      if (val === false || val === undefined) {
        this.$emit('cancel')
        this.$emit('update:visible', false)
      }
    },
    onConfirm () {
      this.$emit('confirm', this.request)
    }
  }
}
</script>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.info-section { background: #f8f9fa; border-radius: 8px; padding: 1rem; }
.section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 0.75rem;
}
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1rem; }
.info-item { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-size: 0.74rem; color: #8a9bb0; font-weight: 500; }
.info-value { font-size: 0.88rem; color: #2c3e50; }
.info-row { display: flex; align-items: center; gap: 0.75rem; }
.req-id {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.8rem;
  background: #e9ecef;
  padding: 3px 8px;
  border-radius: 4px;
  color: #495057;
}
</style>
