<template>
  <CModal :show="visible" @update:show="onClose" centered backdrop size="lg">
    <CModalHeader closeButton :class="headerClass">
      <h5 class="mb-0 font-weight-bold">
        <CIcon :name="headerIcon" class="mr-2" />
        {{ headerTitle }}
      </h5>
    </CModalHeader>

    <CModalBody class="p-4" v-if="request">
      <!-- Request ID & Status Badge -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="info-row">
          <span class="info-label">รหัสคำขอ</span>
          <span class="req-id">{{ request._id }}</span>
        </div>
        <CBadge
          :color="statusBadgeColor"
          shape="rounded-pill"
          class="px-3 py-1 font-weight-bold"
        >
          {{ statusBadgeLabel }}
        </CBadge>
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

      <!-- View mode messages -->
      <div v-if="isView">
        <div v-if="request.request_status === 'approved'" class="alert alert-success mt-3 mb-0 rounded">
          <CIcon name="cil-check-circle" class="mr-2" />
          คำขอนี้ได้รับการอนุมัติแล้ว รถถูกเพิ่มเข้าสู่ระบบ IVTS เรียบร้อยแล้ว
        </div>
        <div v-else-if="request.request_status === 'rejected'" class="alert alert-danger mt-3 mb-0 rounded">
          <CIcon name="cil-x-circle" class="mr-2" />
          คำขอนี้ถูกปฏิเสธการอนุมัติแล้ว
        </div>
        <div v-else class="alert alert-warning mt-3 mb-0 rounded">
          <CIcon name="cil-clock" class="mr-2" />
          คำขอนี้อยู่ระหว่างรอการตรวจสอบ
        </div>
      </div>

      <!-- Action mode warnings/notices -->
      <template v-else>
        <!-- Warning for reject -->
        <div v-if="isReject" class="alert alert-danger mt-3 mb-0 rounded">
          <CIcon name="cil-warning" class="mr-2" />
          การปฏิเสธคำขอนี้จะไม่สามารถย้อนกลับได้ กรุณาตรวจสอบข้อมูลก่อนดำเนินการ
        </div>

        <!-- Success message for approve -->
        <div v-if="isApprove" class="alert alert-success mt-3 mb-0 rounded">
          <CIcon name="cil-check-circle" class="mr-2" />
          การอนุมัติจะเพิ่มรถเข้าสู่ระบบและเปิดใช้งาน IVTS ให้รถคันนี้ทันที
        </div>
      </template>
    </CModalBody>

    <template #footer>
      <!-- View mode footer (or non-pending request): Only Close button -->
      <template v-if="isView">
        <CButton color="secondary" variant="outline" size="sm" @click="onClose(false)">
          ปิด
        </CButton>
      </template>

      <!-- Action mode footer (pending_review request): Cancel + Confirm button -->
      <template v-else>
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
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'ConfirmRequestModal',
  props: {
    visible: { type: Boolean, default: false },
    request: { type: Object, default: null },
    mode: { type: String, default: 'approve' }, // 'approve' | 'reject' | 'view'
    loading: { type: Boolean, default: false }
  },
  computed: {
    isView () {
      return this.mode === 'view' || (this.request && this.request.request_status !== 'pending_review')
    },
    isApprove () {
      return this.mode === 'approve' && !this.isView
    },
    isReject () {
      return this.mode === 'reject' && !this.isView
    },
    headerClass () {
      if (this.isView) {
        if (this.request && this.request.request_status === 'approved') return 'bg-success text-white'
        if (this.request && this.request.request_status === 'rejected') return 'bg-danger text-white'
        return 'bg-info text-white'
      }
      return this.isApprove ? 'bg-success text-white' : 'bg-danger text-white'
    },
    headerIcon () {
      if (this.isView) {
        if (this.request && this.request.request_status === 'approved') return 'cil-check-circle'
        if (this.request && this.request.request_status === 'rejected') return 'cil-x-circle'
        return 'cil-info'
      }
      return this.isApprove ? 'cil-check-circle' : 'cil-x-circle'
    },
    headerTitle () {
      if (this.isView) {
        if (this.request && this.request.request_status === 'approved') return 'รายละเอียดคำขอ (อนุมัติแล้ว)'
        if (this.request && this.request.request_status === 'rejected') return 'รายละเอียดคำขอ (ปฏิเสธการอนุมัติ)'
        return 'รายละเอียดคำขอ'
      }
      return this.isApprove ? 'ยืนยันการอนุมัติคำขอ' : 'ยืนยันการปฏิเสธคำขอ'
    },
    statusBadgeColor () {
      const s = this.request && this.request.request_status
      if (s === 'approved') return 'success'
      if (s === 'rejected') return 'danger'
      if (s === 'pending_review') return 'warning'
      return 'secondary'
    },
    statusBadgeLabel () {
      const s = this.request && this.request.request_status
      if (s === 'approved') return 'อนุมัติแล้ว'
      if (s === 'rejected') return 'ปฏิเสธ'
      if (s === 'pending_review') return 'รอตรวจสอบ'
      return s || '-'
    },
    vehicleBrand () {
      const vi = this.request && this.request.vehicle_info
      if (!vi) return '-'
      return [vi.brand, vi.model].filter(Boolean).join(' ') || '-'
    },
    vehicleType () {
      const vi = this.request && this.request.vehicle_info
      const t = (vi && (vi.type || vi.vehicle_type)) || ''
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
