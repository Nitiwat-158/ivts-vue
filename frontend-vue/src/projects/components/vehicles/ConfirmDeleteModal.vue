<template>
  <CModal
    :show="visible"
    @update:show="onVisibleChange"
    centered
    backdrop
  >
    <CModalHeader>
      ยืนยันการลบรถ
    </CModalHeader>

    <CModalBody>
      <p>
        คุณแน่ใจหรือไม่ว่าต้องการลบรถทะเบียน {{ vehiclePlate }}? การกระทำนี้ไม่สามารถย้อนกลับได้
      </p>
    </CModalBody>

    <template #footer>
      <CButton color="secondary" size="sm" variant="outline" @click="onCancel">
        Cancel
      </CButton>
      <CButton color="danger" size="sm" class="ms-2" @click="onConfirm">
        Delete
      </CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'ConfirmDeleteModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    vehiclePlate: {
      type: String,
      default: ''
    }
  },
  methods: {
    onVisibleChange (value) {
      this.$emit('update:visible', value)
    },
    onCancel () {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    onConfirm () {
      this.$emit('confirm')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
p {
  margin-bottom: 0;
  line-height: 1.7;
}
</style>