
import fs from 'fs';

/**
 * Uploads a file to Meta to get a handle for template examples.
 * Uses the Resumable Upload API.
 * 
 * @param {Object} file - The file object from multer (buffer, mimetype, size, originalname)
 * @returns {Promise<string>} - The file handle (h)
 */
export const uploadToMeta = async (file) => {
  const { META_ACCESS_TOKEN, META_APP_ID, META_VERSION = 'v18.0' } = process.env;

  if (!META_APP_ID) {
    throw new Error("META_APP_ID is missing in .env. It is required for media uploads.");
  }

  // 1. Start Upload Session
  const sessionUrl = `https://graph.facebook.com/${META_VERSION}/${META_APP_ID}/uploads` +
    `?file_length=${file.size}` +
    `&file_type=${file.mimetype}` +
    `&access_token=${META_ACCESS_TOKEN}`;

  console.log(`Starting upload session for ${file.originalname}...`);

  const sessionResponse = await fetch(sessionUrl, { method: 'POST' });
  const sessionData = await sessionResponse.json();

  if (!sessionData.id) {
    throw new Error(`Failed to start upload session: ${JSON.stringify(sessionData)}`);
  }

  const uploadId = sessionData.id;

  // 2. Upload File Content
  const uploadUrl = `https://graph.facebook.com/${META_VERSION}/${uploadId}`;
  
  console.log(`Uploading content to ${uploadUrl}...`);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `OAuth ${META_ACCESS_TOKEN}`, // OAuth prefix is sometimes required/safer here
      'file_offset': '0'
    },
    body: file.buffer // Sending buffer directly
  });

  const uploadData = await uploadResponse.json();

  if (!uploadData.h) {
    throw new Error(`Failed to upload file content: ${JSON.stringify(uploadData)}`);
  }

  console.log(`Upload successful. Handle: ${uploadData.h}`);
  return uploadData.h;
};
