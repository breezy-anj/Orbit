CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    google_access_token TEXT,
    google_refresh_token TEXT,
    calendar_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    last_met TIMESTAMP WITH TIME ZONE,
    interests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    CONSTRAINT valid_time CHECK (end_time > start_time)
);

CREATE TABLE meetups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'pending_request', 'declined')),
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    requested_at TIMESTAMP WITH TIME ZONE,
    gcal_event_id TEXT
);

CREATE TABLE meetup_participants (
    meetup_id UUID REFERENCES meetups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    PRIMARY KEY (meetup_id, user_id)
);
