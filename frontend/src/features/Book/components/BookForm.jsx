import { UploadOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, InputNumber, Select, Space, Typography, Upload } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'

function toSelectValue(value) {
  return value === null || value === undefined ? undefined : String(value)
}

function getFileName(bookFile) {
  if (!bookFile) return ''
  try {
    return decodeURIComponent(bookFile.split('/').pop())
  } catch {
    return bookFile
  }
}

function getUploadFileList(event) {
  return event?.fileList?.slice(-1) || []
}

export function BookForm({
  authors,
  book,
  categories,
  isReferenceDataLoading,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm()
  const bookType = Form.useWatch('bookType', form)
  const isEditing = Boolean(book)
  const isDisabled = isSubmitting || isReferenceDataLoading

  useEffect(() => {
    form.setFieldsValue({
      authorId: toSelectValue(book?.author_id),
      bookCoverImage: [],
      bookDate: book?.book_date ? dayjs(book.book_date) : null,
      bookFile: [],
      bookName: book?.book_name || '',
      bookTotalPage: book?.book_totalpage ?? null,
      bookType: book?.book_type || 'physical',
      categoryId: toSelectValue(book?.category_id),
    })
  }, [book, form])

  async function handleFinish(values) {
    const savedBook = await onSubmit({
      authorId: values.authorId || null,
      bookDate: values.bookDate?.format('YYYY-MM-DD') || null,
      bookCoverImage: values.bookCoverImage?.[0]?.originFileObj || null,
      bookFile: values.bookType === 'file' ? values.bookFile?.[0]?.originFileObj || null : null,
      bookName: values.bookName.trim(),
      bookTotalPage: values.bookTotalPage ?? null,
      bookType: values.bookType,
      categoryId: values.categoryId || null,
      existingBookCoverImage: values.bookCoverImage?.length ? null : book?.book_cover_image || null,
      existingBookFile: values.bookType === 'file' && !values.bookFile?.length
        ? book?.book_file || null
        : null,
    })

    if (savedBook && !isEditing) form.resetFields()
  }

  function handleCancel() {
    form.resetFields()
    onCancel()
  }

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item
        label="ชื่อหนังสือ"
        name="bookName"
        rules={[
          { required: true, whitespace: true, message: 'กรุณากรอกชื่อหนังสือ' },
          { max: 255, message: 'ชื่อหนังสือยาวได้ไม่เกิน 255 ตัวอักษร' },
        ]}
      >
        <Input disabled={isDisabled} maxLength={255} placeholder="เช่น The Left Hand of Darkness" />
      </Form.Item>

      <Form.Item label="หมวดหมู่" name="categoryId">
        <Select
          allowClear
          disabled={isDisabled}
          loading={isReferenceDataLoading}
          notFoundContent="ยังไม่มีหมวดหมู่ให้เลือก"
          optionFilterProp="label"
          options={categories.map((category) => ({
            label: category.category_name,
            value: String(category.category_id),
          }))}
          placeholder="เลือกหมวดหมู่ (ไม่บังคับ)"
          showSearch
        />
      </Form.Item>

      <Form.Item
        label="ประเภทหนังสือ"
        name="bookType"
        rules={[{ required: true, message: 'กรุณาเลือกประเภทหนังสือ' }]}
      >
        <Select
          disabled={isDisabled}
          onChange={(value) => {
            if (value === 'physical') form.setFieldValue('bookFile', [])
          }}
          options={[
            { label: 'เล่ม', value: 'physical' },
            { label: 'ไฟล์', value: 'file' },
          ]}
          placeholder="เลือกประเภทหนังสือ"
        />
      </Form.Item>

      <Form.Item label="ผู้เขียน" name="authorId">
        <Select
          allowClear
          disabled={isDisabled}
          loading={isReferenceDataLoading}
          notFoundContent="ยังไม่มีผู้เขียนให้เลือก"
          optionFilterProp="label"
          options={authors.map((author) => ({
            label: author.author_pen_name
              ? `${author.author_name} (${author.author_pen_name})`
              : author.author_name,
            value: String(author.author_id),
          }))}
          placeholder="เลือกผู้เขียน (ไม่บังคับ)"
          showSearch
        />
      </Form.Item>

      <Form.Item label="วันที่เผยแพร่" name="bookDate">
        <DatePicker disabled={isDisabled} format="DD/MM/YYYY" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="จำนวนหน้า" name="bookTotalPage">
        <InputNumber disabled={isDisabled} min={0} precision={0} style={{ width: '100%' }} />
      </Form.Item>

      {bookType === 'file' && (
        <>
          <Form.Item
            extra="รองรับไฟล์ PDF หรือ EPUB ขนาดไม่เกิน 50 MB"
            getValueFromEvent={getUploadFileList}
            label="ไฟล์หนังสือ"
            name="bookFile"
            rules={[{ required: !book?.book_file, message: 'กรุณาเลือกไฟล์หนังสือ' }]}
            valuePropName="fileList"
          >
            <Upload
              accept=".epub,.pdf,application/epub+zip,application/pdf"
              beforeUpload={() => false}
              disabled={isDisabled}
              maxCount={1}
            >
              <Button disabled={isDisabled} icon={<UploadOutlined />}>
                เลือกไฟล์
              </Button>
            </Upload>
          </Form.Item>

          {book?.book_file && (
            <Typography.Text type="secondary">
              ไฟล์ปัจจุบัน: {getFileName(book.book_file)} — เลือกไฟล์ใหม่เพื่อแทนที่
            </Typography.Text>
          )}
        </>
      )}

      <Form.Item
        extra="รองรับรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 50 MB"
        getValueFromEvent={getUploadFileList}
        label="รูปภาพหน้าปก"
        name="bookCoverImage"
        valuePropName="fileList"
      >
        <Upload
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          beforeUpload={() => false}
          disabled={isDisabled}
          maxCount={1}
        >
          <Button disabled={isDisabled} icon={<UploadOutlined />}>
            เลือกรูปภาพ
          </Button>
        </Upload>
      </Form.Item>

      {book?.book_cover_image && (
        <Typography.Text type="secondary">
          หน้าปกปัจจุบัน: {getFileName(book.book_cover_image)} — เลือกรูปใหม่เพื่อแทนที่
        </Typography.Text>
      )}

      <Space>
        <Button htmlType="submit" loading={isSubmitting} type="primary">
          {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
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
