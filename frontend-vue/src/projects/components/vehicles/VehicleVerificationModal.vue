<template>
  <CModal
    :show="visible"
    @update:show="$emit('close')"
    size="xl"
    centered
    backdrop
  >
    <CModalHeader closeButton class="bg-light">
      <h5 class="mb-0 font-weight-bold text-dark">
        <CIcon name="cil-check-circle" class="mr-2 text-primary" />
        {{ $t('vehicleVerification.title') }}
      </h5>
    </CModalHeader>

    <CModalBody class="p-4 bg-white">
      <CRow>
        <!-- Left Side: Evidence Preview (60%) -->
        <CCol lg="7" class="border-right pr-4">
          <!-- Toolbar Mockup -->
          <div class="d-flex align-items-center mb-3 bg-light p-2 rounded shadow-sm">
            <CButton size="sm" color="secondary" variant="ghost" @click="handleToolbarAction('Zoom In')" v-c-tooltip="'Zoom In'">
              <CIcon name="cil-zoom-in" />
            </CButton>
            <CButton size="sm" color="secondary" variant="ghost" class="ml-1" @click="handleToolbarAction('Zoom Out')" v-c-tooltip="'Zoom Out'">
              <CIcon name="cil-zoom-out" />
            </CButton>
            <CButton size="sm" color="secondary" variant="ghost" class="ml-1" @click="handleToolbarAction('Rotate')" v-c-tooltip="'Rotate'">
              <CIcon name="cil-reload" />
            </CButton>
            <div class="border-right mx-2" style="height: 20px;"></div>
            <CButton size="sm" color="secondary" variant="ghost" @click="handleToolbarAction('Download')" v-c-tooltip="'Download'">
              <CIcon name="cil-cloud-download" />
            </CButton>
          </div>

          <!-- Image Container -->
          <div class="d-flex align-items-center justify-content-center bg-secondary rounded overflow-hidden" style="min-height: 400px; max-height: 500px; border: 1px solid #c8ced3;">
            <CImg
              v-if="!imageError && vehicleData && vehicleData.certificate_image_url"
              :src="vehicleData.certificate_image_url"
              alt="Evidence Document"
              fluid
              @error="imageError = true"
              style="max-height: 100%; object-fit: contain;"
            />
            <div v-else class="text-center text-muted p-5">
              <CIcon name="cil-image-broken" size="3xl" class="mb-3 opacity-50" />
              <p class="mb-0">{{ $t('vehicleVerification.imageLoadError') }}</p>
            </div>
          </div>
        </CCol>

        <!-- Right Side: Data Comparison / Reject Workflow (40%) -->
        <CCol lg="5" class="pl-4">
          
          <!-- View State: Verify (Default) -->
          <div v-if="!isRejecting">
            <h6 class="text-uppercase text-muted font-weight-bold mb-3">{{ $t('vehicleVerification.verificationDataTitle') }}</h6>
            
            <!-- Section 1: Vehicle Info -->
            <CCard class="mb-3 shadow-sm border-0 bg-light">
              <CCardBody class="p-3">
                <h6 class="font-weight-bold text-dark border-bottom pb-2 mb-3">
                  <CIcon name="cil-car-alt" class="mr-2" /> {{ $t('vehicleVerification.vehicleInfo') }}
                </h6>
                <div class="mb-2">
                  <small class="text-muted d-block">{{ $t('vehicleVerification.licensePlate') }}</small>
                  <div class="d-flex align-items-center">
                    <span class="font-weight-bold font-lg text-dark mr-2">{{ vehicleLicensePlate }}</span>
                    <!-- Warning Icon to emphasize checking -->
                    <CIcon name="cil-warning" class="text-danger" :v-c-tooltip="$t('vehicleVerification.licensePlateTooltip')" />
                  </div>
                </div>
                <CRow class="mb-2">
                  <CCol sm="6">
                    <small class="text-muted d-block">{{ $t('vehicleVerification.province') }}</small>
                    <span class="font-weight-bold text-dark">{{ vehicleProvince }}</span>
                  </CCol>
                  <CCol sm="6">
                    <small class="text-muted d-block">{{ $t('vehicleVerification.color') }}</small>
                    <span class="font-weight-bold text-dark">{{ vehicleColor }}</span>
                  </CCol>
                </CRow>
                <div>
                  <small class="text-muted d-block">{{ $t('vehicleVerification.brandModel') }}</small>
                  <span class="font-weight-bold text-dark">{{ vehicleBrand }} {{ vehicleModel }}</span>
                </div>
              </CCardBody>
            </CCard>

            <!-- Section 2: Owner Info -->
            <CCard class="shadow-sm border-0 bg-light">
              <CCardBody class="p-3">
                <h6 class="font-weight-bold text-dark border-bottom pb-2 mb-3">
                  <CIcon name="cil-user" class="mr-2" /> {{ $t('vehicleVerification.ownerInfo') }}
                </h6>
                <div class="mb-2">
                  <small class="text-muted d-block">{{ $t('vehicleVerification.fullName') }}</small>
                  <div class="d-flex align-items-center">
                    <span class="font-weight-bold text-dark mr-2">{{ ownerFullName }}</span>
                    <!-- Warning Icon to emphasize checking -->
                    <CIcon name="cil-warning" class="text-danger" :v-c-tooltip="$t('vehicleVerification.ownerTooltip')" />
                  </div>
                </div>
                <div>
                  <small class="text-muted d-block">{{ $t('vehicleVerification.phone') }}</small>
                  <span class="font-weight-bold text-dark">{{ ownerPhone }}</span>
                </div>
              </CCardBody>
            </CCard>
          </div>

          <!-- View State: Reject Form -->
          <div v-else class="h-100 d-flex flex-column">
            <h6 class="text-danger font-weight-bold mb-3 d-flex align-items-center">
              <CIcon name="cil-warning" class="mr-2" /> {{ $t('vehicleVerification.rejectReasonTitle') }}
            </h6>
            <p class="text-muted small mb-4">
              {{ $t('vehicleVerification.rejectReasonDesc') }}
            </p>

            <div class="mb-3">
              <label class="font-weight-bold text-dark mb-2">{{ $t('vehicleVerification.selectRejectReason') }}</label>
              <div 
                v-for="(reason, index) in predefinedRejectReasons" 
                :key="index"
                class="custom-control custom-checkbox mb-2"
              >
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  :id="`rejectReasonCheckbox_${index}`"
                  :value="reason"
                  v-model="rejectForm.reasons"
                >
                <label class="custom-control-label" :for="`rejectReasonCheckbox_${index}`">
                  {{ reason }}
                </label>
              </div>
            </div>

            <div class="flex-grow-1 d-flex flex-column mb-0">
              <label class="font-weight-bold text-dark mb-2">{{ $t('vehicleVerification.additionalNote') }}</label>
              <textarea 
                class="form-control flex-grow-1" 
                rows="4" 
                :placeholder="$t('vehicleVerification.additionalNotePlaceholder')"
                v-model="rejectForm.note"
                style="resize: none;"
              ></textarea>
            </div>
          </div>

        </CCol>
      </CRow>
    </CModalBody>

    <!-- Footer Actions -->
    <CModalFooter class="bg-light border-top-0 pt-0">
      <div v-if="!isRejecting" class="w-100 d-flex justify-content-between">
        <CButton color="secondary" variant="outline" @click="$emit('close')">
          {{ $t('vehicleVerification.closeWindow') }}
        </CButton>
        <div>
          <CButton color="danger" class="mr-2 text-white" @click="startReject">
            <CIcon name="cil-x" class="mr-1" /> {{ $t('vehicleVerification.rejectDoc') }}
          </CButton>
          <CButton color="success" class="text-white" @click="confirmApprove">
            <CIcon name="cil-check-alt" class="mr-1" /> {{ $t('vehicleVerification.approveDoc') }}
          </CButton>
        </div>
      </div>
      
      <div v-else class="w-100 d-flex justify-content-between">
        <CButton color="secondary" variant="outline" @click="cancelReject">
          <CIcon name="cil-arrow-left" class="mr-1" /> {{ $t('vehicleVerification.back') }}
        </CButton>
        <CButton 
          color="danger" 
          class="text-white font-weight-bold" 
          @click="confirmReject"
          :disabled="rejectForm.reasons.length === 0 && rejectForm.note.trim() === ''"
        >
          {{ $t('vehicleVerification.confirmReject') }}
        </CButton>
      </div>
    </CModalFooter>
  </CModal>
</template>

<script>
export default {
  name: 'VehicleVerificationModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    vehicleData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      imageError: false,
      isRejecting: false,
      rejectForm: {
        reasons: [],
        note: ''
      }
    }
  },
  computed: {
    predefinedRejectReasons() {
      return [
        this.$t('vehicleVerification.reasons.unclear'),
        this.$t('vehicleVerification.reasons.mismatchPlate'),
        this.$t('vehicleVerification.reasons.incorrectImage')
      ];
    },
    vehicleLicensePlate() {
      return this.vehicleData?.vehicle?.license_plate || '-';
    },
    vehicleProvince() {
      return this.vehicleData?.vehicle?.province_license || '-';
    },
    vehicleColor() {
      return this.vehicleData?.vehicle?.color || '-';
    },
    vehicleBrand() {
      return this.vehicleData?.vehicle?.brand || '-';
    },
    vehicleModel() {
      return this.vehicleData?.vehicle?.model || '';
    },
    ownerFullName() {
      const name = this.vehicleData?.user?.name || '';
      const surname = this.vehicleData?.user?.surname || '';
      const full = `${name} ${surname}`.trim();
      return full || '-';
    },
    ownerPhone() {
      return this.vehicleData?.user?.phone || '-';
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.imageError = false;
        this.isRejecting = false;
        this.rejectForm.reasons = [];
        this.rejectForm.note = '';
      }
    }
  },
  methods: {
    handleToolbarAction(action) {
      console.log(`[Toolbar] Clicked Action: ${action}`);
    },
    startReject() {
      this.isRejecting = true;
    },
    cancelReject() {
      this.isRejecting = false;
      this.rejectForm.reasons = [];
      this.rejectForm.note = '';
    },
    confirmApprove() {
      if (this.vehicleData && this.vehicleData._id) {
        this.$emit('approve', this.vehicleData._id);
      }
    },
    confirmReject() {
      if (this.vehicleData && this.vehicleData._id) {
        this.$emit('reject', this.vehicleData._id, [...this.rejectForm.reasons], this.rejectForm.note);
      }
    }
  }
}
</script>

<style scoped>
.custom-checkbox .custom-control-label::before {
  border-radius: 0.25rem;
}
.custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {
  background-color: #e55353;
  border-color: #e55353;
}
</style>
