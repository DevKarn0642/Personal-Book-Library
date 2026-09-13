import { Button, Form, Input, InputNumber, Space } from 'antd'
import { useEffect } from 'react'

const MAX_SHELF_LIMIT = 2147483647

export function ShelfForm({ shelf, isSubmitting, onCancel, onSubmit }) {
  const [form] = Form.useForm()
  const isEditing = Boolean(shelf)

  useEffect(() => {
    form.setFieldsValue({
      shelfName: shelf?.shelf_name || '',
      shelfLimit: shelf?.shelf_limit ?? null,
      shelfColor: shelf?.shelf_color || '',
      shelfMaterial: shelf?.shelf_material || '',
    })
  }, [form, shelf])

  async function handleFinish({ shelfName, shelfLimit, shelfColor, shelfMaterial }) {
    const savedShelf = await onSubmit(
      shelfName.trim(),
      shelfLimit ?? null,
      shelfColor?.trim() || null,
      shelfMaterial?.trim() || null,
    )

    if (savedShelf && !isEditing) {
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
        label="ชื่อชั้นวาง"
        name="shelfName"
        rules={[
          {
            required: true,
            whitespace: true,
            message: 'กรุณากรอกชื่อชั้นวาง',
          },
          {
            max: 255,
            message: 'ชื่อชั้นวางยาวได้ไม่เกิน 255 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={255}
          placeholder="เช่น ชั้นวางในห้องนั่งเล่น"
        />
      </Form.Item>

      <Form.Item
        label="จำนวนหนังสือสูงสุด"
        name="shelfLimit"
        rules={[
          {
            type: 'number',
            min: 0,
            max: MAX_SHELF_LIMIT,
            message: 'กรุณากรอกจำนวนเต็มตั้งแต่ 0 ถึง 2,147,483,647',
          },
        ]}
      >
        <InputNumber
          disabled={isSubmitting}
          max={MAX_SHELF_LIMIT}
          min={0}
          placeholder="ไม่บังคับ"
          precision={0}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="สี"
        name="shelfColor"
        rules={[
          {
            max: 100,
            message: 'สีระบุได้ไม่เกิน 100 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={100}
          placeholder="เช่น สีขาว หรือ #FFFFFF"
        />
      </Form.Item>

      <Form.Item
        label="วัสดุ"
        name="shelfMaterial"
        rules={[
          {
            max: 100,
            message: 'วัสดุระบุได้ไม่เกิน 100 ตัวอักษร',
          },
        ]}
      >
        <Input
          disabled={isSubmitting}
          maxLength={100}
          placeholder="เช่น ไม้ หรือ เหล็ก"
        />
      </Form.Item>

      <Space>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกชั้นวาง'}
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
