import { useState } from 'react'
import {
  BookOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, ConfigProvider, Divider, Drawer, Dropdown, Flex, Grid, Layout, Menu, Typography } from 'antd'

const { Header, Content, Sider } = Layout
const { Text } = Typography

function LibraryNavigation({ collapsed, navigationItems, onSelect, selectedKey }) {
  const selectedParentKeys = navigationItems
    .filter((item) => item.children?.some((child) => child.key === selectedKey))
    .map((item) => item.key)

  return (
    <Flex vertical style={{ height: '100%' }}>
      <Flex
        align="center"
        gap={12}
        style={{ height: 72, padding: collapsed ? '0 24px' : '0 22px', whiteSpace: 'nowrap' }}
      >
        <Flex
          align="center"
          justify="center"
          style={{ width: 30, height: 30, borderRadius: 8, background: '#1d1d1d', color: '#fff', flex: '0 0 auto' }}
        >
          <BookOutlined />
        </Flex>
        {!collapsed && (
          <Text strong style={{ fontFamily: "Georgia, 'Noto Serif Thai', serif", fontSize: 18, letterSpacing: '-0.03em' }}>
            My Library
          </Text>
        )}
      </Flex>

      <Divider style={{ margin: 0 }} />

      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemHoverBg: '#f0f7ff',
              itemHoverColor: '#1677ff',
              itemSelectedBg: '#e8f3ff',
              itemSelectedColor: '#1677ff',
            },
          },
        }}
      >
        <Menu
          defaultOpenKeys={selectedParentKeys}
          inlineCollapsed={collapsed}
          items={navigationItems}
          mode="inline"
          onSelect={({ key }) => onSelect(key)}
          selectedKeys={selectedKey ? [selectedKey] : []}
          style={{ borderInlineEnd: 0, marginTop: 16, padding: '0 10px' }}
        />
      </ConfigProvider>
    </Flex>
  )
}

export function MainLayout({ children, navigationItems, onNavigate, onSignOut, pageTitle, selectedKey }) {
  const screens = Grid.useBreakpoint()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const isDesktop = Boolean(screens.lg)

  function handleNavigationSelect(key) {
    onNavigate(key)
    setIsMobileNavigationOpen(false)
  }

  const accountItems = [
    {
      key: 'sign-out',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      onClick: onSignOut,
    },
  ]

  return (
    <Layout hasSider={isDesktop} style={{ minHeight: '100svh', background: '#f4f4f2' }}>
      {isDesktop && (
        <Sider
          collapsed={isCollapsed}
          collapsedWidth={80}
          theme="light"
          trigger={null}
          width={256}
          style={{ borderInlineEnd: '1px solid #e8e8e5', position: 'sticky', top: 0, height: '100svh' }}
        >
          <LibraryNavigation
            collapsed={isCollapsed}
            navigationItems={navigationItems}
            onSelect={handleNavigationSelect}
            selectedKey={selectedKey}
          />
        </Sider>
      )}

      <Drawer
        closable={false}
        open={!isDesktop && isMobileNavigationOpen}
        onClose={() => setIsMobileNavigationOpen(false)}
        placement="left"
        styles={{ body: { padding: 0 } }}
        width={280}
      >
        <LibraryNavigation
          collapsed={false}
          navigationItems={navigationItems}
          onSelect={handleNavigationSelect}
          selectedKey={selectedKey}
        />
      </Drawer>

      <Layout style={{ minWidth: 0, background: 'transparent' }}>
        <Header
          style={{
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.88)',
            borderBottom: '1px solid #e8e8e5',
            display: 'flex',
            height: 72,
            justifyContent: 'space-between',
            padding: isDesktop ? '0 32px' : '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Flex align="center" gap={12}>
            <Button
              aria-label={isDesktop ? 'ย่อหรือขยายแถบเมนู' : 'เปิดเมนู'}
              icon={
                isDesktop ? (
                  isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                ) : (
                  <MenuOutlined />
                )
              }
              onClick={() =>
                isDesktop
                  ? setIsCollapsed((currentValue) => !currentValue)
                  : setIsMobileNavigationOpen(true)
              }
              type="text"
            />
            <Text strong style={{ fontSize: 16 }}>
              {pageTitle}
            </Text>
          </Flex>

          <Dropdown menu={{ items: accountItems }} placement="bottomRight" trigger={['click']}>
            <Button aria-label="เมนูบัญชี" shape="circle" type="text">
              <Avatar icon={<UserOutlined />} size="small" style={{ background: '#e8e8e5', color: '#1d1d1d' }} />
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: isDesktop ? 32 : 20 }}>
          <main style={{ margin: '0 auto', maxWidth: 1200 }}>{children}</main>
        </Content>
      </Layout>
    </Layout>
  )
}
