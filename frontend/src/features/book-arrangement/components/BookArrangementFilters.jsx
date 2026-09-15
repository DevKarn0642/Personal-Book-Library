import { Button, Form, Input, Select, Space } from 'antd'

const initialValues = {
  authorId: undefined,
  bookType: undefined,
  categoryId: undefined,
  search: '',
  shelfStatus: 'all',
}

function authorLabel(author) {
  return author.author_pen_name
    ? `${author.author_name} (${author.author_pen_name})`
    : author.author_name
}

export function BookArrangementFilters({ authors, categories, filters, isLoading, onApply }) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      initialValues={filters}
      layout="vertical"
      onFinish={onApply}
      style={{ marginBottom: 20 }}
    >
      <Space align="end" size="middle" wrap>
        <Form.Item label="สถานะชั้นวาง" name="shelfStatus" style={{ minWidth: 170 }}>
          <Select
            options={[
              { label: 'ทั้งหมด', value: 'all' },
              { label: 'บันทึกชั้นแล้ว', value: 'assigned' },
              { label: 'ยังไม่ได้บันทึกชั้น', value: 'unassigned' },
            ]}
          />
        </Form.Item>

        <Form.Item label="หมวดหมู่" name="categoryId" style={{ minWidth: 180 }}>
          <Select
            allowClear
            optionFilterProp="label"
            options={categories.map((category) => ({
              label: category.category_name,
              value: String(category.category_id),
            }))}
            placeholder="ทุกหมวดหมู่"
            showSearch
          />
        </Form.Item>

        <Form.Item label="ประเภท" name="bookType" style={{ minWidth: 140 }}>
          <Select
            allowClear
            options={[
              { label: 'เล่มจริง', value: 'physical' },
              { label: 'ไฟล์', value: 'file' },
            ]}
            placeholder="ทุกประเภท"
          />
        </Form.Item>

        <Form.Item label="ผู้เขียน" name="authorId" style={{ minWidth: 190 }}>
          <Select
            allowClear
            optionFilterProp="label"
            options={authors.map((author) => ({
              label: authorLabel(author),
              value: String(author.author_id),
            }))}
            placeholder="ผู้เขียนทั้งหมด"
            showSearch
          />
        </Form.Item>

        <Form.Item label="ชื่อหนังสือ" name="search" style={{ minWidth: 220 }}>
          <Input allowClear placeholder="ค้นหาชื่อหนังสือ" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button disabled={isLoading} htmlType="submit" type="primary">ค้นหา</Button>
          </Space>
        </Form.Item>
      </Space>
    </Form>
  )
}
