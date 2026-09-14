import { ReloadOutlined } from '@ant-design/icons'
import { Button, Input, Select } from 'antd'

function filterOption(input, option) {
  return String(option?.label || '').toLocaleLowerCase().includes(input.toLocaleLowerCase())
}

export function LibraryFilters({
  authors,
  bookName,
  categories,
  filters,
  hasActiveFilters,
  isLoading,
  isReferenceDataLoading,
  onBookNameChange,
  onReset,
  onSearchBookName,
  onUpdateFilter,
  shelves,
}) {
  const authorOptions = authors.map((author) => ({
    label: author.author_pen_name
      ? `${author.author_name} (${author.author_pen_name})`
      : author.author_name,
    value: String(author.author_id),
  }))
  const categoryOptions = categories.map((category) => ({
    label: category.category_name,
    value: String(category.category_id),
  }))
  const shelfOptions = shelves.map((shelf) => ({
    label: shelf.shelf_name,
    value: String(shelf.shelf_id),
  }))

  return (
    <section aria-label="ตัวกรองคลังหนังสือ" className="library-filters">
      <Input.Search
        allowClear
        className="library-filters__book-search"
        enterButton="ค้นหา"
        onChange={(event) => {
          const value = event.target.value
          onBookNameChange(value)
          if (!value) onSearchBookName('')
        }}
        onSearch={onSearchBookName}
        placeholder="ค้นหาชื่อหนังสือ"
        value={bookName}
      />

      <Select
        allowClear
        disabled={isReferenceDataLoading}
        filterOption={filterOption}
        onChange={(value) => onUpdateFilter('bookType', value)}
        options={[
          { label: 'หนังสือเล่ม', value: 'physical' },
          { label: 'อีบุ๊ก', value: 'file' },
        ]}
        placeholder="ทุกประเภท"
        showSearch
        value={filters.bookType}
      />

      <Select
        allowClear
        disabled={isReferenceDataLoading}
        filterOption={filterOption}
        onChange={(value) => onUpdateFilter('categoryId', value)}
        options={categoryOptions}
        placeholder="ทุกหมวดหมู่"
        showSearch
        value={filters.categoryId}
      />

      <Select
        allowClear
        disabled={isReferenceDataLoading}
        filterOption={filterOption}
        onChange={(value) => onUpdateFilter('authorId', value)}
        options={authorOptions}
        placeholder="ผู้เขียนทั้งหมด"
        showSearch
        value={filters.authorId}
      />

      <Select
        allowClear
        disabled={isReferenceDataLoading}
        filterOption={filterOption}
        onChange={(value) => onUpdateFilter('shelfId', value)}
        options={shelfOptions}
        placeholder="ทุกชั้นวาง"
        showSearch
        value={filters.shelfId}
      />

      <Button
        disabled={isLoading || !hasActiveFilters}
        icon={<ReloadOutlined />}
        onClick={onReset}
      >
        ล้างตัวกรอง
      </Button>
    </section>
  )
}
