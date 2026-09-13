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


-- 3. BOOK TYPE
CREATE TABLE IF NOT EXISTS book_type (
    type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL
);


-- 4. AUTHOR
CREATE TABLE IF NOT EXISTS author (
    author_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    author_pen_name VARCHAR(255)
);


-- 5. BOOK
CREATE TABLE IF NOT EXISTS book (
    book_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    category_id BIGINT,
    type_id BIGINT,
    author_id BIGINT,

    book_name VARCHAR(255) NOT NULL,
    book_date DATE,
    book_totalpage INTEGER,
    book_file TEXT,

    CONSTRAINT fk_book_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_book_type
        FOREIGN KEY (type_id)
        REFERENCES book_type(type_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_book_author
        FOREIGN KEY (author_id)
        REFERENCES author(author_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_book_totalpage
        CHECK (book_totalpage IS NULL OR book_totalpage >= 0)
);


-- 6. HISTORY
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


-- 7. SHELF
CREATE TABLE IF NOT EXISTS shelf (
    shelf_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    shelf_name VARCHAR(255) NOT NULL,
    shelf_limit INTEGER,
    shelf_color VARCHAR(100),
    shelf_material VARCHAR(100),

    CONSTRAINT chk_shelf_limit
        CHECK (shelf_limit IS NULL OR shelf_limit >= 0)
);


-- 8. SHELF FLOOR
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


-- 9. ALERT
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
