<template>
  <div class="receive-form-page">
    <AppSectionHero
      :title="$t('receiveForm.title')"
      :subtitle="$t('receiveForm.subtitle')"
      :stats="heroStats"
      :show-refresh="false"
      :meta-label="$t('receiveForm.metaLabel')"
      :meta-value="$t('receiveForm.metaValue')"
    />

    <CCard class="bg-style2 mb-4 page-card">
      <CCardBody>
        <div class="section-title">
          <CIcon name="cil-description" class="mr-2" />
          {{ $t('receiveForm.sections.documentInfo') }}
        </div>

        <CRow>
          <CCol md="4" sm="6">
            <CPInput v-model="form.documentNo" :label="$t('receiveForm.fields.documentNo')" required />
          </CCol>
          <CCol md="4" sm="6">
            <CPDateInput v-model="form.receivedDate" :label="$t('receiveForm.fields.receivedDate')" required />
          </CCol>
          <CCol md="4" sm="6">
            <CPSelect
              v-model="form.documentType"
              :options="documentTypeOptions"
              :label="$t('receiveForm.fields.documentType')"
              label-key="label"
              track-by="value"
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md="4" sm="6">
            <CPInput v-model="form.senderName" :label="$t('receiveForm.fields.senderName')" required />
          </CCol>
          <CCol md="4" sm="6">
            <CPSelect
              v-model="form.destination"
              :options="destinationOptions"
              :label="$t('receiveForm.fields.destination')"
              label-key="label"
              track-by="value"
            />
          </CCol>
          <CCol md="4" sm="6">
            <CPSelect
              v-model="form.priority"
              :options="priorityOptions"
              :label="$t('receiveForm.fields.priority')"
              label-key="label"
              track-by="value"
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md="4" sm="6">
            <CPInput v-model="form.contactName" :label="$t('receiveForm.fields.contactName')" />
          </CCol>
          <CCol md="4" sm="6">
            <CPInput v-model="form.contactPhone" :label="$t('receiveForm.fields.contactPhone')" />
          </CCol>
          <CCol md="4" sm="6">
            <CPNumberInput v-model="form.expectedDocuments" :label="$t('receiveForm.fields.expectedDocuments')" :min="1" />
          </CCol>
        </CRow>

        <div class="textarea-block">
          <CPQuillEditor
            v-model="form.note"
            :label="$t('receiveForm.fields.note')"
            :editor-class="'receive-form-editor'"
          />
        </div>
      </CCardBody>
    </CCard>

    <CCard class="bg-style2 mb-4 page-card">
      <CCardBody>
        <div class="upload-header">
          <div class="section-title mb-0">
            <CIcon name="cil-cloud-upload" class="mr-2" />
            {{ $t('receiveForm.sections.uploadFiles') }}
          </div>

          <div class="upload-actions">
            <CButton color="light" class="action-pill" @click="triggerFilePicker">
              <CIcon name="cil-folder-open" class="mr-2" />
              {{ $t('receiveForm.upload.selectFile') }}
            </CButton>
            <CButton color="danger" variant="outline" class="action-pill" @click="clearUploads">
              <CIcon name="cil-trash" class="mr-2" />
              {{ $t('receiveForm.upload.clearUploads') }}
            </CButton>
          </div>
        </div>

        <div class="upload-caption">{{ $t('receiveForm.upload.caption') }}</div>

        <input
          ref="fileInput"
          type="file"
          class="d-none"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          @change="handleFileChange"
        >

        <div class="upload-dropzone" @click="triggerFilePicker">
          <div class="upload-dropzone__icon">
            <CIcon name="cil-cloud-upload" />
          </div>
          <div class="upload-dropzone__title">{{ $t('receiveForm.upload.selectFile') }}</div>
          <div class="upload-dropzone__hint">
            {{ $t('receiveForm.upload.dropzoneHint') }}
          </div>
          <div class="upload-dropzone__hint">{{ $t('receiveForm.upload.sizeHint') }}</div>
        </div>

        <div v-if="uploadedFiles.length" class="file-grid">
          <div v-for="file in uploadedFiles" :key="file.id" class="file-chip">
            <div class="file-chip__meta">
              <div class="file-chip__name">{{ file.name }}</div>
              <div class="file-chip__detail">{{ file.typeLabel }} • {{ file.sizeLabel }}</div>
            </div>
            <CButton size="sm" color="danger" variant="ghost" @click="removeUpload(file.id)">
              <CIcon name="cil-trash" />
            </CButton>
          </div>
        </div>

        <div v-else class="upload-empty">
          <CIcon name="cil-folder-open" />
          <div>{{ $t('receiveForm.upload.empty') }}</div>
        </div>
      </CCardBody>
    </CCard>

    <CCard class="bg-style2 mb-4 page-card">
      <CCardBody>
        <div class="ocr-header">
          <div class="section-title mb-0">
            <CIcon name="cil-layers" class="mr-2" />
            {{ $t('receiveForm.sections.ocrResults') }}
          </div>

          <CButton color="info" class="refresh-button" @click="refreshMockResults">
            <CIcon name="cil-reload" />
          </CButton>
        </div>

        <CDataTable
          hover
          striped
          :items="ocrResults"
          :fields="ocrFields"
          :items-per-page="8"
          pagination
        >
          <template #index="{ index }">
            <td class="text-center font-weight-bold">{{ index + 1 }}</td>
          </template>
          <template #statusLabel="{ item }">
            <td>
              <CBadge :color="statusColor(item.statusKey)">{{ item.statusLabel }}</CBadge>
            </td>
          </template>
          <template #confidenceLabel="{ item }">
            <td>
              <div class="confidence-cell">
                <span>{{ item.confidenceLabel }}</span>
                <CProgress
                  height="6px"
                  :value="item.confidence"
                  :color="item.confidence >= 90 ? 'success' : item.confidence >= 80 ? 'warning' : 'danger'"
                />
              </div>
            </td>
          </template>
          <template #actions="{ item }">
            <td class="text-center">
              <CButton
                size="sm"
                color="primary"
                class="table-action mr-2"
                @click="addSelectedItem(item)"
              >
                <CIcon name="cil-plus" />
              </CButton>
              <CButton
                size="sm"
                color="danger"
                class="table-action"
                @click="removeSelectedItem(item.id)"
              >
                <CIcon name="cil-trash" />
              </CButton>
            </td>
          </template>
        </CDataTable>
      </CCardBody>
    </CCard>

    <CRow>
      <CCol lg="8">
        <CCard class="bg-style2 page-card mb-4">
          <CCardBody>
            <div class="section-title">
              <CIcon name="cil-list-rich" class="mr-2" />
              {{ $t('receiveForm.sections.selectedItems') }}
            </div>

            <div v-if="selectedItems.length" class="selected-list">
              <div v-for="item in selectedItems" :key="item.id" class="selected-row">
                <div>
                  <div class="selected-row__title">{{ item.documentName }}</div>
                  <div class="selected-row__detail">
                    {{ item.categoryLabel }} • {{ item.referenceNo }} • {{ $t('receiveForm.selectedList.confidence') }} {{ item.confidenceLabel }}
                  </div>
                </div>
                <CButton size="sm" color="danger" variant="outline" shape="pill" @click="removeSelectedItem(item.id)">
                  {{ $t('receiveForm.selectedList.remove') }}
                </CButton>
              </div>
            </div>

            <div v-else class="selected-empty">
              {{ $t('receiveForm.selectedList.empty') }}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="4">
        <CCard class="bg-style2 page-card mb-4">
          <CCardBody>
            <div class="section-title">
              <CIcon name="cil-speedometer" class="mr-2" />
              {{ $t('receiveForm.sections.summary') }}
            </div>

            <div class="summary-list">
              <div class="summary-row">
                <span>{{ $t('receiveForm.summaryList.totalFiles') }}</span>
                <strong>{{ uploadedFiles.length }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ $t('receiveForm.summaryList.readyOcr') }}</span>
                <strong>{{ readyCount }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ $t('receiveForm.summaryList.selectedItems') }}</span>
                <strong>{{ selectedItems.length }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ $t('receiveForm.summaryList.expectedDocs') }}</span>
                <strong>{{ form.expectedDocuments || '-' }}</strong>
              </div>
            </div>

            <div class="summary-actions">
              <CButton color="success" block class="mb-2" @click="saveMock">
                <CIcon name="cil-save" class="mr-2" />
                {{ $t('receiveForm.actions.save') }}
              </CButton>
              <CButton color="light" block @click="resetForm">
                <CIcon name="cil-reload" class="mr-2" />
                {{ $t('receiveForm.actions.reset') }}
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero'
import CPInput from '@/projects/components/custom/CPInput'
import CPSelect from '@/projects/components/custom/CPSelect'
import CPDateInput from '@/projects/components/custom/CPDateInput'
import CPNumberInput from '@/projects/components/custom/CPNumberInput'
import CPQuillEditor from '@/projects/components/custom/CPQuillEditor'
import { notifyInfo, notifySuccess, notifyWarning } from '@/projects/utils/notify'

function createFormState(t) {
  return {
    documentNo: 'REC-2026-0038',
    receivedDate: '2026-03-10',
    documentType: { value: 'incoming', label: t('receiveForm.documentTypes.incoming') },
    senderName: 'สำนักวิชาวิทยาศาสตร์สุขภาพ',
    destination: { value: 'saraban', label: t('receiveForm.destinations.saraban') },
    priority: { value: 'normal', label: t('receiveForm.priorities.normal') },
    contactName: 'กัญญารัตน์ ศรีคำ',
    contactPhone: '053-917-000',
    expectedDocuments: 5,
    note: 'ข้อมูลชุดนี้เป็น mockup สำหรับทดสอบหน้าจอบันทึกเอกสารและตรวจผล OCR'
  }
}

function createOcrResults(t) {
  return [
    {
      id: 'ocr-001',
      documentName: 'การดำเนินกิจกรรมอบรมและถ่ายทอดสารสนเทศเพื่อพัฒนาการศึกษา ครั้งที่ 46',
      referenceNo: 'DOC-2026-0001',
      categoryLabel: 'หนังสือภายนอก',
      confidence: 96,
      statusKey: 'ready'
    },
    {
      id: 'ocr-002',
      documentName: 'โครงการสัมมนา การดำเนินกิจกรรมอบรมและถ่ายทอดสารสนเทศเพื่อพัฒนาการศึกษา',
      referenceNo: 'DOC-2026-0002',
      categoryLabel: 'รายงานโครงการ',
      confidence: 89,
      statusKey: 'review'
    },
    {
      id: 'ocr-003',
      documentName: 'โครงการสัมมนา การดำเนินกิจกรรมอบรมและถ่ายทอดสารสนเทศเพื่อพัฒนาการศึกษา ครั้งที่ 45',
      referenceNo: 'DOC-2026-0003',
      categoryLabel: 'รายงานโครงการ',
      confidence: 93,
      statusKey: 'ready'
    },
    {
      id: 'ocr-004',
      documentName: 'การดำเนินกิจกรรมอบรมและถ่ายทอดสารสนเทศเพื่อพัฒนาการศึกษา',
      referenceNo: 'DOC-2026-0004',
      categoryLabel: 'บันทึกข้อความ',
      confidence: 91,
      statusKey: 'ready'
    },
    {
      id: 'ocr-005',
      documentName: 'ขอประชาสัมพันธ์และเชิญชวนร่วมงาน การดำเนินกิจกรรมอบรมและถ่ายทอดสารสนเทศ ครั้งที่ 50',
      referenceNo: 'DOC-2026-0005',
      categoryLabel: 'หนังสือประชาสัมพันธ์',
      confidence: 84,
      statusKey: 'review'
    }
  ].map(item => ({
    ...item,
    confidenceLabel: `${item.confidence}%`,
    statusLabel: item.statusKey === 'ready' ? t('receiveForm.status.ready') : t('receiveForm.status.review')
  }))
}

export default {
  name: 'ReceiveForm',
  components: {
    AppSectionHero,
    CPInput,
    CPSelect,
    CPDateInput,
    CPNumberInput,
    CPQuillEditor
  },
  data() {
    return {
      form: createFormState(this.$t.bind(this)),
      uploadedFiles: [],
      ocrResults: createOcrResults(this.$t.bind(this)),
      selectedItems: [],
      documentTypeOptions: [
        { value: 'incoming', label: this.$t('receiveForm.documentTypes.incoming') },
        { value: 'memo', label: this.$t('receiveForm.documentTypes.memo') },
        { value: 'project', label: this.$t('receiveForm.documentTypes.project') }
      ],
      destinationOptions: [
        { value: 'saraban', label: this.$t('receiveForm.destinations.saraban') },
        { value: 'secretary', label: this.$t('receiveForm.destinations.secretary') },
        { value: 'academic', label: this.$t('receiveForm.destinations.academic') }
      ],
      priorityOptions: [
        { value: 'normal', label: this.$t('receiveForm.priorities.normal') },
        { value: 'urgent', label: this.$t('receiveForm.priorities.urgent') },
        { value: 'very-urgent', label: this.$t('receiveForm.priorities.veryUrgent') }
      ],
      ocrFields: [
        { key: 'index', label: '#', _style: 'width: 60px; text-align:center;' },
        { key: 'documentName', label: this.$t('receiveForm.ocrTable.documentName') },
        { key: 'referenceNo', label: this.$t('receiveForm.ocrTable.referenceNo'), _style: 'width: 150px;' },
        { key: 'categoryLabel', label: this.$t('receiveForm.ocrTable.category'), _style: 'width: 160px;' },
        { key: 'confidenceLabel', label: this.$t('receiveForm.ocrTable.confidence'), _style: 'width: 180px;' },
        { key: 'statusLabel', label: this.$t('receiveForm.ocrTable.status'), _style: 'width: 130px;' },
        { key: 'actions', label: this.$t('receiveForm.ocrTable.actions'), _style: 'width: 140px; text-align:center;' }
      ]
    }
  },
  computed: {
    readyCount() {
      return this.ocrResults.filter(item => item.statusKey === 'ready').length
    },
    heroStats() {
      return [
        { label: this.$t('receiveForm.stats.uploadedFiles'), value: this.uploadedFiles.length, hint: this.$t('receiveForm.stats.uploadedFilesHint'), icon: 'cil-cloud-upload', iconClass: 'app-section-stat__icon--total' },
        { label: this.$t('receiveForm.stats.ocrReady'), value: this.readyCount, hint: this.$t('receiveForm.stats.ocrReadyHint'), icon: 'cil-check-circle', iconClass: 'app-section-stat__icon--active' },
        { label: this.$t('receiveForm.stats.selectedItems'), value: this.selectedItems.length, hint: this.$t('receiveForm.stats.selectedItemsHint'), icon: 'cil-list-rich', iconClass: 'app-section-stat__icon--attention' }
      ]
    }
  },
  methods: {
    statusColor(statusKey) {
      return statusKey === 'ready' ? 'success' : 'warning'
    },
    triggerFilePicker() {
      this.$refs.fileInput.click()
    },
    handleFileChange(event) {
      const files = Array.from((event && event.target && event.target.files) || [])
      if (!files.length) return

      const nextItems = files.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}-${Date.now()}`,
        name: file.name,
        sizeLabel: this.formatBytes(file.size),
        typeLabel: file.type || 'unknown'
      }))

      this.uploadedFiles = [...this.uploadedFiles, ...nextItems]
      event.target.value = ''
      notifyInfo(this.$store, this.$t('receiveForm.messages.filesAdded', { count: nextItems.length }))
    },
    removeUpload(id) {
      this.uploadedFiles = this.uploadedFiles.filter(item => item.id !== id)
    },
    clearUploads() {
      this.uploadedFiles = []
      notifyWarning(this.$store, this.$t('receiveForm.messages.filesCleared'))
    },
    refreshMockResults() {
      this.ocrResults = this.ocrResults.map(item => {
        const shift = Math.floor(Math.random() * 7) - 3
        const confidence = Math.min(99, Math.max(78, item.confidence + shift))
        const statusKey = confidence >= 90 ? 'ready' : 'review'
        return {
          ...item,
          confidence,
          confidenceLabel: `${confidence}%`,
          statusKey,
          statusLabel: statusKey === 'ready' ? this.$t('receiveForm.status.ready') : this.$t('receiveForm.status.review')
        }
      })
    },
    addSelectedItem(item) {
      if (this.selectedItems.some(selected => selected.id === item.id)) {
        notifyInfo(this.$store, this.$t('receiveForm.messages.alreadySelected'))
        return
      }
      this.selectedItems = [...this.selectedItems, { ...item }]
    },
    removeSelectedItem(id) {
      this.selectedItems = this.selectedItems.filter(item => item.id !== id)
    },
    saveMock() {
      if (!this.form.documentNo || !this.form.receivedDate || !this.form.senderName) {
        notifyWarning(this.$store, this.$t('receiveForm.messages.fillRequired'))
        return
      }

      if (!this.selectedItems.length) {
        notifyWarning(this.$store, this.$t('receiveForm.messages.selectOcrRequired'))
        return
      }

      notifySuccess(this.$store, this.$t('receiveForm.messages.saveSuccess', { count: this.selectedItems.length }))
    },
    resetForm() {
      this.form = createFormState(this.$t.bind(this))
      this.uploadedFiles = []
      this.ocrResults = createOcrResults(this.$t.bind(this))
      this.selectedItems = []
    },
    formatBytes(bytes) {
      if (!bytes) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
      const value = bytes / (1024 ** exponent)
      return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
    }
  }
}
</script>

<style scoped lang="scss">
@import "./receive-form.shared.scss";
</style>
