-- Add foreign key constraints from conversations to profiles table
ALTER TABLE conversations
ADD CONSTRAINT conversations_participant1_id_fkey 
FOREIGN KEY (participant1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations
ADD CONSTRAINT conversations_participant2_id_fkey 
FOREIGN KEY (participant2_id) REFERENCES profiles(id) ON DELETE CASCADE;