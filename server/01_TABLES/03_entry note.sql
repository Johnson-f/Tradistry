CREATE TABLE notes_entry (
    id SERIAL PRIMARY KEY, -- Auto-incrementing primary KEY
    user_id UUID NOT NULL, -- Foreign ley to user table (auth)
    -- Notes table
)
