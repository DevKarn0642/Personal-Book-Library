import { Button, Form, Input, InputNumber, Select, Space } from 'antd'
import { useEffect } from 'react'

export function HistoryForm({
  bookOptions,
  history,
  isBookOptionsLoading,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm()
  const isEditing = Boolean(history)

  useEffect(() => {
    form.setFieldsValue({
      bookId: history?.book_id || undefined,
      historyPage: history?.history_page ?? 0,
      historyStatus: history?.history_status || '',
    })
  }, [form, history])

  async function handleFinish(values) {
    const savedHistory = await onSubmit({
      bookId: values.bookId,
      historyPage: values.historyPage ?? 0,
      historyStatus: values.historyStatus || '',
    })

    if (savedHistory && !isEditing) {
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
        label="หนังสือ"
        name="bookId"
        rules={[{ required: true, message: 'กรุณาเลือกหนังสือ' }]}
      >
        <Select
          disabled={isSubmitting}
          loading={isBookOptionsLoading}
          notFoundContent="ยังไม่มีหนังสือให้เลือก"
          optionFilterProp="label"
          options={bookOptions.map((book) => ({
            label: `${book.book_name} (ID: ${book.book_id})`,
            value: book.book_id,
          }))}
          placeholder="เลือกหนังสือ"
          showSearch
        />
      </Form.Item>

      <Form.Item
        label="หน้าที่อ่านล่าสุด"
        name="historyPage"
        rules={[{ required: true, message: 'กรุณาระบุหน้าที่อ่านล่าสุด' }]}
      >
        <InputNumber disabled={isSubmitting} min={0} precision={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="สถานะ" name="historyStatus">
        <Input disabled={isSubmitting} maxLength={50} placeholder="เช่น กำลังอ่าน หรือ อ่านจบ" />
      </Form.Item>

      <Space>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มประวัติการอ่าน'}
        </Button>
        <Button disabled={isSubmitting} onClick={handleCancel}>ยกเลิก</Button>
      </Space>
    </Form>
  )
}
