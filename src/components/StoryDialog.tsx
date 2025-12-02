import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  useCreateStoryWithUpload,
  useStoryByIdQuery,
  useUpdateStoryMutation,
} from "@/hooks/api/story.queries";
import { StoryParamsType } from "@/services/story.service";
import { uploadMedia } from "@/services/upload.service";
import { getAudioUrl, getImageUrl, getVideoUrl } from "@/utils/s3Url.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music, Upload, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "./InputField";
import SelectField from "./SelectField";
import TextareaField from "./TextArea";

// Helper: Validate File type
const fileSchema = z.instanceof(File, { message: "Must be a valid file" });

// Category options
const categoryOptions = [
  { value: "mythology", label: "Mythology" },
  { value: "festival", label: "Festival" },
  { value: "epic", label: "Epic" },
  { value: "devotional", label: "Devotional" },
  { value: "puranas", label: "Puranas" },
];

// Main form schema for CREATE mode
export const createStorySchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must not exceed 100 characters")
      .trim(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters")
      .trim(),

    category: z.enum(
      ["mythology", "festival", "epic", "devotional", "puranas"],
      {
        message: "Please select a valid category",
      }
    ),

    tags: z
      .string()
      .min(1, "Tags are required")
      .max(200, "Tags must not exceed 200 characters")
      .trim()
      .refine(
        (val) => val.split(",").every((tag) => tag.trim().length > 0),
        "Tags must be comma-separated and non-empty"
      ),

    titlePhoto: fileSchema.refine(
      (file) => file.type.startsWith("image/"),
      "Title photo must be a valid image file"
    ),

    mediaType: z.enum(["audio", "video"], {
      message: "Please select either audio or video",
    }),

    photos: z.array(fileSchema).max(10, "You can upload up to 10 photos"),

    audio: fileSchema
      .refine(
        (file) => file.type.startsWith("audio/") || file.type === "audio/mp3",
        "Audio must be a valid audio file (MP3)"
      )
      .optional(),

    video: fileSchema
      .refine(
        (file) => file.type.startsWith("video/"),
        "Video must be a valid video file"
      )
      .optional(),
  })
  .refine(
    (data) => {
      // If audio is selected, audio file and at least 1 photo required
      if (data.mediaType === "audio") {
        return data.audio && data.photos.length > 0;
      }
      return true;
    },
    {
      message:
        "Audio and at least one photo are required when audio is selected",
      path: ["audio"],
    }
  )
  .refine(
    (data) => {
      // If video is selected, video file required and photos must be empty
      if (data.mediaType === "video") {
        return data.video && data.photos.length === 0;
      }
      return true;
    },
    {
      message:
        "Video is required and photos must be empty when video is selected",
      path: ["video"],
    }
  );

// EDIT MODE schema - titlePhoto, photos, audio, and video are optional
export const editStorySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .trim(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .trim(),

  category: z.enum(["mythology", "festival", "epic", "devotional", "puranas"], {
    message: "Please select a valid category",
  }),

  tags: z
    .string()
    .min(1, "Tags are required")
    .max(200, "Tags must not exceed 200 characters")
    .trim()
    .refine(
      (val) => val.split(",").every((tag) => tag.trim().length > 0),
      "Tags must be comma-separated and non-empty"
    ),

  mediaType: z.enum(["audio", "video"], {
    message: "Please select either audio or video",
  }),

  titlePhoto: fileSchema
    .refine(
      (file) => file.type.startsWith("image/"),
      "Title photo must be a valid image file"
    )
    .optional(),

  photos: z
    .array(fileSchema)
    .max(10, "You can upload up to 10 photos")
    .optional()
    .default([]),

  audio: fileSchema
    .refine(
      (file) => file.type.startsWith("audio/") || file.type === "audio/mp3",
      "Audio must be a valid audio file (MP3)"
    )
    .optional(),

  video: fileSchema
    .refine(
      (file) => file.type.startsWith("video/"),
      "Video must be a valid video file"
    )
    .optional(),
});

// Unified type that works for both modes
export type StoryFormType = {
  title: string;
  description: string;
  category: "mythology" | "festival" | "epic" | "devotional" | "puranas";
  tags: string;
  mediaType: "audio" | "video";
  titlePhoto?: File;
  photos?: File[];
  audio?: File;
  video?: File;
};

export type CreateStoryFormType = z.infer<typeof createStorySchema>;
export type EditStoryFormType = z.infer<typeof editStorySchema>;

interface CreateStoryDialogProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: StoryParamsType;
  storyId?: string; // Required for edit mode
  onCancel?: () => void;
}

const StoryDialog = ({
  mode,
  isOpen,
  onOpenChange,
  filters,
  storyId,
  onCancel,
}: CreateStoryDialogProps) => {
  const isEditMode = mode === "edit";

  // Queries and mutations
  const createMutation = useCreateStoryWithUpload(filters);
  const updateMutation = useUpdateStoryMutation(filters);

  // Fetch story data for edit mode
  const { data: storyData, isLoading: isLoadingStory } = useStoryByIdQuery(
    storyId || "",
    isEditMode && !!storyId && isOpen
  );

  const [titlePhotoPreview, setTitlePhotoPreview] = useState<string | null>(
    null
  );
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");

  const [existingTitlePhoto, setExistingTitlePhoto] = useState<string>("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingAudio, setExistingAudio] = useState<string>("");
  const [existingVideo, setExistingVideo] = useState<string>("");

  const [hasNewTitlePhoto, setHasNewTitlePhoto] = useState<boolean>(false);
  const [hasNewPhotos, setHasNewPhotos] = useState<boolean>(false);
  const [hasNewAudio, setHasNewAudio] = useState<boolean>(false);
  const [hasNewVideo, setHasNewVideo] = useState<boolean>(false);

  const form = useForm<StoryFormType>({
    resolver: zodResolver(isEditMode ? editStorySchema : createStorySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "mythology",
      tags: "",
      mediaType: "audio",
      titlePhoto: undefined,
      photos: [],
      audio: undefined,
      video: undefined,
    },
  });

  const watchMediaType = form.watch("mediaType");

  useEffect(() => {
    if (isEditMode && storyData && isOpen) {
      const mediaType = storyData.audio ? "audio" : "video";

      form.reset({
        title: storyData.title || "",
        description: storyData.description || "",
        category: (storyData.category as any) || "mythology",
        tags: storyData.tags || "",
        mediaType: mediaType,
        titlePhoto: undefined,
        photos: [],
        audio: undefined,
        video: undefined,
      });

      // Set existing media
      setExistingTitlePhoto(storyData.titlePhoto || "");
      setExistingPhotos(storyData.photos || []);
      setExistingAudio(storyData.audio || "");
      setExistingVideo(storyData.video || "");

      if (storyData.audio) {
        setAudioFileName("Current audio file");
      }
      if (storyData.video) {
        setVideoFileName("Current video file");
      }

      // Clear new file previews
      setTitlePhotoPreview(null);
      setPhotoPreviews([]);
      setAudioPreview(null);
      setVideoPreview(null);

      // Reset flags
      setHasNewTitlePhoto(false);
      setHasNewPhotos(false);
      setHasNewAudio(false);
      setHasNewVideo(false);
    } else if (!isEditMode && isOpen) {
      form.reset({
        title: "",
        description: "",
        category: "mythology",
        tags: "",
        mediaType: "audio",
        titlePhoto: undefined,
        photos: [],
        audio: undefined,
        video: undefined,
      });
      clearAllPreviews();
    }
  }, [isEditMode, storyData, isOpen, form, mode]);

  useEffect(() => {
    if (isOpen && !isEditMode) {
      form.reset({
        title: "",
        description: "",
        category: "mythology",
        tags: "",
        mediaType: "audio",
        titlePhoto: undefined,
        photos: [],
        audio: undefined,
        video: undefined,
      });
      clearAllPreviews();
    } else if (!isOpen) {
      clearAllPreviews();
    }
  }, [isOpen, isEditMode, form]);

  const clearAllPreviews = () => {
    setTitlePhotoPreview(null);
    setPhotoPreviews([]);
    setAudioPreview(null);
    setVideoPreview(null);
    setAudioFileName("");
    setVideoFileName("");
    setExistingTitlePhoto("");
    setExistingPhotos([]);
    setExistingAudio("");
    setExistingVideo("");
    setHasNewTitlePhoto(false);
    setHasNewPhotos(false);
    setHasNewAudio(false);
    setHasNewVideo(false);
  };

  // Handle title photo upload
  const handleTitlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        form.setError("titlePhoto", {
          type: "manual",
          message: "Please upload a valid image file",
        });
        return;
      }

      form.setValue("titlePhoto", file, { shouldValidate: true });
      setTitlePhotoPreview(URL.createObjectURL(file));
      setExistingTitlePhoto(""); // Clear existing when new one is uploaded
      setHasNewTitlePhoto(true);
    }
  };

  const handleRemoveTitlePhoto = () => {
    form.setValue("titlePhoto", undefined as any, { shouldValidate: true });
    setTitlePhotoPreview(null);
    setHasNewTitlePhoto(false);
  };

  const handleRemoveExistingTitlePhoto = () => {
    setExistingTitlePhoto("");
  };

  // Handle multiple photos upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      const totalPhotos = existingPhotos.length + fileArray.length;
      if (totalPhotos > 10) {
        form.setError("photos", {
          type: "manual",
          message: `You can upload up to 10 photos total. You have ${existingPhotos.length} existing photos.`,
        });
        return;
      }

      form.setValue("photos", fileArray, { shouldValidate: true });
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setPhotoPreviews(previews);
      setHasNewPhotos(true);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const currentPhotos = form.getValues("photos") || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setValue("photos", updatedPhotos, { shouldValidate: true });

    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(updatedPreviews);

    if (updatedPhotos.length === 0) {
      setHasNewPhotos(false);
    }
  };

  const handleRemoveExistingPhoto = (index: number) => {
    const updatedPhotos = existingPhotos.filter((_, i) => i !== index);
    setExistingPhotos(updatedPhotos);
  };

  // Handle audio upload
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        form.setError("audio", {
          type: "manual",
          message: "Please upload a valid audio file (MP3)",
        });
        return;
      }

      form.setValue("audio", file, { shouldValidate: true });
      setAudioPreview(URL.createObjectURL(file));
      setAudioFileName(file.name);
      setExistingAudio("");
      setHasNewAudio(true);
    }
  };

  const handleRemoveAudio = () => {
    form.setValue("audio", undefined as any, { shouldValidate: true });
    setAudioPreview(null);
    setAudioFileName("");
    setHasNewAudio(false);
  };

  const handleRemoveExistingAudio = () => {
    setExistingAudio("");
  };

  // Handle video upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        form.setError("video", {
          type: "manual",
          message: "Please upload a valid video file",
        });
        return;
      }

      form.setValue("video", file, { shouldValidate: true });
      setVideoPreview(URL.createObjectURL(file));
      setVideoFileName(file.name);
      setExistingVideo("");
      setHasNewVideo(true);
    }
  };

  const handleRemoveVideo = () => {
    form.setValue("video", undefined as any, { shouldValidate: true });
    setVideoPreview(null);
    setVideoFileName("");
    setHasNewVideo(false);
  };

  const handleRemoveExistingVideo = () => {
    setExistingVideo("");
  };

  // Submit handler
  const onSubmit = async (data: StoryFormType) => {
    try {
      if (isEditMode && storyId) {
        // EDIT MODE
        let finalTitlePhoto = existingTitlePhoto;
        let finalPhotos = existingPhotos;
        let finalAudio = existingAudio;
        let finalVideo = existingVideo;

        const needsUpload =
          hasNewTitlePhoto || hasNewPhotos || hasNewAudio || hasNewVideo;

        if (needsUpload) {
          const photosToUpload = [];

          if (hasNewTitlePhoto && data.titlePhoto) {
            photosToUpload.push(data.titlePhoto);
          }

          if (hasNewPhotos && data.photos) {
            photosToUpload.push(...data.photos);
          }

          const uploadResult = await uploadMedia({
            photos: photosToUpload.length > 0 ? photosToUpload : null,
            audio: hasNewAudio ? data.audio || null : null,
            video: hasNewVideo ? data.video || null : null,
          });

          // Handle title photo
          if (
            hasNewTitlePhoto &&
            uploadResult.photos &&
            uploadResult.photos.length > 0
          ) {
            finalTitlePhoto = uploadResult.photos[0];

            // Remaining photos are regular photos
            if (hasNewPhotos) {
              const newRegularPhotos = uploadResult.photos.slice(1);
              finalPhotos = [...existingPhotos, ...newRegularPhotos];
            }
          } else if (hasNewPhotos && uploadResult.photos) {
            // Only new regular photos uploaded
            finalPhotos = [...existingPhotos, ...uploadResult.photos];
          }

          if (hasNewAudio && uploadResult.audio) {
            finalAudio = uploadResult.audio;
            finalVideo = ""; // Clear video when audio is uploaded
          }

          if (hasNewVideo && uploadResult.video) {
            finalVideo = uploadResult.video;
            finalAudio = ""; // Clear audio when video is uploaded
            finalPhotos = []; // Clear photos when video is uploaded
          }
        }

        // If switching from video to audio in edit mode
        if (data.mediaType === "audio" && existingVideo && !hasNewVideo) {
          finalVideo = "";
        }

        // If switching from audio to video in edit mode
        if (data.mediaType === "video" && existingAudio && !hasNewAudio) {
          finalAudio = "";
          finalPhotos = [];
        }

        await updateMutation.mutateAsync({
          _id: storyId,
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            tags: data.tags,
            titlePhoto: finalTitlePhoto,
            photos: finalPhotos,
            audio: finalAudio || undefined,
            video: finalVideo || undefined,
          },
        });
      } else {
        // CREATE MODE
        await createMutation.mutateAsync({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          titlePhoto: data.titlePhoto!,
          photos: data.photos || [],
          audio: data.audio,
          video: data.video,
        });
      }

      handleCancel();
    } catch (error) {
      console.error("Failed to save story:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    form.reset({
      title: "",
      description: "",
      category: "mythology",
      tags: "",
      mediaType: "audio",
      titlePhoto: undefined,
      photos: [],
      audio: undefined,
      video: undefined,
    });
    clearAllPreviews();
    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingStory) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        onInteractOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Story" : "Add New Story"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the story details below."
              : "Add a new devotional story to your collection. Fill in all the required fields below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <InputField
              type="text"
              name="title"
              label="Title"
              placeholder="Enter story title"
              required
              disabled={isPending}
            />

            {/* Description */}
            <TextareaField
              name="description"
              label="Description"
              placeholder="Enter story description"
              description="Provide a detailed description of the story"
              required
              disabled={isPending}
              className={{
                textareaClass: "min-h-[80px]",
              }}
            />

            {/* Category */}
            <SelectField
              name="category"
              label="Category"
              placeholder="Select category"
              options={categoryOptions}
              required
              disabled={isPending}
            />

            {/* Tags */}
            <InputField
              type="text"
              name="tags"
              label="Tags (comma separated)"
              placeholder="e.g. Rama, Dharma, Epic"
              description="Separate tags with commas"
              required
              disabled={isPending}
            />

            {/* Title Photo */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                Title Photo{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>

              {/* Existing Title Photo (Edit Mode) */}
              {isEditMode && existingTitlePhoto && !titlePhotoPreview && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Current Title Photo:</p>
                  <div className="group relative w-full">
                    <img
                      src={getImageUrl(existingTitlePhoto, 300)}
                      alt="Current title"
                      className="h-40 w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveExistingTitlePhoto}
                      disabled={isPending}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("title-photo-upload")?.click()
                  }
                  disabled={isPending}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isEditMode ? "Upload New Title Photo" : "Choose Title Photo"}
                </Button>
                <input
                  id="title-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleTitlePhotoChange}
                  className="hidden"
                  disabled={isPending}
                />
              </div>

              {/* New Title Photo Preview */}
              {titlePhotoPreview && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">New Title Photo:</p>
                  <div className="group relative w-full">
                    <img
                      src={titlePhotoPreview}
                      alt="Title preview"
                      className="h-40 w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveTitlePhoto}
                      disabled={isPending}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {form.formState.errors.titlePhoto && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.titlePhoto.message}
                </p>
              )}
            </div>

            {/* Media Type Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                Media Type{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="audio"
                    checked={watchMediaType === "audio"}
                    onChange={(_e) => {
                      form.setValue("mediaType", "audio", {
                        shouldValidate: true,
                      });
                      // Clear video when switching to audio
                      form.setValue("video", undefined as any);
                      setVideoPreview(null);
                      setVideoFileName("");
                    }}
                    disabled={isPending}
                    className="h-4 w-4 text-orange-600"
                  />
                  <Music className="h-4 w-4" />
                  <span className="text-sm">Audio</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="video"
                    checked={watchMediaType === "video"}
                    onChange={(_e) => {
                      form.setValue("mediaType", "video", {
                        shouldValidate: true,
                      });
                      // Clear audio and photos when switching to video
                      form.setValue("audio", undefined as any);
                      form.setValue("photos", []);
                      setAudioPreview(null);
                      setAudioFileName("");
                      setPhotoPreviews([]);
                    }}
                    disabled={isPending}
                    className="h-4 w-4 text-orange-600"
                  />
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Video</span>
                </label>
              </div>
            </div>

            {/* Audio Upload (only when audio is selected) */}
            {watchMediaType === "audio" && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  Upload Audio{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>

                {/* Existing Audio (Edit Mode) */}
                {isEditMode && existingAudio && !audioPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md border p-2">
                      <Music className="h-5 w-5 text-orange-600" />
                      <span className="flex-1 truncate text-sm">
                        Current audio file
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveExistingAudio}
                        disabled={isPending}
                        className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <audio controls className="w-full" preload="metadata">
                      <source
                        src={getAudioUrl(existingAudio)}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("audio-upload")?.click()
                    }
                    disabled={isPending}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isEditMode ? "Upload New Audio" : "Choose Audio (MP3)"}
                  </Button>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    onChange={handleAudioChange}
                    className="hidden"
                    disabled={isPending}
                  />
                </div>

                {/* New Audio Preview */}
                {audioPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md border p-2">
                      <Music className="h-5 w-5 text-orange-600" />
                      <span className="flex-1 truncate text-sm">
                        {audioFileName}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveAudio}
                        disabled={isPending}
                        className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <audio controls className="w-full" preload="metadata">
                      <source src={audioPreview} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {form.formState.errors.audio && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.audio.message}
                  </p>
                )}
              </div>
            )}

            {/* Video Upload (only when video is selected) */}
            {watchMediaType === "video" && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  Upload Video{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>

                {/* Existing Video (Edit Mode) */}
                {isEditMode && existingVideo && !videoPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md border p-2">
                      <Video className="h-5 w-5 text-orange-600" />
                      <span className="flex-1 truncate text-sm">
                        Current video file
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveExistingVideo}
                        disabled={isPending}
                        className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <video
                      controls
                      className="w-full rounded"
                      preload="metadata"
                    >
                      <source
                        src={getVideoUrl(existingVideo)}
                        type="video/mp4"
                      />
                      Your browser does not support the video element.
                    </video>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("video-upload")?.click()
                    }
                    disabled={isPending}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isEditMode ? "Upload New Video" : "Choose Video"}
                  </Button>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={isPending}
                  />
                </div>

                {/* New Video Preview */}
                {videoPreview && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md border p-2">
                      <Video className="h-5 w-5 text-orange-600" />
                      <span className="flex-1 truncate text-sm">
                        {videoFileName}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        disabled={isPending}
                        className="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <video
                      controls
                      className="w-full rounded"
                      preload="metadata"
                    >
                      <source src={videoPreview} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  </div>
                )}

                {form.formState.errors.video && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.video.message}
                  </p>
                )}
              </div>
            )}

            {/* Multiple Photos Upload (only when audio is selected) */}
            {watchMediaType === "audio" && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  Add Multiple Photos{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>

                {/* Existing Photos (Edit Mode) */}
                {isEditMode && existingPhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Current Photos:</p>
                    <div className="grid grid-cols-3 gap-2 rounded-md border p-2">
                      {existingPhotos.map((photoBaseKey, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={getImageUrl(photoBaseKey, 150)}
                            alt={`Existing ${index + 1}`}
                            className="h-20 w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingPhoto(index)}
                            disabled={isPending}
                            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("photo-upload")?.click()
                    }
                    disabled={isPending}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isEditMode
                      ? "Upload New Photos"
                      : "Choose Photos (Max 10)"}
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isPending}
                  />
                </div>

                {/* New Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">New Photos:</p>
                    <div className="grid grid-cols-3 gap-2 rounded-md border p-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            disabled={isPending}
                            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.formState.errors.photos && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.photos.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                    ? "Update Story"
                    : "Add Story"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDialog;
