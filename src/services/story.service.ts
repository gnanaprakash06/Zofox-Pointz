import { axiosInstance } from "@/lib/axiosInstance";

// Story item
export interface StoryType {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  titlePhoto: string;
  photos: string[];
  audio: string | null;
  video: string | null;
  listensCount: number;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  __v: number;
}

type ModifiedStoryType = Omit<StoryType, "tags"> & {
  tags: string;
};

export interface StoryCreateType {
  title: string;
  description: string;
  category: string;
  tags: string;
  titlePhoto: string;
  photos: string[]; // Empty when video is present
  audio?: string; // Present with titlePhoto and photos
  video?: string; // Present alone (photos should be empty)
}

// Meta -> Pagination only
export interface metaDataType {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type StoryParamsType = {
  search?: string;
  category?: string;
  status?: "active" | "inactive";
  page?: number | string;
  limit?: number | string;
  sortBy?: "createdAt" | "listensCount" | "title";
  sortOrder?: "asc" | "desc";
};

export const fetchAllStories = async (filters: StoryParamsType) => {
  const response = await axiosInstance.get("/stories/", {
    params: filters,
  });

  return {
    stories: response.data.data,
    metaData: response.data.meta,
  } as {
    stories: StoryType[];
    metaData: metaDataType;
  };
};

export const fetchStoryById = async (_id: string) => {
  const response = await axiosInstance.get(`/stories/${_id}`);
  return response.data.data as ModifiedStoryType;
};

export const createStory = async (storyData: StoryCreateType) => {
  // Validation: Only audio OR video, not both
  if (storyData.audio && storyData.video) {
    throw new Error("Cannot have both audio and video. Choose one.");
  }

  // Validation: If video, photos should be empty
  if (storyData.video && storyData.photos.length > 0) {
    throw new Error("Photos array must be empty when video is present.");
  }

  // Validation: If audio, titlePhoto and photos must be present
  if (
    storyData.audio &&
    (!storyData.titlePhoto || storyData.photos.length === 0)
  ) {
    throw new Error(
      "titlePhoto and photos are required when audio is present."
    );
  }

  const response = await axiosInstance.post("/stories/", storyData);
  return response.data.data as StoryType;
};

export const updateStory = async (_id: string, storyData: StoryCreateType) => {
  // Same validations as create
  if (storyData.audio && storyData.video) {
    throw new Error("Cannot have both audio and video. Choose one.");
  }

  if (storyData.video && storyData.photos.length > 0) {
    throw new Error("Photos array must be empty when video is present.");
  }

  if (
    storyData.audio &&
    (!storyData.titlePhoto || storyData.photos.length === 0)
  ) {
    throw new Error(
      "titlePhoto and photos are required when audio is present."
    );
  }

  const response = await axiosInstance.put(`/stories/${_id}`, storyData);
  return response.data.data as StoryType;
};

export const deleteStory = async (_id: string) => {
  const response = await axiosInstance.delete(`/stories/${_id}`);
  return response.data.data as StoryType;
};
