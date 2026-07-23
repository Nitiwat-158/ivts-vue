<template>
  <CModal
    :show="visible"
    @update:show="handleClose"
    size="md"
    centered
    backdrop
  >
    <CModalHeader closeButton class="bg-light">
      <h5 class="mb-0 font-weight-bold text-danger">
        <CIcon name="cil-warning" class="mr-2" />
        ระบุเหตุผลในการปฏิเสธ (Reject Reason)
      </h5>
    </CModalHeader>

    <CModalBody class="p-4 bg-white">
      <!-- Section 1: Checkbox Group -->
      <CFormGroup class="mb-4">
        <template #label>
          <strong class="text-dark">เลือกเหตุผล (Common Reasons)</strong>
        </template>
        <div class="mt-2">
          <div 
            v-for="(reason, index) in commonReasons" 
            :key="index"
            class="custom-control custom-checkbox mb-2"
          >
            <input 
              type="checkbox" 
              class="custom-control-input" 
              :id="`rejectReason_${index}`"
              :value="reason"
              v-model="form.reasons"
            >
            <label class="custom-control-label" :for="`rejectReason_${index}`">
              {{ reason }}
            </label>
          </div>
        </div>
      </CFormGroup>

      <!-- Section 2: Textarea -->
      <CFormGroup class="mb-0">
        <label class="font-weight-bold text-dark">รายละเอียดเพิ่มเติม/ข้อความถึง User</label>
        <textarea 
          class="form-control mt-2" 
          rows="4" 
          placeholder="ระบุข้อความที่จะส่งแจ้งเตือนให้ผู้ใช้งานแก้ไข..."
          v-model="form.note"
          style="resize: none;"
        ></textarea>
      </CFormGroup>
    </CModalBody>

    <CModalFooter class="bg-light border-top-0">
      <div class="w-100 d-flex justify-content-end">
        <CButton color="secondary" variant="outline" class="mr-2" @click="handleCancel">
          ยกเลิก
        </CButton>
        <CButton 
          color="danger" 
          class="text-white font-weight-bold" 
          @click="handleSubmit"
          :disabled="isSubmitDisabled"
        >
          ยืนยันการปฏิเสธ
        </CButton>
      </div>
    </CModalFooter>
  </CModal>
</template>

<script>
export default {
  name: 'RejectVehicleModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    vehicleId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      commonReasons: [
        'ภาพหลักฐานไม่ชัดเจน/อ่านไม่ออก',
        'เลขทะเบียนรถไม่ตรงกับในระบบ',
        'ยี่ห้อ/รุ่น/สีรถไม่ตรงกับภาพถ่าย',
        'ภาพถ่ายไม่ถูกต้อง (เช่น อัปโหลดรูปภาพอื่นที่ไม่ใช่รถ)',
        'ชื่อผู้ครอบครองไม่ตรงกับเจ้าของบัญชี'
      ],
      form: {
        reasons: [],
        note: ''
      }
    }
  },
  computed: {
    isSubmitDisabled() {
      // Disable if no reasons selected AND no note provided
      return this.form.reasons.length === 0 && this.form.note.trim() === '';
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // Reset form when modal opens
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.form.reasons = [];
      this.form.note = '';
    },
    handleClose() {
      this.$emit('cancel');
      this.resetForm();
    },
    handleCancel() {
      this.$emit('cancel');
      this.resetForm();
    },
    handleSubmit() {
      if (this.isSubmitDisabled) return;

      this.$emit('submit', {
        id: this.vehicleId,
        reasons: [...this.form.reasons],
        note: this.form.note
      });
      
      this.resetForm();
    }
  }
}
</script>

<style scoped>
.custom-checkbox .custom-control-label::before {
  border-radius: 0.25rem;
}
.custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {
  background-color: #e55353; /* CoreUI Danger Color */
  border-color: #e55353;
}
</style>
