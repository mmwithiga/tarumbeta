# Supabase Storage Bucket Setup Instructions

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure the bucket:
   - **Name**: `instrument-images`
   - **Public bucket**: ✅ **Check this** (images need to be publicly accessible)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave default or add: `image/jpeg, image/png, image/webp`
6. Click **"Create bucket"**

## Step 2: Set Storage Policies

After creating the bucket, set up the following policies:

### Policy 1: Allow Authenticated Users to Upload
```sql
-- Go to Storage > Policies > New Policy
-- Policy name: Allow authenticated users to upload
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'instrument-images');
```

### Policy 2: Allow Public Read Access
```sql
-- Policy name: Allow public to read
-- Allowed operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public to read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'instrument-images');
```

### Policy 3: Allow Users to Update Their Own Images
```sql
-- Policy name: Allow users to update own images
-- Allowed operation: UPDATE
-- Target roles: authenticated

CREATE POLICY "Allow users to update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'instrument-images' AND auth.uid()::text = owner);
```

### Policy 4: Allow Users to Delete Their Own Images
```sql
-- Policy name: Allow users to delete own images
-- Allowed operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow users to delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'instrument-images' AND auth.uid()::text = owner);
```

## Step 3: Verify Setup

1. Go to **Storage > instrument-images**
2. Try uploading a test image manually
3. Check that the image is publicly accessible
4. Delete the test image

## Once Complete

Let me know when you've created the bucket, and I'll proceed with updating the frontend code to handle image uploads!
