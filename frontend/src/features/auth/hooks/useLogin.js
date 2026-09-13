import { useState } from 'react'
import { login } from '../services/authApi.js'

export function useLogin() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function submitLogin(credentials) {
    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const result = await login(credentials)
      setData(result)
      return result
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'ไม่สามารถเข้าสู่ระบบได้'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  function clearFeedback() {
    setData(null)
    setError(null)
  }

  return { clearFeedback, data, error, isLoading, submitLogin }
}
