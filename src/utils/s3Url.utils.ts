// utils/s3Url.utils.ts

const S3_BASE_URL = "https://pointz-files.s3.ap-south-1.amazonaws.com/";

export const IMAGE_SIZES = [150, 300, 720, 900, 1080, 1296] as const;

/**
 * Construct full S3 image URL with size
 * @param baseKey - Base key like "images/uuid"
 * @param size - Image size (150, 300, 400, etc.)
 * @returns Full S3 URL like "https://bucket.s3.region.amazonaws.com/images/uuid_400.webp"
 */
export const getImageUrl = (
  baseKey: string,
  size: (typeof IMAGE_SIZES)[number] = 300
): string => {
  if (!baseKey) return "";
  return `${S3_BASE_URL}${baseKey}_${size}.webp`;
};

/**
 * Construct full S3 audio URL
 * @param baseKey - Base key like "audios/uuid.mp3"
 * @returns Full S3 URL like "https://bucket.s3.region.amazonaws.com/audios/uuid.mp3"
 */
export const getAudioUrl = (baseKey: string): string => {
  if (!baseKey) return "";
  return `${S3_BASE_URL}${baseKey}`;
};

/**
 * Construct full S3 video URL
 * @param baseKey - Base key like "videos/uuid.mp4"
 * @returns Full S3 URL like "https://bucket.s3.region.amazonaws.com/videos/uuid.mp4"
 */
export const getVideoUrl = (baseKey: string): string => {
  if (!baseKey) return "";
  return `${S3_BASE_URL}${baseKey}`;
};

/**
 * Get multiple image URLs for different sizes (for srcset/responsive images)
 * @param baseKey - Base key like "images/uuid"
 * @returns Object with all size URLs
 */
export const getImageUrlSet = (baseKey: string) => {
  return IMAGE_SIZES.reduce(
    (acc, size) => {
      acc[size] = getImageUrl(baseKey, size);
      return acc;
    },
    {} as Record<number, string>
  );
};
