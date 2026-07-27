<template>
  <div class="request-table-wrapper">
    <!-- Empty state -->
    <div v-if="requests.length === 0" class="request-table-empty">
      <CIcon name="cil-inbox" size="3xl" class="mb-3 text-muted" />
      <p class="text-muted mb-0">ไม่มีคำขอที่รอดำเนินการ</p>
    </div>

    <div v-else class="request-table-scroll">
      <table class="table table-hover request-table mb-0">
        <thead>
          <tr>
            <th>รหัสคำขอ</th>
            <th>ประเภท</th>
            <th>ทะเบียนรถ</th>
            <th>ข้อมูลรถ</th>
            <th>เจ้าของ</th>
            <th>ผู้ขอ</th>
            <th>วันที่ยื่น</th>
            <th>สถานะ</th>
            <th class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in requests" :key="req._id">
            <!-- รหัสคำขอ -->
            <td>
              <span class="req-id">{{ req._id }}</span>
            </td>

            <!-- ประเภทคำขอ -->
            <td>
              <CBadge :color="requestTypeColor(req.request_type)" shape="rounded-pill" class="type-badge">
                {{ requestTypeLabel(req.request_type) }}
              </CBadge>
            </td>

            <!-- ทะเบียนรถ -->
            <td>
              <span class="plate-text">{{ (req.vehicle_info && req.vehicle_info.license_plate) || '-' }}</span>
              <span v-if="req.vehicle_info && req.vehicle_info.province_license" class="province-text text-muted">
                {{ req.vehicle_info.province_license }}
              </span>
            </td>

            <!-- ข้อมูลรถ -->
            <td>
              <div class="vehicle-info-cell">
                <span v-if="req.vehicle_info && (req.vehicle_info.brand || req.vehicle_info.model)">
                  {{ [req.vehicle_info.brand, req.vehicle_info.model].filter(Boolean).join(' ') }}
                </span>
                <span v-if="req.vehicle_info && req.vehicle_info.color" class="text-muted">
                  {{ req.vehicle_info.color }}
                </span>
                <span v-if="req.vehicle_info && req.vehicle_info.vehicle_type" class="text-muted small">
                  {{ vehicleTypeLabel(req.vehicle_info.vehicle_type) }}
                </span>
              </div>
            </td>

            <!-- เจ้าของ -->
            <td>
              <div v-if="req.owner_info">
                <span>{{ [req.owner_info.name, req.owner_info.surname].filter(Boolean).join(' ') || '-' }}</span>
              </div>
              <span v-else class="text-muted">-</span>
            </td>

            <!-- ผู้ขอ (user_id) -->
            <td>
              <span class="text-muted small">{{ req.user_type || '-' }}</span>
              <span class="text-muted small d-block">ID: {{ req.user_id || '-' }}</span>
            </td>

            <!-- วันที่ยื่น -->
            <td>
              <span class="date-text">{{ formatDate(req.created_at) }}</span>
            </td>

            <!-- สถานะ -->
            <td>
              <CBadge
                :color="statusColor(req.request_status)"
                shape="rounded-pill"
                :class="['status-badge', 'status--' + req.request_status]"
              >
                {{ statusLabel(req.request_status) }}
              </CBadge>
            </td>

            <!-- Actions -->
            <td class="text-center">
              <div class="req-actions" v-if="req.request_status === 'pending_review'">
                <CButton
                  size="sm"
                  color="success"
                  variant="outline"
                  shape="pill"
                  class="action-btn"
                  v-c-tooltip="{ content: 'อนุมัติคำขอ', placement: 'top' }"
                  :disabled="processingId === req._id"
                  @click="onApprove(req)"
                >
                  <CIcon name="cil-check" />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="outline"
                  shape="pill"
                  class="action-btn"
                  v-c-tooltip="{ content: 'ปฏิเสธคำขอ', placement: 'top' }"
                  :disabled="processingId === req._id"
                  @click="onReject(req)"
                >
                  <CIcon name="cil-x" />
                </CButton>
                <CButton
                  size="sm"
                  color="info"
                  variant="outline"
                  shape="pill"
                  class="action-btn"
                  v-c-tooltip="{ content: 'ดูรายละเอียด', placement: 'top' }"
                  @click="onView(req)"
                >
                  <CIcon name="cil-magnifying-glass" />
                </CButton>
              </div>
              <div v-else class="req-actions">
                <CButton
                  size="sm"
                  color="secondary"
                  variant="ghost"
                  shape="pill"
                  class="action-btn"
                  v-c-tooltip="{ content: 'ดูรายละเอียด', placement: 'top' }"
                  @click="onView(req)"
                >
                  <CIcon name="cil-magnifying-glass" />
                </CButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VehicleRequestTable',
  props: {
    requests: { type: Array, default: () => [] },
    processingId: { type: String, default: null }
  },
  methods: {
    requestTypeLabel (type) {
      if (type === 'register') return 'ขอเพิ่มรถ'
      if (type === 'renew') return 'ต่ออายุ'
      return type || '-'
    },
    requestTypeColor (type) {
      if (type === 'register') return 'primary'
      if (type === 'renew') return 'info'
      return 'secondary'
    },
    vehicleTypeLabel (type) {
      if (type === 'car') return 'รถยนต์'
      if (type === 'motorcycle') return 'มอเตอร์ไซค์'
      return type || ''
    },
    statusLabel (status) {
      if (status === 'pending_review') return 'รอตรวจสอบ'
      if (status === 'approved') return 'อนุมัติแล้ว'
      if (status === 'rejected') return 'ปฏิเสธ'
      if (status === 'expired') return 'หมดอายุ'
      return status || '-'
    },
    statusColor (status) {
      if (status === 'pending_review') return 'warning'
      if (status === 'approved') return 'success'
      if (status === 'rejected') return 'danger'
      return 'secondary'
    },
    formatDate (dateStr) {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return '-'
      const dd = d.getDate().toString().padStart(2, '0')
      const mm = (d.getMonth() + 1).toString().padStart(2, '0')
      const yy = d.getFullYear() + 543
      const hh = d.getHours().toString().padStart(2, '0')
      const min = d.getMinutes().toString().padStart(2, '0')
      return dd + '/' + mm + '/' + yy + ' ' + hh + ':' + min
    },
    onApprove (req) { this.$emit('approve', req) },
    onReject (req) { this.$emit('reject', req) },
    onView (req) { this.$emit('view', req) }
  }
}
</script>

<style scoped>
.request-table-wrapper { width: 100%; }
.request-table-scroll { width: 100%; overflow-x: auto; }

.request-table {
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.request-table th {
  padding: 10px 12px;
  vertical-align: middle;
  font-weight: 700;
  font-size: 0.78rem;
  color: #3c4b64;
  background-color: #f8f9fa;
  border-bottom: 2px solid #d8dbe0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.request-table td {
  padding: 9px 12px;
  vertical-align: middle;
  border-bottom: 1px solid #eaecf0;
  font-size: 0.875rem;
}

.request-table tbody tr { transition: background-color 0.15s ease; }
.request-table tbody tr:hover { background-color: rgba(50, 110, 200, 0.04); }

/* Request ID */
.req-id {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.78rem;
  color: #5a6a85;
  background: #f1f3f7;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Plate */
.plate-text { font-weight: 700; color: #2c3e50; display: block; }
.province-text { font-size: 0.75rem; display: block; }

/* Vehicle info */
.vehicle-info-cell { display: flex; flex-direction: column; gap: 1px; }
.vehicle-info-cell span { font-size: 0.82rem; }

/* Date */
.date-text { font-size: 0.82rem; white-space: nowrap; }

/* Type badge */
.type-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.6rem; }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.26rem 0.65rem;
  font-size: 0.73rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid transparent;
}
.status--pending_review {
  background-color: rgba(255, 193, 7, 0.14) !important;
  color: #856404 !important;
  border-color: rgba(255, 193, 7, 0.28) !important;
}
.status--approved {
  background-color: rgba(40, 167, 69, 0.12) !important;
  color: #1f6b3a !important;
  border-color: rgba(40, 167, 69, 0.22) !important;
}
.status--rejected {
  background-color: rgba(220, 53, 69, 0.12) !important;
  color: #7a1f2a !important;
  border-color: rgba(220, 53, 69, 0.22) !important;
}

/* Actions */
.req-actions {
  white-space: nowrap;
  display: inline-flex;
  justify-content: center;
  gap: 4px;
}
.action-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
}

/* Empty state */
.request-table-empty {
  background-color: #f8f9fa;
  border: 1px dashed #d0d7e0;
  border-radius: 0.75rem;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem;
}
</style>
