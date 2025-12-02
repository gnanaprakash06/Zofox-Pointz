// hooks/useStoryQuery.ts
import { notifyError, notifySuccess } from "@/lib/notification";
import * as storyService from "@/services/story.service";
import {
  StoryCreateType,
  StoryParamsType,
  StoryType,
} from "@/services/story.service";
import { uploadMedia, UploadMediaResponse } from "@/services/upload.service";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

// Query keys factory
export const storiesKey = {
  all: ["stories"] as const,
  lists: (filters: StoryParamsType) =>
    [...storiesKey.all, "lists", filters] as const,
  infinite: (filters: Omit<StoryParamsType, "page">) =>
    [...storiesKey.all, "infinite", filters] as const,
  detail: (id: string) => [...storiesKey.all, "detail", id] as const,
  create: () => [...storiesKey.all, "create"] as const,
  update: (id: string) => [...storiesKey.all, "update", id] as const,
  delete: (id: string) => [...storiesKey.all, "delete", id] as const,
};

// Fetch all stories with filters
export const useInfiniteStoriesQuery = (
  filters: Omit<StoryParamsType, "page">
) => {
  return useInfiniteQuery({
    queryKey: storiesKey.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      storyService.fetchAllStories({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.metaData.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Fetch single story by ID
export const useStoryByIdQuery = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: storiesKey.detail(id),
    queryFn: () => storyService.fetchStoryById(id),
    enabled: enabled && !!id, // Only fetch if enabled and ID exists
  });
};

type CreateStoryWithUploadParams = {
  // Form data
  title: string;
  description: string;
  category: string;
  tags: string;
  // Files to upload
  titlePhoto: File;
  photos: File[]; // Required when audio, empty when video
  audio?: File; // Optional - when present, video must be absent
  video?: File; // Optional - when present, audio must be absent
};

export const useCreateStoryWithUpload = (filters: StoryParamsType) => {
  const queryClient = useQueryClient();

  return useMutation<StoryType, AxiosError, CreateStoryWithUploadParams>({
    mutationFn: async ({
      title,
      description,
      category,
      tags,
      titlePhoto,
      photos,
      audio,
      video,
    }) => {
      // Step 1: Upload media files
      const uploadResult: UploadMediaResponse = await uploadMedia({
        photos: video ? [titlePhoto] : [titlePhoto, ...photos],
        audio: audio || null,
        video: video || null,
      });

      const uploadedTitlePhoto = uploadResult.photos?.[0] || "";
      const uploadedPhotos = video ? [] : uploadResult.photos?.slice(1) || [];
      const uploadedAudio = uploadResult.audio || undefined;
      const uploadedVideo = uploadResult.video || undefined;

      // Step 2: Create story with uploaded URLs
      const storyData: StoryCreateType = {
        title,
        description,
        category,
        tags,
        titlePhoto: uploadedTitlePhoto,
        photos: uploadedPhotos,
        audio: uploadedAudio,
        video: uploadedVideo,
      };

      const createdStory = await storyService.createStory(storyData);
      return createdStory;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storiesKey.infinite(filters) });
      notifySuccess("Story created successfully");
    },

    onError: (error: AxiosError<any>) => {
      console.error("Failed to create story:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to create story. Please try again.";
      notifyError(errorMessage);
    },
  });
};

// Update story mutation
export const useUpdateStoryMutation = (filters: StoryParamsType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ _id, data }: { _id: string; data: StoryCreateType }) =>
      storyService.updateStory(_id, data),

    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: storiesKey.infinite(filters) });
      queryClient.invalidateQueries({
        queryKey: storiesKey.detail(variables._id),
      });
      notifySuccess("Story updated successfully");
    },

    onError: (error: any) => {
      console.error("Failed to update story:", error);
      notifyError(error?.response?.data?.message || "Failed to update story");
    },
  });
};

// Delete story mutation
export const useDeleteStoryMutation = (filters: StoryParamsType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_id: string) => storyService.deleteStory(_id),

    onSuccess: (_, _id) => {
      // Invalidate the list and remove the specific detail query
      queryClient.invalidateQueries({ queryKey: storiesKey.infinite(filters) });
      queryClient.removeQueries({ queryKey: storiesKey.detail(_id) });
      notifySuccess("Story deleted successfully");
    },

    onError: (error: any) => {
      console.error("Failed to delete story:", error);
      notifyError(error?.response?.data?.message || "Failed to delete story");
    },
  });
};
