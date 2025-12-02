import { axiosInstance } from "@/lib/axiosInstance";

// Mantra item
export interface MantraType {
  _id: string;
  title: string;
  description: string;
  tags: string[]; // comma-separated tags
  photos: string[];
  audio: string;
  playCount: number;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  __v: number;
  score: number;
}

type ModifiedMantraType = Omit<MantraType, "tags"> & {
  tags: string;
};

export interface MantraCreateType {
  title: string;
  description: string;
  tags: string;
  photos: string[];
  audio: string;
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

export type MantraParamsType = {
  search?: string;
  status?: "active" | "inactive";
  page?: number | string;
  limit?: number | string;
  sortBy?: "createdAt" | "playCount" | "title";
  sortOrder?: "asc" | "desc";
};

export const fetchAllMantras = async (filters: MantraParamsType) => {
  const response = await axiosInstance.get("/mantras/", {
    params: filters,
  });

  return {
    mantras: response.data.data,
    metaData: response.data.meta,
  } as {
    mantras: MantraType[];
    metaData: metaDataType;
  };
};

export const fetchMantraById = async (_id: string) => {
  const response = await axiosInstance.get(`/mantras/${_id}`);
  return response.data.data as ModifiedMantraType;
};

export const createMantra = async (mantraData: MantraCreateType) => {
  const response = await axiosInstance.post("/mantras/", mantraData);
  return response.data.data as MantraType;
};

export const updateMantra = async (
  _id: string,
  mantraData: MantraCreateType
) => {
  const response = await axiosInstance.put(`/mantras/${_id}`, mantraData);
  return response.data.data as MantraType;
};

export const deleteMantra = async (_id: string) => {
  const response = await axiosInstance.delete(`/mantras/${_id}`);
  return response.data.data as MantraType;
};
