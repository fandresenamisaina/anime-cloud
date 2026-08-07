CREATE TABLE IF NOT EXISTS episodes (
    id SERIAL,
    season_id INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255),
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    subtitle_url TEXT,
    duration_seconds INTEGER,
    uploaded_by INTEGER,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (season_id, episode_number),
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL,
    user_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id, series_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL,
    series_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (series_id, season_number),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS series (
    id SERIAL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    genre VARCHAR(100),
    added_by INTEGER,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    google_id VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (email),
    UNIQUE (google_id),
    UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL,
    user_id INTEGER NOT NULL,
    episode_id INTEGER NOT NULL,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    last_watched_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id, episode_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL,
    user_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id, series_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

