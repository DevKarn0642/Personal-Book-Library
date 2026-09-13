import { useEffect, useState } from 'react'
import { ConfigProvider, Flex, Layout, Spin } from 'antd'
import { getCurrentUser, logout } from '../features/auth/services/authApi.js'
import { AppRouter } from './router/AppRouter.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const user = await getCurrentUser()
        if (isMounted) {
          setIsAuthenticated(Boolean(user))
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSignOut() {
    await logout()
    setIsAuthenticated(false)
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 7,
          borderRadiusLG: 16,
          colorBgLayout: '#f4f4f2',
          colorPrimary: '#1d1d1d',
          colorTextBase: '#1d1d1d',
          fontFamily: 'Inter, "Noto Sans Thai", system-ui, sans-serif',
        },
        components: {
          Button: { primaryShadow: 'none' },
          Input: { activeShadow: '0 0 0 2px rgba(0, 0, 0, 0.05)' },
        },
      }}
    >
      {isCheckingSession ? (
        <Layout style={{ minHeight: '100svh' }}>
          <Flex align="center" justify="center" style={{ minHeight: '100svh' }}>
            <Spin size="large" />
          </Flex>
        </Layout>
      ) : (
        <AppRouter
          isAuthenticated={isAuthenticated}
          onLoginSuccess={() => setIsAuthenticated(true)}
          onSignOut={handleSignOut}
        />
      )}
    </ConfigProvider>
  )
}

export default App
