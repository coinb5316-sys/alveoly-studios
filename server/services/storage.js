import cloudinary from '../config/cloudinary.js';

/**
 * Upload a temporary URL (from BytePlus) to Cloudinary.
 * @param {string} sourceUrl - temporary BytePlus URL
 * @param {'image' | 'video'} resourceType
 * @returns {Promise<string>} permanent Cloudinary URL
 */
export async function uploadToCloudinary(sourceUrl, resourceType = 'image') {
  const result = await cloudinary.uploader.upload(sourceUrl, {
    resource_type: resourceType,
    folder: 'alveoly_studios',
  });

  return result.secure_url;
}