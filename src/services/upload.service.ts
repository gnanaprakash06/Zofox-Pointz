import { axiosInstance } from "@/lib/axiosInstance";

export type UploadMediaResponse = {
  photos: string[]; // Array of photo URLs
  audio: string; // Single audio URL
  video: string; // Single video URL
};

type UploadMediaParams = {
  photos?: File[] | null;
  audio?: File | null;
  video?: File | null;
};

export const uploadMedia = async ({
  photos,
  audio,
  video,
}: UploadMediaParams): Promise<UploadMediaResponse> => {
  const formData = new FormData();

  // Append multiple photos with validation
  if (photos && photos.length > 0) {
    if (photos.length > 10) {
      return Promise.reject(new Error("You can upload up to 10 photos."));
    }

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });
  }

  if (audio) {
    formData.append("audio", audio);
  }

  if (video) {
    formData.append("video", video);
  }

  const response = await axiosInstance.post("/media/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data as UploadMediaResponse;
};
