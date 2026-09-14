-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_pass VARCHAR(255) NOT NULL,
    user_date_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255) UNIQUE
);

-- Email: test@example.com | Username: testuser | Password: 123456
INSERT INTO users (user_name, user_pass, user_email)
VALUES (
    'testuser',
    '$2b$12$/9XTd1iw3tbbqNCesFfvt.vzjeDwhMXMS.vfyeGUgMXxk8vD6WTgK',
    'test@example.com'
)
ON CONFLICT (user_email) DO UPDATE
SET user_name = EXCLUDED.user_name,
    user_pass = EXCLUDED.user_pass;


-- 2. CATEGORY
CREATE TABLE IF NOT EXISTS category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);


-- 3. AUTHOR
CREATE TABLE IF NOT EXISTS author (
    author_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    author_pen_name VARCHAR(255)
);


-- 4. BOOK
CREATE TABLE IF NOT EXISTS book (
    book_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id BIGINT,
    author_id BIGINT,

    book_type VARCHAR(10) NOT NULL DEFAULT 'physical',
    book_name VARCHAR(255) NOT NULL,
    book_date DATE,
    book_totalpage INTEGER,
    book_file TEXT,
    book_cover_image TEXT,

    CONSTRAINT fk_book_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_book_author
        FOREIGN KEY (author_id)
        REFERENCES author(author_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_book_totalpage
        CHECK (book_totalpage IS NULL OR book_totalpage >= 0),

    CONSTRAINT chk_book_type
        CHECK (book_type IN ('physical', 'file'))
);

-- Upgrade databases created with the former book_type lookup table.
ALTER TABLE book DROP CONSTRAINT IF EXISTS fk_book_type;
ALTER TABLE book DROP COLUMN IF EXISTS type_id;
DROP TABLE IF EXISTS book_type;
ALTER TABLE book ADD COLUMN IF NOT EXISTS book_type VARCHAR(10);
ALTER TABLE book ADD COLUMN IF NOT EXISTS book_cover_image TEXT;
UPDATE book
SET book_type = CASE WHEN book_file IS NULL THEN 'physical' ELSE 'file' END
WHERE book_type IS NULL OR book_type NOT IN ('physical', 'file');
ALTER TABLE book ALTER COLUMN book_type SET DEFAULT 'physical';
ALTER TABLE book ALTER COLUMN book_type SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_book_type'
          AND conrelid = 'book'::regclass
    ) THEN
        ALTER TABLE book
            ADD CONSTRAINT chk_book_type
            CHECK (book_type IN ('physical', 'file'));
    END IF;
END $$;


-- 5. HISTORY
CREATE TABLE IF NOT EXISTS history (
    history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,

    history_page INTEGER DEFAULT 0,
    history_status VARCHAR(50),
    history_date_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_book
        FOREIGN KEY (book_id)
        REFERENCES book(book_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_history_page
        CHECK (history_page >= 0)
);


-- 6. SHELF
CREATE TABLE IF NOT EXISTS shelf (
    shelf_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    shelf_name VARCHAR(255) NOT NULL,
    shelf_limit INTEGER,
    shelf_color VARCHAR(100),
    shelf_material VARCHAR(100),

    CONSTRAINT chk_shelf_limit
        CHECK (shelf_limit IS NULL OR shelf_limit >= 0)
);


-- 7. SHELF FLOOR
CREATE TABLE IF NOT EXISTS shelf_floor (
    shelf_floor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    shelf_id BIGINT NOT NULL,
    shelf_floor_limit INTEGER,
    shelf_floor INTEGER NOT NULL,

    book_id BIGINT,
    category_id BIGINT,

    CONSTRAINT fk_shelf_floor_shelf
        FOREIGN KEY (shelf_id)
        REFERENCES shelf(shelf_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shelf_floor_book
        FOREIGN KEY (book_id)
        REFERENCES book(book_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_shelf_floor_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_shelf_floor
        CHECK (shelf_floor > 0),

    CONSTRAINT chk_shelf_floor_limit
        CHECK (
            shelf_floor_limit IS NULL
            OR shelf_floor_limit >= 0
        )
);


-- 8. ALERT
CREATE TABLE IF NOT EXISTS alert (
    alert_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    alert_repeat_type VARCHAR(50),
    alert_date DATE,
    alert_status BOOLEAN NOT NULL DEFAULT TRUE,
    alert_time TIME,

    user_id BIGINT NOT NULL,
    book_id BIGINT,

    CONSTRAINT fk_alert_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_alert_book
        FOREIGN KEY (book_id)
        REFERENCES book(book_id)
        ON DELETE CASCADE
);


-- 9. DEMO DATA
-- These inserts intentionally exclude history. Every statement can be run again
-- without creating duplicate sample records.

INSERT INTO category (category_name)
SELECT seed.category_name
FROM (
    VALUES
        ('นวนิยาย'),
        ('พัฒนาตนเอง'),
        ('เทคโนโลยี'),
        ('ประวัติศาสตร์'),
        ('วิทยาศาสตร์')
) AS seed(category_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM category existing_category
    WHERE existing_category.category_name = seed.category_name
);

INSERT INTO author (author_name, author_pen_name)
SELECT seed.author_name, seed.author_pen_name
FROM (
    VALUES
        ('J.K. Rowling', NULL),
        ('Matt Haig', NULL),
        ('James Clear', NULL),
        ('Robert C. Martin', 'Uncle Bob'),
        ('Yuval Noah Harari', NULL),
        ('Stephen Hawking', NULL),
        ('Marijn Haverbeke', NULL),
        ('Jane Austen', NULL)
) AS seed(author_name, author_pen_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM author existing_author
    WHERE existing_author.author_name = seed.author_name
);

WITH seed_books (
    category_name,
    author_name,
    book_type,
    book_name,
    book_date,
    book_totalpage,
    book_file,
    book_cover_image
) AS (
    VALUES
        (
            'นวนิยาย',
            'J.K. Rowling',
            'physical',
            'Harry Potter and the Philosopher''s Stone',
            '1997-06-26',
            223,
            NULL,
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'นวนิยาย',
            'Matt Haig',
            'physical',
            'The Midnight Library',
            '2020-08-13',
            304,
            NULL,
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'พัฒนาตนเอง',
            'James Clear',
            'physical',
            'Atomic Habits',
            '2018-10-16',
            320,
            NULL,
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'เทคโนโลยี',
            'Robert C. Martin',
            'physical',
            'Clean Code',
            '2008-08-01',
            464,
            NULL,
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'ประวัติศาสตร์',
            'Yuval Noah Harari',
            'physical',
            'Sapiens',
            '2011-01-01',
            443,
            NULL,
            'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'วิทยาศาสตร์',
            'Stephen Hawking',
            'physical',
            'A Brief History of Time',
            '1988-04-01',
            256,
            NULL,
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'เทคโนโลยี',
            'Marijn Haverbeke',
            'file',
            'Eloquent JavaScript',
            '2018-12-04',
            472,
            'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
        ),
        (
            'นวนิยาย',
            'Jane Austen',
            'file',
            'Pride and Prejudice',
            '1813-01-28',
            432,
            'https://www.gutenberg.org/files/1342/1342-pdf.pdf',
            'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80'
        )
)
INSERT INTO book (
    category_id,
    author_id,
    book_type,
    book_name,
    book_date,
    book_totalpage,
    book_file,
    book_cover_image
)
SELECT
    category.category_id,
    author.author_id,
    seed.book_type,
    seed.book_name,
    seed.book_date::DATE,
    seed.book_totalpage,
    seed.book_file,
    seed.book_cover_image
FROM seed_books seed
JOIN category ON category.category_name = seed.category_name
JOIN author ON author.author_name = seed.author_name
WHERE NOT EXISTS (
    SELECT 1
    FROM book existing_book
    WHERE existing_book.book_name = seed.book_name
);

INSERT INTO shelf (shelf_name, shelf_limit, shelf_color, shelf_material)
SELECT seed.shelf_name, seed.shelf_limit, seed.shelf_color, seed.shelf_material
FROM (
    VALUES
        ('ชั้น A', 24, 'สีน้ำเงิน', 'ไม้โอ๊ก'),
        ('ชั้น B', 30, 'สีเขียว', 'ไม้บีช'),
        ('ชั้น C', 12, 'สิม่วง', 'เหล็ก')
) AS seed(shelf_name, shelf_limit, shelf_color, shelf_material)
WHERE NOT EXISTS (
    SELECT 1
    FROM shelf existing_shelf
    WHERE existing_shelf.shelf_name = seed.shelf_name
);

WITH seed_shelf_floors (
    shelf_name,
    shelf_floor_limit,
    shelf_floor,
    book_name,
    category_name
) AS (
    VALUES
        ('ชั้น A', 12, 1, 'Harry Potter and the Philosopher''s Stone', 'นวนิยาย'),
        ('ชั้น A', 12, 2, 'The Midnight Library', 'นวนิยาย'),
        ('ชั้น A', 12, 3, 'Pride and Prejudice', 'นวนิยาย'),
        ('ชั้น B', 10, 1, 'Atomic Habits', 'พัฒนาตนเอง'),
        ('ชั้น B', 10, 2, 'Sapiens', 'ประวัติศาสตร์'),
        ('ชั้น B', 10, 3, 'A Brief History of Time', 'วิทยาศาสตร์'),
        ('ชั้น B', 10, 4, 'Clean Code', 'เทคโนโลยี'),
        ('ชั้น C', 12, 1, 'Eloquent JavaScript', 'เทคโนโลยี')
)
INSERT INTO shelf_floor (
    shelf_id,
    shelf_floor_limit,
    shelf_floor,
    book_id,
    category_id
)
SELECT
    shelf.shelf_id,
    seed.shelf_floor_limit,
    seed.shelf_floor,
    book.book_id,
    category.category_id
FROM seed_shelf_floors seed
JOIN shelf ON shelf.shelf_name = seed.shelf_name
JOIN book ON book.book_name = seed.book_name
JOIN category ON category.category_name = seed.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM shelf_floor existing_floor
    WHERE existing_floor.shelf_id = shelf.shelf_id
      AND existing_floor.book_id = book.book_id
);

INSERT INTO alert (
    alert_repeat_type,
    alert_date,
    alert_status,
    alert_time,
    user_id,
    book_id
)
SELECT
    'weekly',
    '2026-12-31',
    TRUE,
    '19:00',
    library_user.user_id,
    book.book_id
FROM users library_user
JOIN book ON book.book_name = 'Atomic Habits'
WHERE library_user.user_email = 'test@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM alert existing_alert
      WHERE existing_alert.user_id = library_user.user_id
        AND existing_alert.book_id = book.book_id
        AND existing_alert.alert_repeat_type = 'weekly'
  );
