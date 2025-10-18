-- Enable realtime for study_sessions table
ALTER TABLE study_sessions REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;