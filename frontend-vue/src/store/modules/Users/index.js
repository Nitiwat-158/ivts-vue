import Service from '@/service/api'
import { formatDateTime24 } from '@/projects/utils/date-time'

function normalizePagination(raw, fallback) {
  const page = Number(raw && raw.page ? raw.page : fallback.page) || 1
  const limit = Number(raw && raw.limit ? raw.limit : fallback.limit) || 25
  const total = Number(raw && raw.total ? raw.total : 0) || 0
  const totalPages = Math.max(Number(raw && raw.totalPages ? raw.totalPages : Math.ceil(total / limit)) || 1, 1)
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: !!(raw && raw.hasMore),
    search: raw && raw.search != null ? String(raw.search || '') : String(fallback.search || ''),
    user_type: raw && raw.user_type != null ? String(raw.user_type || '') : String(fallback.user_type || '')
  }
}

function mapUser(item) {
  const firstName = item && item.name ? String(item.name).trim() : ''
  const lastName = item && item.surname ? String(item.surname).trim() : ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const createdAt = item && item.created_at ? new Date(item.created_at) : null
  return {
    _id: item && item._id ? String(item._id) : '',
    email: item && item.email ? String(item.email) : '-',
    role: item && item.role ? String(item.role) : '-',
    fullName: fullName || String(item && item.email ? item.email : item && item.iam_user_id ? item.iam_user_id : '-'),
    user_type: item && item.user_type ? String(item.user_type) : (item && item.department ? String(item.department) : '-'),
    createdAt: createdAt ? createdAt.toISOString().slice(0, 10) : '-',
    createdAtLabel: createdAt ? formatDateTime24(createdAt) : '-',
    raw: item
  }
}

const state = {
  items: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    hasMore: false,
    search: '',
    user_type: ''
  },
  loading: false,
  lastUpdatedAt: null
}

export default {
  namespaced: true,
  state,
  mutations: {
    items(state, value) {
      state.items = Array.isArray(value) ? value : []
    },
    pagination(state, value) {
      state.pagination = Object.assign({}, state.pagination, value || {})
    },
    loading(state, value) {
      state.loading = !!value
    },
    lastUpdatedAt(state, value) {
      state.lastUpdatedAt = value instanceof Date ? value : null
    }
  },
  actions: {
    async explorer({ commit, state }, options = {}) {
      const page = Number(options.page || state.pagination.page || 1) || 1
      const limit = Number(options.limit || state.pagination.limit || 25) || 25
      const search = options.search != null ? String(options.search || '') : String(state.pagination.search || '')
      const user_type = options.user_type != null ? String(options.user_type || '') : String(state.pagination.user_type || '')
      commit('loading', true)
      try {
        const response = await Service.users('list', { page, limit, search, user_type })

        const data = response && response.data ? response.data : {}

        // รองรับทั้ง data.data และ data.items
        const rawItems = Array.isArray(data.data) ? data.data : (Array.isArray(data.items) ? data.items : [])
        const items = rawItems.map(mapUser)

        const pagination = normalizePagination(data.pagination, { page, limit, search, user_type })
        commit('items', items)
        commit('pagination', pagination)
        commit('lastUpdatedAt', new Date())
        return items
      } catch (err) {
        console.error('Fetch users failed:', err)
        commit('items', [])
        throw err
      } finally {
        commit('loading', false)
      }
    }
  },
  getters: {
    items: state => state.items,
    pagination: state => state.pagination,
    loading: state => state.loading,
    lastUpdatedAt: state => state.lastUpdatedAt,
    lastUpdatedLabel: state => formatDateTime24(state.lastUpdatedAt)
  }
}
