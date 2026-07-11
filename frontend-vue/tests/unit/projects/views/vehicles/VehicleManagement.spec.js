import { shallowMount } from '@vue/test-utils'
import VehicleManagement from '@/projects/views/vehicles/VehicleManagement'

describe('VehicleManagement', () => {
  it('renders the page title and website action', () => {
    const wrapper = shallowMount(VehicleManagement, {
      mocks: {
        $t: (key) => key
      },
      stubs: {
        AppSectionHero: true,
        CCard: true,
        CCardBody: true,
        CButton: true
      }
    })

    expect(wrapper.text()).toContain('vehicleManagement.title')
    expect(wrapper.text()).toContain('vehicleManagement.actions.openWebsite')
  })
})
