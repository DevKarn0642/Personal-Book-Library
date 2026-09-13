import {
  BellOutlined,
  BookOutlined,
  DatabaseOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { Layout } from 'antd'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AlertPage } from '../../features/Alert/pages/AlertPage.jsx'
import { BookPage } from '../../features/Book/pages/BookPage.jsx'
import { CategoryPage } from '../../features/Category/pages/CategoryPage.jsx'
import { HistoryPage } from '../../features/History/pages/HistoryPage.jsx'
import { LibraryPage } from '../../features/Library/pages/LibraryPage.jsx'
import { ShelfPage } from '../../features/Shelf/pages/ShelfPage.jsx'
import { LoginPage } from '../../features/auth/pages/LoginPage.jsx'
import { AuthLayout } from '../../layouts/AuthLayout.jsx'
import { MainLayout } from '../../layouts/MainLayout.jsx'

const navigationItems = [
  { key: 'library', path: '/library', icon: <BookOutlined />, label: 'คลังหนังสือ' },
  { key: 'history', path: '/history', icon: <BookOutlined />, label: 'ประวัติการอ่าน' },
  { key: 'notifications', path: '/notifications', icon: <BellOutlined />, label: 'แจ้งเตือน' },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'ตั้งค่า',
    children: [
      { key: 'book-types', path: '/book-types/new', icon: <TagsOutlined />, label: 'เพิ่มประเภทหนังสือ' },
      { key: 'add-book', path: '/books/new', icon: <PlusCircleOutlined />, label: 'เพิ่มหนังสือ' },
      { key: 'shelves', path: '/shelves/new', icon: <DatabaseOutlined />, label: 'เพิ่มชั้นวางหนังสือ' },
    ],
  },
]

const routedNavigationItems = navigationItems.flatMap((item) => item.children || item)

function ProtectedLayout({ isAuthenticated, onSignOut }) {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedItem = routedNavigationItems.find((item) => item.path === location.pathname)

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  function handleNavigate(key) {
    const item = routedNavigationItems.find((navigationItem) => navigationItem.key === key)
    if (item) {
      navigate(item.path)
    }
  }

  return (
    <MainLayout
      navigationItems={navigationItems}
      onNavigate={handleNavigate}
      onSignOut={onSignOut}
      pageTitle={selectedItem?.label || 'Personal Book Library'}
      selectedKey={selectedItem?.key}
    >
      <Outlet />
    </MainLayout>
  )
}

function LoginRoute({ isAuthenticated, onLoginSuccess }) {
  if (isAuthenticated) {
    return <Navigate replace to="/library" />
  }

  return (
    <Layout style={{ minHeight: '100svh', overflow: 'auto' }}>
      <AuthLayout>
        <LoginPage onLoginSuccess={onLoginSuccess} />
      </AuthLayout>
    </Layout>
  )
}

function AppRoutes({ isAuthenticated, onLoginSuccess, onSignOut }) {
  return (
    <Routes>
      <Route element={<LoginRoute isAuthenticated={isAuthenticated} onLoginSuccess={onLoginSuccess} />} path="/login" />

      <Route element={<ProtectedLayout isAuthenticated={isAuthenticated} onSignOut={onSignOut} />}>
        <Route element={<Navigate replace to="/library" />} path="/" />
        <Route element={<LibraryPage />} path="/library" />
        <Route element={<AlertPage />} path="/notifications" />
        <Route element={<CategoryPage />} path="/book-types/new" />
        <Route element={<BookPage />} path="/books/new" />
        <Route element={<ShelfPage />} path="/shelves/new" />
        <Route element={<HistoryPage />} path="/history" />
      </Route>

      <Route element={<Navigate replace to={isAuthenticated ? '/library' : '/login'} />} path="*" />
    </Routes>
  )
}

export function AppRouter({ isAuthenticated, onLoginSuccess, onSignOut }) {
  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLoginSuccess={onLoginSuccess}
        onSignOut={onSignOut}
      />
    </BrowserRouter>
  )
}
