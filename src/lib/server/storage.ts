import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Uploads a processed buffer to Supabase Storage and returns the public CDN URL.
 * Automatically handles bucket creation if it doesn't exist yet.
 */
export async function uploadProcessedFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const bucketName = "results";

  // 1. Try uploading to the bucket
  const { error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  // 2. If the bucket doesn't exist, create it and retry upload
  if (error && error.message.includes("does not exist")) {
    console.log(`[Storage] Bucket '${bucketName}' does not exist. Programmatically creating it...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
    });
    
    if (createError) {
      throw new Error(`Failed to create Supabase storage bucket: ${createError.message}`);
    }

    // Retry upload in the newly created bucket
    const retryResult = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });
    
    if (retryResult.error) {
      throw new Error(`Failed to upload to Supabase storage after creating bucket: ${retryResult.error.message}`);
    }
  } else if (error) {
    throw new Error(`Failed to upload to Supabase storage: ${error.message}`);
  }

  // 3. Generate and return the public URL
  const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName);
  if (!urlData?.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded file.");
  }

  return urlData.publicUrl;
}
