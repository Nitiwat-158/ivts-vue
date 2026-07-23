<template>
  <div class="account-page">
    <AppSectionHero
      :title="$t('accounts.users.title')"
      :subtitle="$t('accounts.users.subtitle')"
      :stats="heroStats"
      :meta-label="$t('common.lastUpdated')"
      :meta-value="lastUpdatedLabel"
      @refresh="loadData"
    />

    <CCard class="mb-3">
      <CCardBody class="d-flex justify-content-between align-items-center flex-wrap">
        <div class="d-flex align-items-center mb-2 mb-md-0">
          <span class="text-muted mr-3">{{ $t('accounts.users.table.subtitle') }}</span>
        </div>
        <div class="d-flex align-items-center" style="gap: 15px;">
          <CInput
            v-model.trim="localSearch"
            class="mb-0"
            :placeholder="$t('accounts.users.table.searchPlaceholder')"
            @input="onSearchInput"
          />
          <CSelect
            class="mb-0"
            :value.sync="pagination.limit"
            :options="pageSizeOptions"
            @update:value="changeLimit"
            style="width: 80px;"
          />
        </div>
      </CCardBody>
    </CCard>

    <CCard class="mb-4">
      <CCardHeader>
        <strong>{{ $t('accounts.users.title') }}</strong>
      </CCardHeader>
      <CCardBody class="p-0">
        <CDataTable
          hover
          striped
          :items="items"
          :fields="fields"
          :items-per-page="pagination.limit"
          :active-page.sync="pagination.page"
          :pagination="false"
          sorter
        >
          <template #role="{ item }">
            <td>
              <CBadge :color="item.role === 'admin' ? 'danger' : 'info'">
                {{ item.role ? item.role.toUpperCase() : 'USER' }}
              </CBadge>
            </td>
          </template>

          <template #createdAt="{ item }">
            <td>{{ formatThaiDate(item.createdAt || item.created_at) }}</td>
          </template>
        </CDataTable>

        <div v-if="loading" class="text-center my-4">
          <CSpinner size="sm" color="dark" />
        </div>
        <div v-else-if="!loading && !items.length" class="text-center my-4 text-muted">
          {{ $t('accounts.users.messages.noUsers') }}
        </div>
      </CCardBody>
      <CCardFooter class="d-flex justify-content-between align-items-center" v-if="pagination.total > 0">
        <div class="text-muted small">
          {{ pageSummary }}
        </div>
        <CPagination
          size="sm"
          class="mb-0"
          :active-page.sync="pagination.page"
          :pages="pagination.totalPages"
          responsive
          @update:activePage="loadPage"
        />
      </CCardFooter>
    </CCard>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppSectionHero from '@/projects/components/layout/AppSectionHero'
import { notifyError } from '@/projects/utils/notify'

export default {
  name: 'UserManagement',
  components: { AppSectionHero },
  data () {
    return {
      localSearch: '',
      searchTimer: null,
      pageSizeOptions: [25, 50, 100]
    }
  },
  computed: {
    ...mapGetters({
      items: 'users/items',
      pagination: 'users/pagination',
      loading: 'users/loading',
      lastUpdatedAt: 'users/lastUpdatedAt'
    }),
    fields () {
      return [
        { key: 'fullName', label: this.$t('accounts.users.table.fullName') },
        { key: 'email', label: this.$t('accounts.users.table.email') },
        { key: 'role', label: this.$t('accounts.users.table.role') },
        { key: 'createdAt', label: this.$t('accounts.users.table.createdAt') }
      ]
    },
    lastUpdatedLabel () {
      if (!this.lastUpdatedAt) return ''
      return this.formatThaiDate(this.lastUpdatedAt, true)
    },
    heroStats () {
      return [
        { label: this.$t('accounts.users.stats.total.label'), value: this.pagination.total || this.items.length, hint: this.$t('accounts.users.stats.total.hint'), icon: 'cil-people', iconClass: 'app-section-stat__icon--total' }
      ]
    },
    pageSummary () {
      const start = this.pagination.page && this.pagination.limit
        ? ((this.pagination.page - 1) * this.pagination.limit) + 1
        : 0
      const end = this.pagination.page && this.items.length
        ? start + this.items.length - 1
        : 0
      return this.$t('accounts.users.messages.pageSummary', { start, end, total: this.pagination.total || 0 })
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    formatThaiDate (dateVal, includeTime = false) {
      if (!dateVal) return '-'
      const d = new Date(dateVal)
      if (isNaN(d.getTime())) return dateVal

      const day = d.getDate().toString().padStart(2, '0')
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const year = d.getFullYear() + 543

      if (!includeTime) return `${day}/${month}/${year}`

      const hh = d.getHours().toString().padStart(2, '0')
      const mm = d.getMinutes().toString().padStart(2, '0')
      const ss = d.getSeconds().toString().padStart(2, '0')
      return `${day}/${month}/${year} ${hh}:${mm}:${ss}`
    },
    async loadData (options = {}) {
      try {
        await this.$store.dispatch('users/explorer', {
          page: options.page || this.pagination.page || 1,
          limit: options.limit || this.pagination.limit || 25,
          search: options.search != null ? options.search : this.pagination.search || ''
        })
      } catch (error) {
        notifyError(this.$store, this.$t('accounts.users.messages.loadError'))
      }
    },
    loadPage (page) {
      return this.loadData({ page })
    },
    searchUsers (search) {
      return this.loadData({ page: 1, search })
    },
    changeLimit (event) {
      const limit = event && event.target ? Number(event.target.value) : Number(event)
      return this.loadData({ page: 1, limit: limit || 25 })
    },
    onSearchInput () {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.searchUsers(this.localSearch)
      }, 300)
    }
  },
  beforeDestroy () {
    clearTimeout(this.searchTimer)
  }
}
</script>

<style scoped lang="scss">
.account-page {
  display: flex;
  flex-direction: column;
}

.account-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.empty-state {
  padding: 2rem;
  color: #5f6f86;
  text-align: center;
}
</style>