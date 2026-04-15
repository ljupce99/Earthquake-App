import axios from 'axios'

const api = axios.create({
  baseURL: '/api/earthquakes',
  headers: { accept: '*/*' },
})

async function request(path, options = {}) {
  try {
    const response = await api.request({
      url: path,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.body,
    })

    return response.data
  } catch (error) {
    const status = error?.response?.status
    const message = error?.response?.data?.message || `Request failed with status ${status ?? 'unknown'}`
    throw new Error(message)
  }
}

export const earthquakeService = {
  getAll: () => request(''),
  fetchAndRefresh: () => request('/fetch', { method: 'POST' }),
  filterByMagnitude: (minMag) => request(`/filter?minMag=${encodeURIComponent(minMag)}`),
  filterAfter: (iso) => request(`/filter/after?time=${encodeURIComponent(iso)}`),
  filterCombined: (minMag, iso) => request(`/filter/combined?minMag=${encodeURIComponent(minMag)}&after=${encodeURIComponent(iso)}`),
  deleteById: (id) => request(`/${id}`, { method: 'DELETE' }),
}
