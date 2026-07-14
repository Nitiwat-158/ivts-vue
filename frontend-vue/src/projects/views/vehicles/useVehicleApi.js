const mockVehicles = [
  { id: '1', plate: 'กท-1234', owner: 'สมชาย ใจดี', docStatus: 'Pending', accountStatus: 'Active', docImageUrl: 'https://via.placeholder.com/640x480?text=Document+1' },
  { id: '2', plate: 'ขข-5678', owner: 'สมหญิง แก้วใส', docStatus: 'Approved', accountStatus: 'Active', docImageUrl: 'https://via.placeholder.com/640x480?text=Document+2' },
  { id: '3', plate: 'จจ-9012', owner: 'วิทยา ประเสริฐ', docStatus: 'Rejected', accountStatus: 'Suspended', docImageUrl: '' },
  { id: '4', plate: 'คค-3456', owner: 'ณัฐยา ดีงาม', docStatus: 'Pending', accountStatus: 'Active', docImageUrl: 'https://via.placeholder.com/640x480?text=Document+4' }
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchVehicles(searchQuery = '', statusFilter = 'all') {
  await delay(500)
  const query = String(searchQuery || '').trim().toLowerCase()
  return mockVehicles.filter((vehicle) => {
    const matchesSearch = !query || vehicle.plate.toLowerCase().includes(query) || vehicle.owner.toLowerCase().includes(query)
    const matchesStatus = statusFilter === 'all' || vehicle.docStatus.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })
}

export async function approveVehicle(id) {
  await delay(500)
  const vehicle = mockVehicles.find((item) => item.id === id)
  if (!vehicle) throw new Error('Vehicle not found')
  vehicle.docStatus = 'Approved'
  return vehicle
}

export async function rejectVehicle(id, reason) {
  await delay(500)
  const vehicle = mockVehicles.find((item) => item.id === id)
  if (!vehicle) throw new Error('Vehicle not found')
  vehicle.docStatus = 'Rejected'
  return { vehicle, reason }
}

export async function deleteVehicle(id) {
  await delay(500)
  const index = mockVehicles.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Vehicle not found')
  mockVehicles.splice(index, 1)
  return true
}

export async function updateAccountStatus(id, status) {
  await delay(500)
  const vehicle = mockVehicles.find((item) => item.id === id)
  if (!vehicle) throw new Error('Vehicle not found')
  vehicle.accountStatus = status
  return vehicle
}
