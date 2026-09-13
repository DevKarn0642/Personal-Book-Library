import { Button, Form, Input, Space } from 'antd'
import { useEffect } from 'react'

export function CategoryForm({
  category,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm()
  const isEditing = Boolean(category)

  useEffect(() => {
    form.setFieldsValue({
      categoryName: category?.category_name || '',
    })
  }, [category, form])

  async function handleFinish({ categoryName }) {
    const savedCategory = await onSubmit(categoryName.trim())

    if (savedCategory && !isEditing) {
      form.resetFields()
    }
  }

  function handleCancel() {
    form.resetFields()
    onCancel()
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item
        label="ชื่อหมวดหมู่"
        name="categoryName"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'กรุณากรอกชื่อหมวดหมู่',
          },
          {
            max: 100,
            message: 'ชื่อหมวดหมู่ยาวได้ไม่เกิน 100 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={100}
          placeholder="เช่น นิยาย, ประวัติศาสตร์"
        />
      </Form.Item>

      <Space>
        <Button
          htmlType="submit"
          loading={isSubmitting}
          type="primary"
        >
          {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
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