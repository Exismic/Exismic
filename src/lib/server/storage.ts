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
  if (error && (error.message.includes("does not exist") || error.message.includes("not found") || error.message.includes("Bucket not found"))) {
    console.log(`[Storage] Bucket '${bucketName}' does not exist or was not found. Programmatically creating it...`);
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

/**
 * Deletes a file from Supabase Storage by its file path or public URL.
 */
export async function deleteStorageFile(fileUrlOrName: string): Promise<boolean> {
  try {
    const bucketName = "results";
    let fileName = fileUrlOrName;

    if (fileUrlOrName.includes("/storage/v1/object/public/results/")) {
      fileName = fileUrlOrName.split("/storage/v1/object/public/results/")[1];
    } else if (fileUrlOrName.includes("/results/")) {
      fileName = fileUrlOrName.split("/results/")[1];
    }

    if (!fileName) return false;

    // Clean any query params
    fileName = fileName.split("?")[0];

    const { error } = await supabaseAdmin.storage.from(bucketName).remove([fileName]);
    if (error) {
      console.warn(`[Storage] Failed to delete ${fileName} from Supabase:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Storage] Exception deleting file:", err);
    return false;
  }
}
