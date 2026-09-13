import { ConfigProvider, Layout } from 'antd'
import { LoginPage } from '../features/auth/pages/LoginPage.jsx'
import { AuthLayout } from '../layouts/AuthLayout.jsx'

function App() {
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
      <Layout
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'auto',
        }}
      >
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
