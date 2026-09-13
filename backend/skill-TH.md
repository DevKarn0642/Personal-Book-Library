---
name: personal-book-library-backend-th
description: แนวทางการสร้างหรือแก้ไข Backend API ของ Personal Book Library สำหรับ Express, PostgreSQL และการทดสอบใน backend/.
---

# กติกา Backend ของ Personal Book Library

ใช้กติกานี้กับทุกการเปลี่ยนแปลงภายใน `backend/` แยก API เป็นชั้นย่อยที่มี
หน้าที่ชัดเจน แล้วประกอบทุกชั้นเข้าด้วยกันใน `app.js`

## เทคโนโลยีและจุดเริ่มต้น

- Backend ใช้ Node.js, Express 5, CommonJS, `pg` และ PostgreSQL ไม่เพิ่ม
  TypeScript หรือ framework ใหม่เฉพาะบาง feature
- `server.js` ทำหน้าที่โหลด environment variables, import `pool`, สร้าง app
  และเปิด HTTP server ไม่ใส่การประกอบ feature ไว้ในไฟล์นี้
- `app.js` สร้าง dependencies และ mount router ต้องคง `express.json()` ไว้ก่อน
  API routes และ `errorHandler` ไว้หลัง API routes
- `src/config/connectdb.js` เป็นเจ้าของ PostgreSQL pool โดย model รับ `pool`
  ผ่าน factory จึงไม่ import database connection ภายใน model

## หน้าที่ของแต่ละโฟลเดอร์

```text
app.js                  ประกอบ dependencies และ mount /api routers
server.js               โหลด configuration และเปิด server
src/config/             infrastructure กลาง เช่น PostgreSQL pool
src/models/             SQL แบบ parameterized และข้อมูลที่ได้จากฐานข้อมูล
src/services/           business rules และการประสานหลาย model
src/controllers/        จัดการ HTTP request/response และ status code
src/middlewares/        authentication, validation และงาน HTTP ที่ใช้ร่วมกัน
src/routes/             จับคู่ endpoint กับ middleware/controller
migrations/             schema PostgreSQL ที่ Docker Compose ใช้
test/                   API tests ด้วย Node built-in test runner
```

## โครงสร้าง feature และทิศทางการพึ่งพา

สร้าง feature แบบ CRUD ตามลำดับนี้ โดยเพิ่มเฉพาะชั้นที่ feature จำเป็นต้องใช้:

```text
pool → <domain>Model → <domain>Service → <domain>Controller → <domain>Router
                                               ↑
                              validation/authentication middleware
```

1. กำหนด API contract ก่อน: URL, HTTP method, request body, response สำเร็จ
   และกรณี `400`, `401`, `404` ที่คาดไว้
2. เพิ่ม `src/models/<domain>Model.js` และ export factory เช่น
   `createCategoryModel({ pool })`; ภายใน model มีเฉพาะ SQL
3. เพิ่ม `src/services/<domain>Service.js` และ export factory ที่รับ model;
   เก็บ business rule, การตรวจชื่อซ้ำ หรือการประสานหลาย model ไว้ที่นี่
4. เพิ่ม `src/controllers/<domain>Controller.js` และ export factory ที่รับ
   service; controller แปลงผลจาก service เป็น HTTP response และส่ง error ที่
   ไม่คาดคิดต่อด้วย `next(error)`
5. เมื่อ endpoint รับ input ให้เพิ่ม validation middleware และเก็บค่าที่
   normalize แล้วไว้ใน `req` เช่น `req.categoryInput` เพื่อไม่ให้ controller
   ต้อง parse หรือ validate ซ้ำ
6. เพิ่ม `src/routes/<domain>.js` สร้าง Express router และเรียง
   authentication, validation, controller ตามลำดับที่จะทำงาน
7. ที่ `app.js` ให้ import ทุก factory, สร้างสาย dependency จาก `pool` ไปถึง
   router แล้ว mount ไว้ใต้ `/api/...` ก่อน `errorHandler`

หาก feature มี service แล้ว controller ไม่ควร import model โดยตรง service ห้าม
เข้าถึง `req` หรือ `res` และห้ามเขียน SQL ใน controller หรือ service

## Model และ PostgreSQL

- ใช้ `pool.query(sql, values)` พร้อม `$1`, `$2` เป็นต้น ห้ามต่อ input เข้า
  SQL string โดยตรง
- ระบุ column ที่ `SELECT` หรือ `RETURNING` ให้ชัดเจน และ mutation ที่ต้อง
  ส่ง record กลับต้องมี `RETURNING`
- Query ที่ได้หลาย record ให้ return `rows`; query ที่ได้ record เดียวให้
  return `rows[0]` หากไม่มี record จะได้ `undefined` เพื่อให้ controller ตอบ
  `404` ได้
- ใช้ snake_case สำหรับชื่อในฐานข้อมูล เช่น `category_id`, `category_name`
  และใช้ camelCase สำหรับ argument/ตัวแปร JavaScript เมื่ออ่านง่ายขึ้น
- ID แบบ PostgreSQL `BIGINT` อาจเกินช่วงปลอดภัยของ JavaScript Number ให้
  validate route ID แล้วส่งต่อเป็น string เข้า `pg`

## HTTP, validation และ authentication

- Route ที่อ่านหรือแก้ไขข้อมูล library ควรใช้ `requireAuthentication`
  เว้นแต่ endpoint นั้นตั้งใจให้เป็น public โดย authentication ใช้ cookie
  ชื่อ `access_token` ไม่ใช่ token ใน request body
- Validate ชนิดข้อมูล, required value, string ที่มีแต่ช่องว่าง และความยาวตาม
  column ก่อนเรียก service รวมถึง validate route ID ก่อน query
- กำหนด response shape ให้สม่ำเสมอ เช่น record เดียวใช้ `{ category }` และ
  รายการใช้ `{ categories }`
- ใช้ `201` สำหรับการสร้างสำเร็จ การลบสำเร็จใช้ `204` เมื่อไม่ต้องมี body
  หรือใช้ `200` พร้อม acknowledgement เช่น `{ success: true }` เมื่อ API
  contract ต้องการ response; ใช้ `400` สำหรับ input ไม่ถูกต้อง, `401` สำหรับ
  ไม่ได้ยืนยันตัวตน และ `404` เมื่อไม่พบ resource
- ให้ error ที่ไม่คาดคิดส่งถึง `errorHandler` และไม่เปิดเผยรายละเอียด database
  ให้ client

## Database schema

- อ่าน `migrations/mirations.sql` ก่อนออกแบบ model เพราะเป็นแหล่งอ้างอิง
  ตาราง, column, constraint และ foreign key ของโปรเจกต์
- Docker Compose เรียกไฟล์ที่สะกดว่า `mirations.sql` โดยตรง ห้ามเปลี่ยนชื่อ
  โดยไม่แก้ Compose ด้วย
- Workflow ของ Compose ปัจจุบันรัน migration file ซ้ำได้ การเปลี่ยน schema
  จึงต้องรันซ้ำได้อย่างปลอดภัย หรือปรับ workflow migration อย่างตั้งใจในงานนั้น

## Tests และการตรวจคุณภาพ

- วาง API tests ใน `backend/test/` และใช้ `node:test` โดยดูรูปแบบจาก
  `test/login.test.js`: สร้าง app ด้วย mock `pool`, เปิด local server และ
  ตรวจพฤติกรรม HTTP ที่สังเกตได้
- ทดสอบกรณีสำเร็จ, input ไม่ถูกต้อง, ไม่ได้ login, ไม่พบข้อมูล และ database
  error เมื่อเกี่ยวข้องกับ endpoint นั้น
- หลังแก้ backend ให้รันคำสั่งจาก `backend/`:

  ```bash
  node --check app.js
  npm test
  ```

- ทำการเปลี่ยนแปลงให้เฉพาะเรื่อง ห้ามแก้ API อื่น, environment settings หรือ
  งานของผู้ใช้อื่นโดยไม่เกี่ยวข้องกับ feature ที่ทำ
