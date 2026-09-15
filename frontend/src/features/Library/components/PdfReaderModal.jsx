import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Grid, InputNumber, Space, Spin, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { API_BASE_URL } from '../../../services/api.js'
import { usePdfReadingHistory } from '../hooks/usePdfReadingHistory.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

function getFileUrl(filePath) {
  return /^https?:\/\//i.test(filePath) ? filePath : `${API_BASE_URL}${filePath}`
}

function isStoredBookFile(filePath) {
  return typeof filePath === 'string' && filePath.startsWith('/uploads/books/')
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'ไม่สามารถเปิดไฟล์ PDF ได้'
}

export function PdfReader({ book }) {
  const screens = Grid.useBreakpoint()
  const [numPages, setNumPages] = useState(0)
  const [pdfError, setPdfError] = useState(null)
  const {
    currentPage,
    isLoadingProgress,
    isSavingProgress,
    loadError,
    loadProgress,
    saveError,
    savePage,
    setCurrentPage,
  } = usePdfReadingHistory({ bookId: book?.book_id, isOpen: Boolean(book) })
  const documentOptions = useMemo(() => ({
    cMapPacked: true,
    cMapUrl: '/cmaps/',
    withCredentials: isStoredBookFile(book?.book_file),
  }), [book?.book_file])

  function changePage(page) {
    if (!Number.isInteger(page) || page < 1 || (numPages > 0 && page > numPages)) return

    setCurrentPage(page)
    void savePage(page)
  }

  function handleDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages)
    const restoredPage = Math.min(Math.max(currentPage, 1), pdf.numPages)
    if (restoredPage !== currentPage) setCurrentPage(restoredPage)
    void savePage(restoredPage)
  }

  return (
    <div className="pdf-reader">
        {isLoadingProgress ? (
          <Flex align="center" className="pdf-reader__loading" justify="center">
            <Spin size="large" />
          </Flex>
        ) : (
          <>
            {loadError && (
              <Alert
                action={<Button onClick={() => void loadProgress()} size="small">ลองใหม่</Button>}
                message={loadError}
                showIcon
                type="warning"
              />
            )}
            {saveError && <Alert message={saveError} showIcon type="warning" />}

            <Flex align="center" className="pdf-reader__toolbar" gap={12} justify="flex-end" wrap>
              <Space size={8}>
                <Typography.Text>หน้า</Typography.Text>
                <InputNumber
                  aria-label="เลขหน้าหนังสือ"
                  min={1}
                  max={numPages || undefined}
                  onChange={(page) => changePage(page)}
                  precision={0}
                  value={currentPage}
                />
                <Typography.Text type="secondary">จาก {numPages || '...'}</Typography.Text>
                {isSavingProgress && <Typography.Text type="secondary">กำลังบันทึก…</Typography.Text>}
              </Space>
            </Flex>

            <div className="pdf-reader__stage">
              <Button
                aria-label="หน้าก่อนหน้า"
                className="pdf-reader__navigation"
                disabled={currentPage <= 1}
                icon={<LeftOutlined />}
                onClick={() => changePage(currentPage - 1)}
                shape="circle"
                size="large"
              />

              <div className="pdf-reader__document">
                <Document
                  error={<Alert message={pdfError || 'ไม่สามารถเปิดไฟล์ PDF ได้'} showIcon type="error" />}
                  file={book ? getFileUrl(book.book_file) : undefined}
                  loading={<Flex align="center" className="pdf-reader__loading" justify="center"><Spin /></Flex>}
                  onLoadError={(error) => setPdfError(getErrorMessage(error))}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  options={documentOptions}
                >
                  <Page
                    pageNumber={currentPage}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    width={screens.xl ? 960 : screens.md ? 720 : 320}
                  />
                </Document>
              </div>

              <Button
                aria-label="หน้าถัดไป"
                className="pdf-reader__navigation"
                disabled={numPages === 0 || currentPage >= numPages}
                icon={<RightOutlined />}
                onClick={() => changePage(currentPage + 1)}
                shape="circle"
                size="large"
              />
            </div>
          </>
        )}
    </div>
  )
}
