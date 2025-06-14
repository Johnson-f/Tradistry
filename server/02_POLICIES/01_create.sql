-- Enable row level security
ALTER TABLE entry_table ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow user to read their own journal entries" ON entry_table;
DROP POLICY IF EXISTS "Allow user to insert their own journal entries" ON entry_table;
DROP POLICY IF EXISTS "Allow user to update their own journal entries" ON entry_table;
DROP POLICY IF EXISTS "Allow user to delete their own journal entries" ON entry_table;
DROP POLICY IF EXISTS "Allow user to subscribe to realtime updates" on entry_table;

-- Select: allow users to read their own entries
CREATE POLICY "Allow user to read their own journal entries"
ON entry_table
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert: only allow inserting their own entries
CREATE POLICY "Allow user to insert their own journal entries"
ON entry_table
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Update: only allow updating their own entries (with both USING and WITH CHECK)
CREATE POLICY "Allow user to update their own journal entries"
ON entry_table
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Delete: only allow deleting their own entries
CREATE POLICY "Allow user to delete their own journal entries"
ON entry_table
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Realtime: only allow auth users to subscribe to realtime updates 
CREATE POLICY "Allow user to subscribe to realtime updates"
ON entry_table
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for the table (Supabase specific)
ALTER PUBLICATION supabase_realtime ADD TABLE entry_table;

-- Grant necessary permission to authenticated user
GRANT SELECT, INSERT, UPDATE, DELETE ON entry_table TO authenticated;
GRANT USAGE ON SCHEMA public to authenticated;