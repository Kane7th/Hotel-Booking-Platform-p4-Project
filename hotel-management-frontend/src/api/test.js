import axios from 'axios'

export const testConnection = async () => {
  try {
    const response = await axios.get('/api/')
    return response.data
  } catch (error) {
    throw new Error('Backend connection failed: ' + error.message)
  }
}
