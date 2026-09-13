import { Button, Form, Input, Space } from 'antd'
import { useEffect } from 'react'

export function AuthorForm({ author, isSubmitting, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const isEditing = Boolean(author)

  useEffect(() => {
    form.setFieldsValue({
      authorName: author?.author_name || '',
      authorPenName: author?.author_pen_name || '',
    })
  }, [author, form])

  async function handleFinish({ authorName, authorPenName }) {
    const savedAuthor = await onSubmit(authorName.trim(), authorPenName?.trim() || '')

    if (savedAuthor && !isEditing) {
      form.resetFields()
    }
  }

  function handleCancel() {
    form.resetFields()
    onCancel()
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        label="ชื่อผู้เขียน"
        name="authorName"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'กรุณากรอกชื่อผู้เขียน',
          },
          {
            max: 255,
            message: 'ชื่อผู้เขียนยาวได้ไม่เกิน 255 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={255}
          placeholder="เช่น J. K. Rowling"
        />
      </Form.Item>

      <Form.Item
        label="นามปากกา"
        name="authorPenName"
        rules={[
          {
            max: 255,
            message: 'นามปากกายาวได้ไม่เกิน 255 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={255}
          placeholder="ไม่บังคับ"
        />
      </Form.Item>

      <Space>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้เขียน'}
        </Button>

        {isEditing && (
          <Button disabled={isSubmitting} onClick={handleCancel}>
            ยกเลิก
          </Button>
        )}
      </Space>
    </Form>
  )
}
