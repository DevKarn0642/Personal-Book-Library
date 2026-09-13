import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Flex, Form, Grid, Input, Typography, theme } from 'antd'
import { useLogin } from '../hooks/useLogin.js'

const { Title } = Typography

export function LoginPage() {
  const screens = Grid.useBreakpoint()
  const { token } = theme.useToken()
  const { clearFeedback, data, error, isLoading, submitLogin } = useLogin()
  const isCompact = !screens.sm

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100svh', padding: isCompact ? 20 : 32 }}
    >
      <Card
        style={{
          width: 'min(100%, 430px)',
          borderRadius: token.borderRadiusLG,
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.07)',
        }}
        styles={{ body: { padding: isCompact ? 28 : 48 } }}
      >
        <Flex vertical gap={32}>
          <Title
            level={1}
            style={{
              margin: 0,
              fontFamily: "Georgia, 'Noto Serif Thai', serif",
              fontSize: isCompact ? 37 : 43,
              fontWeight: 400,
              letterSpacing: '-0.055em',
              lineHeight: 1.06,
            }}
          >
            Personal Book Library
          </Title>

          {error && <Alert message={error} showIcon type="error" />}
          {data && <Alert message="เข้าสู่ระบบสำเร็จ" showIcon type="success" />}

          <Form
            layout="vertical"
            size="large"
            onFinish={submitLogin}
            onValuesChange={clearFeedback}
          >
            <Form.Item
              label="อีเมลหรือชื่อผู้ใช้"
              name="identifier"
              rules={[{ required: true, message: 'กรุณากรอกอีเมลหรือชื่อผู้ใช้' }]}
              style={{ marginBottom: 16 }}
            >
              <Input
                aria-label="อีเมลหรือชื่อผู้ใช้"
                autoComplete="username"
                placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
                prefix={<MailOutlined />}
                style={{ height: 54 }}
              />
            </Form.Item>

            <Form.Item
              label="รหัสผ่าน"
              name="password"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                aria-label="รหัสผ่าน"
                autoComplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                prefix={<LockOutlined />}
                style={{ height: 54 }}
              />
            </Form.Item>

            <Button
              aria-label="เข้าสู่ระบบ"
              block
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{ height: 54, marginTop: 15 }}
              type="primary"
            >
              เข้าสู่ระบบ
            </Button>
          </Form>
        </Flex>
      </Card>
    </Flex>
  )
}
