// hooks/useMantraQuery.ts
import { notifyError, notifySuccess } from "@/lib/notification";
import * as mantraService from "@/services/mantra.service";
import {
  MantraCreateType,
  MantraParamsType,
  MantraType,
} from "@/services/mantra.service";
import { uploadMedia, UploadMediaResponse } from "@/services/upload.service";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

// Query keys factory
export const mantrasKey = {
  all: ["mantras"] as const,
  lists: (filters: MantraParamsType) =>
    [...mantrasKey.all, "lists", filters] as const,
  infinite: (filters: Omit<MantraParamsType, "page">) =>
    [...mantrasKey.all, "infinite", filters] as const,
  detail: (id: string) => [...mantrasKey.all, "detail", id] as const,
  create: () => [...mantrasKey.all, "create"] as const,
  update: (id: string) => [...mantrasKey.all, "update", id] as const,
  delete: (id: string) => [...mantrasKey.all, "delete", id] as const,
};

// Fetch all mantras with filters
export const useInfiniteMantrasQuery = (
  filters: Omit<MantraParamsType, "page">
) => {
  return useInfiniteQuery({
    queryKey: mantrasKey.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      mantraService.fetchAllMantras({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.metaData.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Fetch single mantra by ID
export const useMantraByIdQuery = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: mantrasKey.detail(id),
    queryFn: () => mantraService.fetchMantraById(id),
    enabled: enabled && !!id, // Only fetch if enabled and ID exists
  });
};

type CreateMantraWithUploadParams = {
  // Form data
  title: string;
  description: string;
  tags: string;
  // Files to upload
  photos: File[];
  audio: File;
};

export const useCreateMantraWithUpload = (filters: MantraParamsType) => {
  const queryClient = useQueryClient();

  return useMutation<MantraType, AxiosError, CreateMantraWithUploadParams>({
    mutationFn: async ({ title, description, tags, photos, audio }) => {
      const uploadResult: UploadMediaResponse = await uploadMedia({
        photos,
        audio,
        video: null,
      });

      const uploadedPhotos = uploadResult.photos || [];
      const uploadedAudio = uploadResult.audio;

      // Step 2: Create mantra with uploaded URLs
      const mantraData: MantraCreateType = {
        title,
        description,
        tags,
        photos: uploadedPhotos,
        audio: uploadedAudio,
      };

      const createdMantra = await mantraService.createMantra(mantraData);
      return createdMantra;
    },

    onSuccess: () => {
      // Invalidate the list to refetch with new data
      queryClient.invalidateQueries({ queryKey: mantrasKey.infinite(filters) });
      notifySuccess("Mantra created successfully");
    },

    onError: (error: AxiosError<any>) => {
      console.error("Failed to create mantra:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to create mantra. Please try again.";
      notifyError(errorMessage);
    },
  });
};

// Update mantra mutation
export const useUpdateMantraMutation = (filters: MantraParamsType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ _id, data }: { _id: string; data: MantraCreateType }) =>
      mantraService.updateMantra(_id, data),

    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: mantrasKey.infinite(filters) });
      queryClient.invalidateQueries({
        queryKey: mantrasKey.detail(variables._id),
      });
      notifySuccess("Mantra updated successfully");
    },

    onError: (error: any) => {
      console.error("Failed to update mantra:", error);
      notifyError(error?.response?.data?.message || "Failed to update mantra");
    },
  });
};

// Delete mantra mutation
export const useDeleteMantraMutation = (filters: MantraParamsType) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_id: string) => mantraService.deleteMantra(_id),

    onSuccess: (_, _id) => {
      // Invalidate the list and remove the specific detail query
      queryClient.invalidateQueries({ queryKey: mantrasKey.infinite(filters) });
      queryClient.removeQueries({ queryKey: mantrasKey.detail(_id) });
      notifySuccess("Mantra deleted successfully");
    },

    onError: (error: any) => {
      console.error("Failed to delete mantra:", error);
      notifyError(error?.response?.data?.message || "Failed to delete mantra");
    },
  });
};
