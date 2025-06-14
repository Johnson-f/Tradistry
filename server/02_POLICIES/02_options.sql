-- Enable row level security
ALTER TABLE option_table ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow user to read their own option entries" ON option_table;
DROP POLICY IF EXISTS "Allow user to insert their own option entries" ON option_table;
DROP POLICY IF EXISTS "Allow user to update their own option entries" ON option_table;
DROP POLICY IF EXISTS "Allow user to delete their own option entries" ON option_table;
DROP POLICY IF EXISTS "Allow user to subscribe to realtime updates" ON option_table;

-- Select: allow users to read their own entries
CREATE POLICY "Allow user to read their own option entries" ON option_table FOR SELECT
USING (user_id = auth.uid());

-- Insert: only allow user inserting their own entries
CREATE POLICY "Allow user to insert their own option entries" ON option_table FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Update: only allow authenticated users updating their own entries (with both USING and WITH CHECK)
CREATE POLICY "Allow user to update their own option entries" ON option_table FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Delete: only allow deleting their own entries
CREATE POLICY "Allow user to delete their own option entries" ON option_table FOR DELETE
USING (user_id = auth.uid());

-- Remove the duplicate SELECT policy for realtime (the first SELECT policy already handles this)
-- The realtime functionality will work with the existing SELECT policy

-- Enable realtime for the table (Supabase specific) - Handle if already exists
DO $$
BEGIN
    -- Try to add the table to the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE option_table;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table is already in the publication, so we can ignore this error
        RAISE NOTICE 'Table option_table is already in supabase_realtime publication';
END $$;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON option_table TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;