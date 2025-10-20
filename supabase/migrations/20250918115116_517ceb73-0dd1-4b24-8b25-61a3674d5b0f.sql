-- Create storage bucket for CVs (fixed version)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs', 
  'cvs', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
);

-- Create RLS policies for CV uploads (fixed version)
CREATE POLICY "Users can view CVs they have access to"
ON storage.objects FOR SELECT
USING (bucket_id = 'cvs');

CREATE POLICY "Authenticated users can upload CVs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cvs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update CVs they uploaded"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete CVs they uploaded"
ON storage.objects FOR DELETE
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);