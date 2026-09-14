import { Button, DatePicker, Form, Select, Space, Switch, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'

const repeatOptions = [
  { label: 'ทุกวัน', value: 'daily' },
  { label: 'ทุกสัปดาห์', value: 'weekly' },
  { label: 'ทุกเดือน', value: 'monthly' },
  { label: 'ทุกปี', value: 'yearly' },
]

function toTimeValue(alertTime) {
  return alertTime ? dayjs(`2000-01-01T${alertTime}`) : null
}

export function AlertForm({
  alert,
  bookOptions,
  isBookOptionsLoading,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm()
  const isEditing = Boolean(alert)

  useEffect(() => {
    form.setFieldsValue({
      alertRepeatType: alert?.alert_repeat_type || '',
      alertDate: alert?.alert_date ? dayjs(alert.alert_date) : null,
      alertStatus: alert?.alert_status ?? true,
      alertTime: toTimeValue(alert?.alert_time),
      bookId: alert?.book_id || '',
    })
  }, [alert, form])

  async function handleFinish(values) {
    const savedAlert = await onSubmit({
      alertRepeatType: values.alertRepeatType || '',
      alertDate: values.alertDate?.format('YYYY-MM-DD') || '',
      alertStatus: values.alertStatus,
      alertTime: values.alertTime?.format('HH:mm') || '',
      bookId: values.bookId || '',
    })

    if (savedAlert && !isEditing) {
      form.resetFields()
    }
  }

  function handleCancel() {
    form.resetFields()
    onCancel()
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item label="รูปแบบการแจ้งเตือน" name="alertRepeatType">
        <Select
          allowClear
          disabled={isSubmitting}
          options={repeatOptions}
          placeholder="เลือกความถี่"
        />
      </Form.Item>

      <Form.Item label="วันที่แจ้งเตือน" name="alertDate">
        <DatePicker disabled={isSubmitting} format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="เวลาแจ้งเตือน" name="alertTime">
        <TimePicker disabled={isSubmitting} format="HH:mm" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="หนังสือ" name="bookId">
        <Select
          allowClear
          disabled={isSubmitting}
          loading={isBookOptionsLoading}
          notFoundContent="ยังไม่มีหนังสือให้เลือก"
          optionFilterProp="label"
          options={bookOptions.map((book) => ({
            label: `${book.book_name} (ID: ${book.book_id})`,
            value: book.book_id,
          }))}
          placeholder="เลือกหนังสือ (ไม่บังคับ)"
          showSearch
        />
      </Form.Item>

      <Form.Item label="เปิดใช้งานการแจ้งเตือน" name="alertStatus" valuePropName="checked">
        <Switch checkedChildren="เปิด" disabled={isSubmitting} unCheckedChildren="ปิด" />
      </Form.Item>

      <Space>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มการแจ้งเตือน'}
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
