# Personal Book Library

## รันด้วย Docker Compose

เปิด Docker Desktop แล้วรันจากโฟลเดอร์โปรเจกต์:

```sh
docker compose up -d --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000 (ยังไม่มี API routes)
- PostgreSQL: localhost:5432, database `book_library`, user `bookuser`, password `123456`

Compose จะรอฐานข้อมูลพร้อม แล้วให้ service `migrate` รัน
`backend/migrations/run.sql` เพื่อสร้าง schema จาก `mirations.sql`
ก่อนเริ่ม backend โดยบันทึกเวอร์ชันใน `schema_migrations` และข้ามเวอร์ชันที่รันแล้ว
การ migration อยู่ใน transaction เดียว หาก SQL ผิดพลาดจะ rollback และ backend จะไม่เริ่ม
service `migrate` จบด้วยสถานะ `Exited (0)` เมื่อสำเร็จ ถือเป็นปกติ

```sh
docker compose ps -a
docker compose logs migrate
```

ข้อมูลเก็บใน volume `postgres_data` และยังอยู่หลัง `docker compose down`
รองรับ volume เดิมที่ยังไม่มีตารางของแอปด้วย หากเคยสร้างตารางด้วยตนเองแล้วแต่ไม่มี
บันทึก migration จะหยุดเมื่อพบตารางซ้ำ ต้องตรวจเทียบ schema ก่อนบันทึก baseline
โดยไม่ลบข้อมูลเดิม

หากเพิ่มการเปลี่ยน schema ภายหลัง ให้เพิ่มไฟล์ SQL และเงื่อนไขเวอร์ชันใหม่ใน
`run.sql` อย่าแก้ migration ที่รันแล้ว จากนั้นรัน:

```sh
docker compose run --rm migrate
```
