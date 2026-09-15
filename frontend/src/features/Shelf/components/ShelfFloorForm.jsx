import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber, Select, Space, Table } from 'antd'
import { useEffect } from 'react'

const MAX_INTEGER = 2147483647
const EMPTY_CATEGORIES = []
const EMPTY_FLOORS = []

function parseIntegerInput(value) {
  return value?.replace(/[^\d]/g, '') || ''
}

function preventNonNumericKey(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || /^\d$/.test(event.key)) return

  const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'End', 'Home', 'Tab']
  if (!allowedKeys.includes(event.key)) {
    event.preventDefault()
  }
}

function getNextFloorNumber(floors) {
  const largestFloorNumber = floors.reduce(
    (largest, floor) => Math.max(largest, Number(floor?.shelfFloor) || 0),
    0,
  )
  return largestFloorNumber + 1
}

export function ShelfFloorForm({
  categories = EMPTY_CATEGORIES,
  initialFloors = EMPTY_FLOORS,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm()
  const floors = Form.useWatch('floors', form) || []
  const totalCapacity = floors.reduce(
    (total, shelfFloor) => total + Number(shelfFloor?.shelfFloorLimit || 0),
    0,
  )
  const nextFloorNumber = getNextFloorNumber(floors)

  useEffect(() => {
    form.setFieldsValue({
      floors: initialFloors.length > 0
        ? initialFloors
        : [{ shelfFloorId: null, shelfFloor: 1, shelfFloorLimit: null }],
    })
  }, [form, initialFloors])

  async function handleFinish({ floors: submittedFloors }) {
    const floorNumbers = new Set()
    const duplicateIndex = submittedFloors.findIndex(({ shelfFloor }) => {
      if (floorNumbers.has(shelfFloor)) return true

      floorNumbers.add(shelfFloor)
      return false
    })

    if (duplicateIndex !== -1) {
      form.setFields([{
        name: ['floors', duplicateIndex, 'shelfFloor'],
        errors: ['หมายเลขชั้นต้องไม่ซ้ำกัน'],
      }])
      return
    }

    const savedShelf = await onSubmit(submittedFloors)
    if (savedShelf) {
      form.resetFields()
    }
  }

  function handleCancel() {
    form.resetFields()
    onCancel()
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.List name="floors">
        {(fields, { add, remove }) => {
          const columns = [
            {
              key: 'shelfFloor',
              title: 'ชั้นที่',
              width: '20%',
              render: (_, field) => (
                <>
                  <Form.Item hidden name={[field.name, 'shelfFloorId']}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'shelfFloor']}
                    rules={[
                      { required: true, message: 'กรุณากรอกหมายเลขชั้น' },
                      {
                        type: 'number',
                        min: 1,
                        max: MAX_INTEGER,
                        message: 'ต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 2,147,483,647',
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      disabled={isSubmitting}
                      max={MAX_INTEGER}
                      min={1}
                      onKeyDown={preventNonNumericKey}
                      parser={parseIntegerInput}
                      precision={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'shelfFloorLimit',
              title: 'จำนวนที่เก็บได้',
              width: '25%',
              render: (_, field) => (
                <Form.Item
                  name={[field.name, 'shelfFloorLimit']}
                  rules={[
                    { required: true, message: 'กรุณากรอกจำนวนที่เก็บได้' },
                    {
                      type: 'number',
                      min: 0,
                      max: MAX_INTEGER,
                      message: 'ต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 2,147,483,647',
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    disabled={isSubmitting}
                    max={MAX_INTEGER}
                    min={0}
                    onKeyDown={preventNonNumericKey}
                    parser={parseIntegerInput}
                    precision={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ),
            },
            {
              key: 'categoryId',
              title: 'ประเภทหนังสือ',
              width: '45%',
              render: (_, field) => (
                <Form.Item
                  name={[field.name, 'categoryId']}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    allowClear
                    disabled={isSubmitting}
                    notFoundContent="ยังไม่มีประเภทหนังสือให้เลือก"
                    optionFilterProp="label"
                    options={categories.map((category) => ({
                      label: category.category_name,
                      value: String(category.category_id),
                    }))}
                    placeholder="เลือกประเภทหนังสือ"
                    showSearch
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ),
            },
            {
              align: 'center',
              key: 'actions',
              width: 56,
              render: (_, field) => (
                <Button
                  aria-label="ลบชั้นย่อย"
                  disabled={isSubmitting || fields.length === 1}
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                  type="text"
                />
              ),
            },
          ]

          return (
            <Table
              columns={columns}
              dataSource={fields}
              footer={() => (
                <div>
                  <strong style={{ display: 'block', marginBottom: 12 }}>
                    รวมจำนวนทุกแถว: {totalCapacity.toLocaleString()}
                  </strong>
                  <Button
                    block
                    disabled={isSubmitting || nextFloorNumber > MAX_INTEGER}
                    icon={<PlusOutlined />}
                    onClick={() => add({
                      shelfFloorId: null,
                      shelfFloor: nextFloorNumber,
                      shelfFloorLimit: null,
                      categoryId: undefined,
                    })}
                  >
                    เพิ่มชั้นย่อย
                  </Button>
                </div>
              )}
              pagination={false}
              rowKey="key"
              size="small"
              style={{ width: '100%' }}
            />
          )
        }}
      </Form.List>

      <Space style={{ marginTop: 24 }}>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          บันทึกการเปลี่ยนแปลง
        </Button>

        <Button disabled={isSubmitting} onClick={handleCancel}>
          ยกเลิก
        </Button>
      </Space>
    </Form>
  )
}
