<template>
  <div class="emergency-reports-page">
    <AppSectionHero
      :title="$t('emergencyReportManagement.title')"
      :subtitle="$t('emergencyReportManagement.subtitle')"
      meta-label="LAST UPDATED"
      :meta-value="lastUpdated"
      @refresh="refreshData"
    />

    <!-- Filters and Search -->
    <CCard class="mb-3">
      <CCardBody class="d-flex justify-content-between align-items-center flex-wrap">
        <div class="d-flex align-items-center mb-2 mb-md-0" style="gap: 15px;">
          <CInput
            v-model="searchQuery"
            :placeholder="$t('emergencyReportManagement.filters.searchPlaceholder')"
            class="mb-0"
            style="width: 630px;"
          />
          <CSelect
            :value.sync="filterStatus"
            :options="statusOptions"
            class="mb-0"
            style="width: 150px;"
          />
          <CSelect
            :value.sync="filterType"
            :options="typeOptions"
            class="mb-0"
            style="width: 180px;"
          />
        </div>
      </CCardBody>
    </CCard>

    <!-- Summary Cards -->
    <div class="erm-stats-grid mb-3">
      <CCard class="ops-card ops-metric">
        <CCardBody>
          <div class="ops-metric__top">
            <div class="ops-metric__label">{{ $t('emergencyReportManagement.stats.new') }}</div>
            <CIcon name="cil-list-rich" />
          </div>
          <div class="ops-metric__value">{{ summaryCounts.NEW }}</div>
          <div class="ops-metric__hint">{{ $t('emergencyReportManagement.stats.newHint') }}</div>
        </CCardBody>
      </CCard>
      <CCard class="ops-card ops-metric">
        <CCardBody>
          <div class="ops-metric__top">
            <div class="ops-metric__label">{{ $t('emergencyReportManagement.stats.inProgress') }}</div>
            <CIcon name="cil-av-timer" />
          </div>
          <div class="ops-metric__value">{{ summaryCounts.IN_PROGRESS }}</div>
          <div class="ops-metric__hint">{{ $t('emergencyReportManagement.stats.inProgressHint') }}</div>
        </CCardBody>
      </CCard>
      <CCard class="ops-card ops-metric">
        <CCardBody>
          <div class="ops-metric__top">
            <div class="ops-metric__label">{{ $t('emergencyReportManagement.stats.resolved') }}</div>
            <CIcon name="cil-check-circle" />
          </div>
          <div class="ops-metric__value">{{ summaryCounts.RESOLVED }}</div>
          <div class="ops-metric__hint">{{ $t('emergencyReportManagement.stats.resolvedHint') }}</div>
        </CCardBody>
      </CCard>
      <CCard class="ops-card ops-metric">
        <CCardBody>
          <div class="ops-metric__top">
            <div class="ops-metric__label">{{ $t('emergencyReportManagement.stats.closed') }}</div>
            <CIcon name="cil-task" />
          </div>
          <div class="ops-metric__value">{{ summaryCounts.CLOSED }}</div>
          <div class="ops-metric__hint">{{ $t('emergencyReportManagement.stats.closedHint') }}</div>
        </CCardBody>
      </CCard>
      <CCard class="ops-card ops-metric">
        <CCardBody>
          <div class="ops-metric__top">
            <div class="ops-metric__label">{{ $t('emergencyReportManagement.stats.overSla') }}</div>
            <CIcon name="cil-warning" />
          </div>
          <div class="ops-metric__value">{{ summaryCounts.OVER_SLA }}</div>
          <div class="ops-metric__hint">{{ $t('emergencyReportManagement.stats.overSlaHint') }}</div>
        </CCardBody>
      </CCard>
    </div>

    <!-- Main Layout: 2 Columns -->
    <CRow>
      <!-- Left Column: List -->
      <CCol xl="6" lg="12" class="mb-3">
        <CCard class="h-100">
          <CCardHeader>
            <strong>{{ $t('emergencyReportManagement.list.title') }}</strong>
          </CCardHeader>
          <CCardBody class="p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped mb-0">
                <thead>
                  <tr>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.caseId') }}</th>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.time') }}</th>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.licensePlate') }}</th>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.type') }}</th>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.status') }}</th>
                    <th class="text-nowrap">{{ $t('emergencyReportManagement.list.assignee') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="item in filteredCases" 
                    :key="item.id"
                    @click="selectCase(item)"
                    style="cursor: pointer;"
                    :class="{'table-active': selectedCase && selectedCase.id === item.id}"
                  >
                    <td class="text-nowrap font-weight-bold">{{ item.id }}</td>
                    <td class="text-nowrap">{{ formatTime(item.incident_time) }}</td>
                    <td class="text-nowrap">{{ item.vehicle.license_plate }}</td>
                    <td class="text-nowrap"><CBadge :color="getTypeColor(item.request_type)">{{ item.request_type }}</CBadge></td>
                    <td class="text-nowrap"><CBadge :color="getStatusColor(item.status)">{{ item.status }}</CBadge></td>
                    <td class="text-nowrap text-truncate" style="max-width: 150px;" :title="item.assigned_admin_id || $t('emergencyReportManagement.list.unassigned')">{{ item.assigned_admin_id || $t('emergencyReportManagement.list.unassigned') }}</td>
                  </tr>
                  <tr v-if="filteredCases.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">{{ $t('emergencyReportManagement.list.noData') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Right Column: Details -->
      <CCol xl="6" lg="12" class="mb-3">
        <CCard class="h-100" v-if="selectedCase">
          <CCardHeader>
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong class="mr-2">{{ selectedCase.id }}</strong>
                <CBadge :color="getTypeColor(selectedCase.request_type)" class="mr-2">{{ selectedCase.request_type }} ({{ selectedCase.severity }})</CBadge>
                <CBadge :color="getStatusColor(selectedCase.status)">{{ selectedCase.status }}</CBadge>
              </div>
              <small class="text-muted">{{ $t('emergencyReportManagement.details.reportedAt') }} {{ formatTime(selectedCase.submitted_at) }}</small>
            </div>
          </CCardHeader>
          <CCardBody style="max-height: 800px; overflow-y: auto;">
            
            <!-- Vehicle & Owner -->
            <CCard class="mb-3 bg-light">
              <CCardBody class="py-2">
                <CRow>
                  <CCol sm="6">
                    <small class="text-muted">{{ $t('emergencyReportManagement.details.vehicle') }}</small>
                    <div><strong>{{ selectedCase.vehicle.license_plate }}</strong> (Ref: {{ selectedCase.vehicle.vehicle_ref_id }})</div>
                  </CCol>
                  <CCol sm="6">
                    <small class="text-muted">{{ $t('emergencyReportManagement.details.owner') }}</small>
                    <div><strong>{{ selectedCase.owner.name }}</strong> ({{ selectedCase.owner.phone }})</div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            <!-- Shared Queue Banner -->
            <CAlert color="warning" v-if="!selectedCase.assigned_admin_id" class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ $t('emergencyReportManagement.details.sharedQueueTitle') }}</strong><br/>
                {{ $t('emergencyReportManagement.details.sharedQueueDesc') }}
              </div>
              <CButton color="success" @click="acceptCase(selectedCase.id)">
                {{ $t('emergencyReportManagement.actions.accept') }}
              </CButton>
            </CAlert>
            <CAlert color="info" v-else>
              {{ $t('emergencyReportManagement.details.assignee') }} <strong>{{ selectedCase.assigned_admin_id }}</strong>
            </CAlert>

            <!-- Description -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.description') }}</h6>
              <p class="mb-0">{{ selectedCase.description || $t('emergencyReportManagement.details.noDescription') }}</p>
            </div>

            <!-- Last Known Location -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.lastLocation') }}</h6>
              <div v-if="selectedCase.last_known_location">
                <CIcon name="cil-location-pin" class="mr-1"/>
                {{ selectedCase.last_known_location.camera_id }} ({{ $t('emergencyReportManagement.details.passedAt') }} {{ formatTime(selectedCase.last_known_location.seen_at) }})
              </div>
              <div v-else class="text-muted font-italic">{{ $t('emergencyReportManagement.details.noLocation') }}</div>
            </div>

            <!-- Attachments -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.attachments') }}</h6>
              <div class="text-muted font-italic">{{ $t('emergencyReportManagement.details.noAttachments') }}</div>
            </div>

            <!-- Related Cases -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.relatedCases') }}</h6>
              <div v-if="selectedCase.related_case_ids && selectedCase.related_case_ids.length > 0">
                <CBadge color="secondary" class="mr-1" v-for="cid in selectedCase.related_case_ids" :key="cid">{{ cid }}</CBadge>
                <CButton size="sm" color="link" class="p-0 ml-2" @click="linkCasePrompt">{{ $t('emergencyReportManagement.actions.linkCase') }}</CButton>
              </div>
              <div v-else class="text-muted">
                {{ $t('emergencyReportManagement.details.noRelatedCases') }} <CButton size="sm" color="link" class="p-0 ml-2" @click="linkCasePrompt">{{ $t('emergencyReportManagement.actions.linkCase') }}</CButton>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="mb-3">
              <h6 class="text-muted mb-2">{{ $t('emergencyReportManagement.details.activityLog') }}</h6>
              <div class="activity-log p-3 border rounded bg-light">
                <div 
                  v-for="(log, idx) in selectedCase.activity_log" 
                  :key="idx" 
                  class="mb-2 pb-2 border-bottom"
                  :class="{'text-danger font-weight-bold': log.isWarning}"
                >
                  <small class="mr-2 text-muted">{{ formatTime(log.time) }}</small>
                  <span>{{ log.message }}</span>
                </div>
              </div>
            </div>

            <!-- Send Update -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.sendUpdate') }} ({{ selectedCase.owner.phone }})</h6>
              <div class="d-flex">
                <CInput class="flex-grow-1 mb-0 mr-2" :placeholder="$t('emergencyReportManagement.actions.typeMessage')"/>
                <CButton color="primary">{{ $t('emergencyReportManagement.actions.send') }}</CButton>
              </div>
            </div>

            <!-- Internal Notes -->
            <div class="mb-3">
              <h6 class="text-muted mb-1">{{ $t('emergencyReportManagement.details.internalNotes') }}</h6>
              <CTextarea rows="3" :placeholder="$t('emergencyReportManagement.actions.typeNotes')"></CTextarea>
            </div>

          </CCardBody>
          <CCardFooter class="d-flex justify-content-between align-items-center">
            <CButton color="secondary" variant="outline">
              <CIcon name="cil-print" class="mr-1"/> {{ $t('emergencyReportManagement.actions.exportPrint') }}
            </CButton>
            
            <div class="d-flex align-items-center" v-if="selectedCase.assigned_admin_id">
              <span class="mr-2">{{ $t('emergencyReportManagement.actions.changeStatus') }}</span>
              <CSelect
                :value.sync="editStatus"
                :options="[{value: 'NEW', label: 'NEW', disabled: true}, {value: 'IN_PROGRESS', label: 'IN_PROGRESS'}, {value: 'RESOLVED', label: 'RESOLVED'}, {value: 'CLOSED', label: 'CLOSED'}]"
                class="mb-0 mr-2"
                style="width: 150px;"
              />
              <CButton color="primary" @click="saveStatus">บันทึก</CButton>
            </div>
            <div v-else class="text-muted">
              <em>{{ $t('emergencyReportManagement.details.canChangeStatusAfterAccept') }}</em>
            </div>
          </CCardFooter>
        </CCard>
        <CCard v-else class="h-100 d-flex align-items-center justify-content-center bg-light">
          <div class="text-muted text-center p-5">
            <CIcon name="cil-list" size="2xl" class="mb-3 opacity-50"/>
            <h5>{{ $t('emergencyReportManagement.details.selectCaseToView') }}</h5>
          </div>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import AppSectionHero from '@/projects/components/layout/AppSectionHero.vue';
import api from '@/service/api';

export default {
  name: 'EmergencyReportManagement',
  components: {
    AppSectionHero
  },
  data() {
    return {
      lastUpdated: new Date().toLocaleTimeString(),
      cases: [],
      searchQuery: '',
      filterStatus: '',
      filterType: '',
      selectedCase: null,
      editStatus: '',
      currentAdminName: 'Admin_Mock',
      currentAdminId: 'usr_mfu_001'
    };
  },
  computed: {
    statusOptions() {
      return [
        { value: '', label: this.$t('emergencyReportManagement.filters.allStatuses') },
        { value: 'NEW', label: 'NEW' },
        { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
        { value: 'RESOLVED', label: 'RESOLVED' },
        { value: 'CLOSED', label: 'CLOSED' }
      ]
    },
    typeOptions() {
      return [
        { value: '', label: this.$t('emergencyReportManagement.filters.allTypes') },
        { value: 'theft', label: 'Theft / Stolen' },
        { value: 'accident', label: 'Accident' },
        { value: 'breakdown', label: 'Breakdown' },
        { value: 'other', label: 'Other' }
      ]
    },
    newCasesCount() {
      return this.cases.filter(c => c.status === 'NEW').length;
    },
    summaryCounts() {
      const counts = { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, OVER_SLA: 0 };
      this.cases.forEach(c => {
        if (counts[c.status] !== undefined) counts[c.status]++;
        
        const hasSLABreach = c.activity_log.some(log => log.isWarning) || (!c.assigned_admin_id && c.severity === 'high');
        if (hasSLABreach) {
          counts.OVER_SLA++;
        }
      });
      return counts;
    },
    filteredCases() {
      return this.cases.filter(c => {
        const query = this.searchQuery.toLowerCase();
        const matchSearch = query === '' || 
          c.vehicle.license_plate.toLowerCase().includes(query) || 
          c.owner.name.toLowerCase().includes(query);
        
        const matchStatus = this.filterStatus === '' || c.status === this.filterStatus;
        const matchType = this.filterType === '' || c.request_type === this.filterType;

        return matchSearch && matchStatus && matchType;
      });
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const response = await api.ivtsEmergencyReports('get');
        const reports = response && response.data && Array.isArray(response.data.data)
          ? response.data.data
          : (response && response.data ? response.data : []);

        this.cases = reports.map(c => {
          const adminId = c.assigned_admin_id ? (c.assigned_admin_id.name || c.assigned_admin_id.username || c.assigned_admin_id) : null;
          let activity_log = [
            { time: c.submitted_at, message: this.$t('emergencyReportManagement.details.logSubmitted') || "ผู้ใช้ส่งรายงานแจ้งเหตุ" }
          ];
          if (adminId) {
            activity_log.push({
              time: c.submitted_at,
              message: (this.$t('emergencyReportManagement.details.logAccepted') || "แอดมิน {admin} รับเรื่องแล้ว").replace('{admin}', adminId)
            });
          }
          if (c.status === 'RESOLVED') {
            activity_log.push({
              time: c.submitted_at,
              message: this.$t('emergencyReportManagement.details.logResolved') || "ดำเนินการแก้ไขสถานะเป็น RESOLVED"
            });
          } else if (c.status === 'CLOSED') {
            activity_log.push({
              time: c.submitted_at,
              message: this.$t('emergencyReportManagement.details.logClosed') || "เคสถูกปิดแล้ว"
            });
          }

          return {
            id: c._id,
            vehicle: {
              license_plate: c.vehicle_id ? (c.vehicle_id.plateNumber || c.vehicle_id.license_plate || 'Unknown') : 'Unknown',
              vehicle_ref_id: c.vehicle_id ? (c.vehicle_id.vehicleCode || c.vehicle_id.vehicle_ref_id || 'Unknown') : 'Unknown'
            },
            owner: {
              name: c.vehicle_id ? (c.vehicle_id.ownerName || c.vehicle_id.owner_name || 'Unknown') : 'Unknown',
              phone: 'Unknown'
            },
            request_type: c.request_type,
            severity: c.severity,
            incident_time: c.incident_time,
            submitted_at: c.submitted_at,
            description: c.description,
            last_known_location: c.location,
            status: c.status,
            assigned_admin_id: adminId,
            related_case_ids: [],
            activity_log: activity_log
          };
        });

        if (this.$route && this.$route.query && this.$route.query.id) {
          const targetCase = this.cases.find(c => c.id === this.$route.query.id);
          if (targetCase) {
            this.selectCase(targetCase);
          }
        }
      } catch (error) {
        console.error('Failed to fetch emergency reports:', error);
      }
    },
    async refreshData() {
      await this.fetchData();
      this.lastUpdated = new Date().toLocaleTimeString();
    },
    formatTime(isoString) {
      if (!isoString) return '';
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    },
    getTypeColor(type) {
      const map = { theft: 'danger', accident: 'danger', breakdown: 'warning', other: 'secondary' };
      return map[type] || 'primary';
    },
    getStatusColor(status) {
      const map = { NEW: 'info', IN_PROGRESS: 'warning', RESOLVED: 'success', CLOSED: 'secondary' };
      return map[status] || 'primary';
    },
    selectCase(item) {
      this.selectedCase = item;
      this.editStatus = item.status;
    },
    async acceptCase(caseId) {
      try {
        await api.ivtsEmergencyReports('update-status', { id: caseId, payload: { status: 'IN_PROGRESS', adminId: this.currentAdminId } });
        await this.fetchData();
        if (this.selectedCase && this.selectedCase.id === caseId) {
          const updatedCase = this.cases.find(c => c.id === caseId);
          if (updatedCase) this.selectCase(updatedCase);
        }
      } catch (error) {
        console.error('Failed to accept case', error);
      }
    },
    async saveStatus() {
      if (this.selectedCase && this.editStatus) {
        try {
          await api.ivtsEmergencyReports('update-status', { id: this.selectedCase.id, payload: { status: this.editStatus } });
          await this.fetchData();
          const updatedCase = this.cases.find(c => c.id === this.selectedCase.id);
          if (updatedCase) this.selectCase(updatedCase);
        } catch (error) {
          console.error('Failed to save status', error);
        }
      }
    },
    linkCasePrompt() {
      const caseId = prompt(this.$t('emergencyReportManagement.details.promptLinkCase') || "Enter the Case ID to link:");
      if (caseId && this.selectedCase) {
        if (!this.selectedCase.related_case_ids) {
          this.$set(this.selectedCase, 'related_case_ids', []);
        }
        if (!this.selectedCase.related_case_ids.includes(caseId)) {
          this.selectedCase.related_case_ids.push(caseId);
        }
      }
    }
  }
}
</script>

<style scoped>
.emergency-reports-page {
  padding-bottom: 2rem;
}
.table-active {
  background-color: #e2e3e5 !important;
}
.activity-log {
  max-height: 200px;
  overflow-y: auto;
}


/* CSS Grid for Stats Cards */
.erm-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}
@media (max-width: 1200px) {
  .erm-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 992px) {
  .erm-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 576px) {
  .erm-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
