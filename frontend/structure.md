# Frontend structure และแนวทางเพิ่มฟีเจอร์

เอกสารนี้อธิบายโครงสร้างของ `frontend/` ในโปรเจกต์ Personal Book
Library และกำหนดแนวทางเดียวกันสำหรับการเพิ่มฟีเจอร์ต่อจากนี้

## สถานะปัจจุบัน

Frontend ใช้ **React 19 + Vite 8** เขียนด้วย JavaScript/JSX และมี
Ant Design ติดตั้งไว้แล้ว โค้ดเริ่มทำงานที่ `src/main.jsx` ซึ่งโหลด
CSS กลางและ render `src/app/App.jsx` ภายใต้ `StrictMode`

โครงสร้างสำหรับแยกตามฟีเจอร์ถูกเตรียมไว้แล้ว แต่หลายโฟลเดอร์ยังมี
เพียง `.gitkeep` เท่านั้น ขณะที่ `App.jsx` และ `App.css` ยังเป็นหน้า
ตัวอย่างของ Vite ดังนั้นยังไม่มี router, state library หรือรูปแบบหน้า
จริงที่ถูกใช้งานอยู่ ต้องเริ่มวางส่วนเหล่านี้ตามแนวทางในเอกสารนี้
ก่อนสร้างหลายฟีเจอร์

`src/services/api.js` มี `apiRequest()` สำหรับส่ง `fetch` ไปยัง
`VITE_API_URL` (ค่าเริ่มต้นคือ `http://localhost:3000`) และในปัจจุบัน
คืนค่า `Response` จาก `fetch` โดยตรง

## ผังโฟลเดอร์

```text
frontend/
├── public/                         # ไฟล์ static ที่อ้างผ่าน URL ได้โดยตรง
├── src/
│   ├── main.jsx                    # จุดเริ่มต้น: render React และ import index.css
│   ├── index.css                   # style/tokens/reset ระดับแอป
│   ├── app/
│   │   ├── App.jsx                 # root component; ประกอบ providers และ router
│   │   ├── App.css                 # style ของ app shell ชั่วคราว
│   │   ├── providers/              # provider ระดับแอป เช่น AntD, Auth context
│   │   └── router/                 # route definitions และ route guards
│   ├── assets/
│   │   ├── images/                 # รูปที่ import จาก JSX
│   │   └── icons/                  # icon ที่เป็น asset ของโปรเจกต์
│   ├── features/                   # โค้ดแยกตาม business feature
│   │   ├── auth/                   # โครงสร้างฟีเจอร์ login/auth ที่เตรียมไว้
│   │   └── template/               # แม่แบบสำหรับฟีเจอร์ใหม่
│   ├── layouts/
│   │   ├── MainLayout.jsx          # shell สำหรับหน้าที่ login แล้ว
│   │   └── AuthLayout.jsx          # shell สำหรับหน้า authentication
│   ├── services/
│   │   └── api.js                  # HTTP client กลางและ API base URL
│   ├── shared/                     # สิ่งที่ใช้ร่วมได้โดยไม่ผูกกับ feature ใด
│   │   ├── components/             # เช่น Button, DataTable, Modal
│   │   ├── constants/              # constants ที่ใช้ข้าม feature
│   │   ├── hooks/                  # hooks ที่เป็น generic
│   │   └── utils/                  # pure helper functions
│   └── store/
│       └── index.js                # จุดรวม global state เมื่อจำเป็น
├── index.html                      # HTML shell ของ Vite
├── vite.config.js                  # Vite configuration (ยังไม่มี import alias)
└── package.json                    # scripts และ dependencies
```

โฟลเดอร์ `features/auth` และ `features/template` เตรียมโฟลเดอร์ย่อย
`components`, `hooks`, `pages`, `services`, `store` ไว้แล้ว ให้ใช้
`template` เป็นแบบตั้งต้นของฟีเจอร์ใหม่ ไม่ควรนำโค้ดของ domain ใหม่ไป
ใส่ใน `app/` หรือ `shared/`

## ขอบเขตความรับผิดชอบและทิศทางการ import

```text
main.jsx → app (providers/router) → layouts + features
                                  → shared + services
features/<feature>                → shared + services + โค้ดของ feature เดียวกัน
shared                            → shared เท่านั้น
```

- `app/` ทำหน้าที่ประกอบแอป ไม่เก็บ business UI หรือการเรียก API ของฟีเจอร์
- `layouts/` เก็บเฉพาะโครงหน้าร่วม เช่น header, sidebar และพื้นที่ `children`
- `features/<name>/` เป็นเจ้าของหน้า, UI, API, hook และ state ของ domain นั้น
- `shared/` ใช้ได้เฉพาะสิ่งที่ไม่รู้จัก domain ใดเลย และถูกใช้ซ้ำจริงอย่างน้อย 2 จุด
- `services/api.js` เป็น HTTP infrastructure กลาง; endpoint เฉพาะ domain ต้องอยู่ใน
  `features/<name>/services/`
- หลีกเลี่ยงการ import ลึกหรือ import ข้าม feature เช่น
  `features/books` ไปใช้ไฟล์ภายใน `features/auth` โดยตรง หากต้องใช้ของร่วมกัน ให้ย้าย
  สิ่งนั้นไป `shared/` หรือส่งข้อมูลผ่าน app/provider

โปรเจกต์ยังไม่ได้ตั้ง path alias จึงใช้ relative import ให้เหมือนโค้ดปัจจุบัน เช่น
`../../services/api.js` ห้ามเริ่มใช้ `@/` จนกว่าจะตั้ง alias ใน Vite และตกลงใช้ทั้งโปรเจกต์

## รูปแบบของหนึ่งฟีเจอร์

ตัวอย่างฟีเจอร์จัดการหนังสือ (`books`) ที่มีหน้า list และ form:

```text
src/features/books/
├── pages/
│   ├── BookListPage.jsx            # page/container ที่ router render
│   └── BookFormPage.jsx
├── components/
│   ├── BookTable.jsx               # UI ย่อยของ books เท่านั้น
│   └── BookForm.jsx
├── services/
│   └── booksApi.js                 # listBooks, createBook, updateBook, ...
├── hooks/
│   └── useBooks.js                 # loading/error/data และ event ของหน้า
└── store/
    └── booksStore.js               # ใส่เมื่อ state ของ books ต้องแชร์จริง
```

สร้างเฉพาะโฟลเดอร์/ไฟล์ที่ฟีเจอร์ใช้จริง ไม่ต้องสร้างทุกไฟล์เพียงเพื่อให้
โครงสร้างครบ หาก UI ของ `BookTable` ต่อมาถูกใช้ในหลาย domain ให้แยกเป็น
generic `DataTable` ที่ `shared/components/` และส่ง column/data ผ่าน props แทน

### หน้าที่ของแต่ละชั้น

| ชั้น | ควรมี | ไม่ควรมี |
| --- | --- | --- |
| `pages` | การจัดวางหน้า, เรียก hook, เชื่อม route params | JSX ยาวมากหรือ `fetch` กระจายเต็มหน้า |
| `components` | presentational UI และ callback ผ่าน props | ความรู้เรื่อง endpoint หรือ global state โดยไม่จำเป็น |
| `hooks` | lifecycle, loading/error, การรวม logic ของหน้า | component ที่ render JSX จำนวนมาก |
| `services` | ฟังก์ชันเรียก endpoint และแปลง request/response ของ feature | การจัดการ DOM หรือ notification ของ UI |
| `store` | state ที่ต้องแชร์หลาย component/page ใน feature | state ชั่วคราวของ input เพียงตัวเดียว |

## ขั้นตอนเพิ่มฟีเจอร์

1. **กำหนด domain และ route** — ตั้งชื่อ folder เป็น kebab-case เช่น `book-loans`,
   แต่ชื่อ React component เป็น PascalCase เช่น `BookLoanListPage` และ function/hook
   เป็น camelCase เช่น `useBookLoans`.
2. **สร้าง feature module** — copy โครงจาก `features/template/` แล้วเก็บทุกอย่างที่
   เฉพาะฟีเจอร์ไว้ภายใน module นั้น.
3. **เขียน service ก่อน UI** — รวมทุก endpoint ไว้ใน `services/<feature>Api.js` และให้
   service เรียกผ่าน `apiRequest()` แทนการใช้ `fetch` ตรงจาก page/component.
4. **เขียน hook สำหรับ async state** — hook ต้องมีสถานะ `loading`, `error`, `data` ตาม
   ความจำเป็น พร้อมจัดการ `try/catch/finally`; page มีหน้าที่เรียก hook และส่ง props
   ลง component.
5. **แยก component เมื่อมีความหมายของ UI ชัดเจน** — component ที่รับผิดชอบคนละส่วนของ
   หน้าควรอยู่คนละไฟล์ และรับ input/output ผ่าน props ไม่ดึง state จาก page แบบซ่อน ๆ.
6. **เชื่อม route และ layout** — เพิ่ม route definition ใน `app/router/` แล้วเลือกครอบ
   `MainLayout` หรือ `AuthLayout` ตามสิทธิ์การเข้าถึง. ขณะนี้ยังไม่มี router package;
   ให้เพิ่มและตั้งจุดกลางนี้ก่อนสร้างหน้าที่ต้องเข้าผ่าน URL.
7. **เลือก state ให้เล็กที่สุด** — ใช้ `useState` สำหรับ state ภายใน component, hook
   สำหรับ state ของหน้า, feature store สำหรับ state ร่วมใน feature และ `src/store/`
   เฉพาะ state ที่แชร์ข้าม feature. อย่าเพิ่ม state library เพียงเพื่อเก็บ form state เล็ก ๆ.
8. **ทดสอบและตรวจคุณภาพ** — รัน `npm run lint` และ `npm run build` ใน `frontend/`
   ก่อนส่งงาน รวมถึงทดสอบ loading, error, empty data และ success path ด้วยตนเอง.

## แนวทางการเรียก API

กำหนดรูปแบบของ HTTP client ให้ตายตัวก่อนมี endpoint หลายชุด ปัจจุบัน `apiRequest()`
คืน `Response` ดังนั้น service ของฟีเจอร์ต้องตรวจ `response.ok` และ parse JSON อย่าง
สม่ำเสมอ หรือปรับ `api.js` เพียงครั้งเดียวให้ทำสองงานนี้แล้วให้ทุก feature รับ data
เหมือนกัน อย่าผสมทั้งสองรูปแบบในโปรเจกต์เดียว

ตัวอย่าง service โดยคงพฤติกรรมปัจจุบันของ `apiRequest()`:

```jsx
// src/features/books/services/booksApi.js
import { apiRequest } from '../../../services/api.js'

export async function listBooks() {
  const response = await apiRequest('/api/books')

  if (!response.ok) {
    throw new Error('ไม่สามารถโหลดรายการหนังสือได้')
  }

  return response.json()
}

export async function createBook(book) {
  const response = await apiRequest('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })

  if (!response.ok) {
    throw new Error('ไม่สามารถเพิ่มหนังสือได้')
  }

  return response.json()
}
```

เมื่อมีการ login ให้ย้าย logic แนบ token, parse response, และ mapping ข้อผิดพลาดที่ทุก
endpoint ใช้ร่วมกันไปไว้ใน `src/services/api.js` เท่านั้น ไม่ทำซ้ำในทุก service ของ feature

สร้างไฟล์ `.env.local` ใน `frontend/` เมื่อต้องเปลี่ยน backend URL:

```env
VITE_API_URL=http://localhost:3000
```

Vite เปิดเผยเฉพาะตัวแปรที่ขึ้นต้นด้วย `VITE_` ไปยัง browser จึงห้ามใส่ secret เช่น
database password หรือ API private key ในไฟล์นี้

## UI, CSS และ assets

- ใช้ Ant Design สำหรับ control มาตรฐานก่อนสร้าง button, modal หรือ table ใหม่
- ใช้ `shared/components/` เฉพาะ wrapper/component ที่ reuse ได้จริงและมี API ผ่าน props
- `index.css` เก็บ reset, CSS variables และกติกาทั่วทั้งแอปเท่านั้น ไม่ใส่ style เฉพาะหน้า
- style ของหน้า/feature ให้วางใกล้ JSX เช่น `BookListPage.css` แล้ว import จาก page;
  `App.css` ควรเหลือเฉพาะ style ของ app shell เมื่อเลิกใช้หน้า Vite ตัวอย่าง
- ชื่อ class ควรมีขอบเขตของ component เช่น `book-list__toolbar`; หลีกเลี่ยง selector ID
  ระดับ global สำหรับ feature ใหม่
- asset ที่ import เข้า bundle อยู่ใน `src/assets/`; ไฟล์ที่ต้องอ้างด้วย URL ตายตัวอยู่ใน
  `public/`
- ทุก image ที่สื่อความหมายต้องมี `alt` ที่อธิบายได้; ถ้าเป็นตกแต่งเท่านั้นใช้ `alt=""`

## Router, providers และ authentication

เมื่อเริ่มใช้งาน routing ให้เก็บการประกาศ route ทั้งหมดใน `app/router/` และให้ `App.jsx`
render router ตัวเดียว ไม่ให้แต่ละ feature แก้ `App.jsx` เป็นหน้า ๆ โดยตรง ส่วน provider
ระดับแอป เช่น `ConfigProvider` ของ Ant Design และ `AuthProvider` อยู่ใน `app/providers/`
และถูกประกอบไว้ใกล้ root

`MainLayout` และ `AuthLayout` มีอยู่แล้วในฐานะ shell ขั้นต่ำ ให้เพิ่ม header/sidebar หรือ
anonymous-page shell เข้าไฟล์เหล่านี้แทนการคัดลอกโครง layout ไปทุก page. Route ที่ต้อง
login ควรตรวจสิทธิ์ใน route guard กลาง ไม่ตรวจซ้ำในทุก component

## กติกาก่อน merge

- ไม่มี `fetch()` ตรงใน page/component
- ไม่มี endpoint เฉพาะ feature ใน `src/services/api.js`
- ไม่มี component ที่ผูกกับ domain ถูกย้ายไป `shared/` ก่อนมีการใช้ซ้ำจริง
- ไม่มี import ข้าม feature แบบลึก
- ไม่มี secret ในตัวแปร `VITE_*`
- รัน `npm run lint` และ `npm run build` ผ่าน

## คำสั่งที่ใช้บ่อย

```bash
cd frontend
npm run dev      # เปิด Vite development server
npm run lint     # ตรวจ rules ของ React/Oxc
npm run build    # สร้าง production build
npm run preview  # เปิดดู production build ในเครื่อง
```

Dockerfile จะ build frontend แล้วเสิร์ฟผ่าน Nginx และ `nginx.conf` มี SPA fallback
ไปที่ `index.html` อยู่แล้ว ดังนั้นเมื่อเพิ่ม client-side routes ไม่จำเป็นต้องแก้ config
นี้ เว้นแต่มีข้อกำหนดเรื่อง path/base URL ใหม่
