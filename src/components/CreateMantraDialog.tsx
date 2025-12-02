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
  useCreateMantraWithUpload,
  useMantraByIdQuery,
  useUpdateMantraMutation,
} from "@/hooks/api/mantra.queries";
import { MantraParamsType } from "@/services/mantra.service";
import { uploadMedia } from "@/services/upload.service";
import { getAudioUrl, getImageUrl } from "@/utils/s3Url.utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Music, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "./InputField";
import TextareaField from "./TextArea";

// Helper: Validate File type
const fileSchema = z.instanceof(File, { message: "Must be a valid file" });

// Helper: Validate File array
const fileArraySchema = z
  .array(fileSchema)
  .min(1, "At least one photo is required")
  .max(10, "You can upload up to 10 photos");

// Main form schema
export const createMantraSchema = z.object({
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

  tags: z
    .string()
    .min(1, "Tags are required")
    .max(200, "Tags must not exceed 200 characters")
    .trim()
    .refine(
      (val) => val.split(",").every((tag) => tag.trim().length > 0),
      "Tags must be comma-separated and non-empty"
    ),

  photos: fileArraySchema,

  audio: fileSchema.refine(
    (file) => file.type.startsWith("audio/") || file.type === "audio/mp3",
    "Audio must be a valid audio file (MP3)"
  ),
});

// EDIT MODE schema - photos and audio are optional (can be empty arrays/undefined)
export const editMantraSchema = z.object({
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

  tags: z
    .string()
    .min(1, "Tags are required")
    .max(200, "Tags must not exceed 200 characters")
    .trim()
    .refine(
      (val) => val.split(",").every((tag) => tag.trim().length > 0),
      "Tags must be comma-separated and non-empty"
    ),

  // ✅ Optional in edit mode - user may not upload new photos
  photos: z
    .array(fileSchema)
    .max(10, "You can upload up to 10 photos")
    .optional()
    .default([]),

  // ✅ Optional in edit mode - user may not upload new audio
  audio: fileSchema
    .refine(
      (file) => file.type.startsWith("audio/") || file.type === "audio/mp3",
      "Audio must be a valid audio file (MP3)"
    )
    .optional(),
});

// Unified type that works for both modes
export type MantraFormType = {
  title: string;
  description: string;
  tags: string;
  photos?: File[];
  audio?: File;
};

export type CreateMantraFormType = z.infer<typeof createMantraSchema>;
export type EditMantraFormType = z.infer<typeof editMantraSchema>;

interface CreateMantraDialogProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MantraParamsType;
  mantraId?: string; // Required for edit mode
  onCancel?: () => void;
}

const MantraDialog = ({
  mode,
  isOpen,
  onOpenChange,
  filters,
  mantraId,
  onCancel,
}: CreateMantraDialogProps) => {
  const isEditMode = mode === "edit";

  // Queries and mutations
  const createMutation = useCreateMantraWithUpload(filters);
  const updateMutation = useUpdateMantraMutation(filters);

  // Fetch mantra data for edit mode
  const { data: mantraData, isLoading: isLoadingMantra } = useMantraByIdQuery(
    mantraId || "",
    isEditMode && !!mantraId && isOpen // Only fetch when editing and dialog is open
  );

  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingAudio, setExistingAudio] = useState<string>("");
  // ✅ Track if user uploaded new files (to decide if we need uploadMedia call)
  const [hasNewPhotos, setHasNewPhotos] = useState<boolean>(false);
  const [hasNewAudio, setHasNewAudio] = useState<boolean>(false);

  const form = useForm<MantraFormType>({
    resolver: zodResolver(isEditMode ? editMantraSchema : createMantraSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      photos: [],
      audio: undefined,
    },
  });

  useEffect(() => {
    if (isEditMode && mantraData && isOpen) {
      form.reset({
        title: mantraData.title || "",
        description: mantraData.description || "",
        tags: mantraData.tags || "",
        photos: [],
        audio: undefined,
      });

      // Set existing photos and audio
      setExistingPhotos(mantraData.photos || []);
      setExistingAudio(mantraData.audio || "");
      setAudioFileName(mantraData.audio ? "Current audio file" : "");

      // Clear new file previews
      setPhotoPreviews([]);
      setAudioPreview(null);

      // ✅ Reset flags when loading edit data
      setHasNewPhotos(false);
      setHasNewAudio(false);
    } else if (!isEditMode && isOpen) {
      // Explicitly clear when switching to create mode
      form.reset({
        title: "",
        description: "",
        tags: "",
        photos: [],
        audio: undefined,
      });
      setPhotoPreviews([]);
      setAudioPreview(null);
      setAudioFileName("");
      setExistingPhotos([]);
      setExistingAudio("");

      // ✅ Reset flags
      setHasNewPhotos(false);
      setHasNewAudio(false);
    }
  }, [isEditMode, mantraData, isOpen, form, mode]);
  // ✅ Add 'mode' to dependencies

  // Reset form when dialog opens in create mode
  useEffect(() => {
    if (isOpen && !isEditMode) {
      // Only reset for create mode when opening
      form.reset({
        title: "",
        description: "",
        tags: "",
        photos: [],
        audio: undefined,
      });
      setPhotoPreviews([]);
      setAudioPreview(null);
      setAudioFileName("");
      setExistingPhotos([]);
      setExistingAudio("");

      // ✅ Reset flags
      setHasNewPhotos(false);
      setHasNewAudio(false);
    } else if (!isOpen) {
      // Clear everything when dialog closes
      form.reset({
        title: "",
        description: "",
        tags: "",
        photos: [],
        audio: undefined,
      });
      setPhotoPreviews([]);
      setAudioPreview(null);
      setAudioFileName("");
      setExistingPhotos([]);
      setExistingAudio("");

      // ✅ Reset flags
      setHasNewPhotos(false);
      setHasNewAudio(false);
    }
  }, [isOpen, isEditMode, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      // ✅ Check total photos (existing + new) don't exceed 10
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

      // ✅ Mark that user added new photos
      setHasNewPhotos(true);
    }
  };

  // Remove new photo
  const handleRemovePhoto = (index: number) => {
    const currentPhotos = form.getValues("photos") || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setValue("photos", updatedPhotos, { shouldValidate: true });

    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(updatedPreviews);

    // ✅ If no new photos left, reset flag
    if (updatedPhotos.length === 0) {
      setHasNewPhotos(false);
    }
  };

  // Remove existing photo (edit mode)
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
      setExistingAudio(""); // Clear existing audio when new one is uploaded

      // ✅ Mark that user uploaded new audio
      setHasNewAudio(true);
    }
  };

  // Remove audio
  const handleRemoveAudio = () => {
    form.setValue("audio", undefined as any, { shouldValidate: true });
    setAudioPreview(null);
    setAudioFileName("");

    // ✅ Reset flag since user removed new audio
    setHasNewAudio(false);
  };

  // Remove existing audio (edit mode)
  const handleRemoveExistingAudio = () => {
    setExistingAudio("");
  };

  // Submit handler
  const onSubmit = async (data: MantraFormType) => {
    try {
      if (isEditMode && mantraId) {
        // ============================================
        // EDIT MODE
        // ============================================

        let finalPhotos = existingPhotos; // Start with existing photo base keys
        let finalAudio = existingAudio; // Start with existing audio base key

        // ✅ Check if we need to upload ANY new files
        const needsUpload = hasNewPhotos || hasNewAudio;

        if (needsUpload) {
          // Upload only the NEW files
          const uploadResult = await uploadMedia({
            photos: hasNewPhotos ? data.photos || [] : null,
            audio: hasNewAudio ? data.audio || null : null,
            video: null,
          });

          // ✅ Merge new photo URLs with existing ones
          if (hasNewPhotos && uploadResult.photos) {
            finalPhotos = [...existingPhotos, ...uploadResult.photos];
          }

          // ✅ Replace audio URL if new audio was uploaded
          if (hasNewAudio && uploadResult.audio) {
            finalAudio = uploadResult.audio;
          }
        }

        // ✅ Update mantra with final URLs (existing + new)
        await updateMutation.mutateAsync({
          _id: mantraId,
          data: {
            title: data.title,
            description: data.description,
            tags: data.tags,
            photos: finalPhotos, // Array of base keys: ["images/uuid1", "images/uuid2"]
            audio: finalAudio, // Single base key: "audios/uuid"
          },
        });
      } else {
        // ============================================
        // CREATE MODE
        // ============================================

        await createMutation.mutateAsync({
          title: data.title,
          description: data.description,
          tags: data.tags,
          photos: data.photos || [],
          audio: data.audio!,
        });
      }

      // Success - close dialog
      handleCancel();
    } catch (error) {
      console.error("Failed to save mantra:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    form.reset({
      title: "",
      description: "",
      tags: "",
      photos: [],
      audio: undefined,
    });
    setPhotoPreviews([]);
    setAudioPreview(null);
    setAudioFileName("");
    setExistingPhotos([]);
    setExistingAudio("");

    // ✅ Reset flags
    setHasNewPhotos(false);
    setHasNewAudio(false);

    onOpenChange(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingMantra) {
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
            {isEditMode ? "Edit Mantra" : "Add New Mantra"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the mantra details below."
              : "Add a new mantra to your collection. Fill in all the required fields below."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <InputField
              type="text"
              name="title"
              label="Title"
              placeholder="Enter mantra title"
              required
              disabled={isPending}
            />

            {/* Description */}
            <TextareaField
              name="description"
              label="Description"
              placeholder="Enter mantra description"
              description="Provide a detailed description of the mantra"
              required
              disabled={isPending}
              className={{
                textareaClass: "min-h-[80px]",
              }}
            />

            {/* Tags */}
            <InputField
              type="text"
              name="tags"
              label="Tags (comma separated)"
              placeholder="e.g. Vedic, Sacred, Meditation"
              description="Separate tags with commas"
              required
              disabled={isPending}
            />

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                Photo {!isEditMode && <span className="text-red-500">*</span>}
              </label>

              {/* Existing Photos (Edit Mode) */}
              {isEditMode && existingPhotos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Current Photos:</p>
                  <div className="grid grid-cols-3 gap-2 rounded-md border p-2">
                    {existingPhotos.map((photoBaseKey, index) => (
                      <div key={index} className="group relative">
                        <img
                          src={getImageUrl(photoBaseKey, 150)} // Adjust based on your S3 URL pattern
                          alt={`Existing ${index + 1}`}
                          className="h-30 w-full rounded object-cover"
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
                  {isEditMode ? "Upload New Photos" : "Choose Photos (Max 10)"}
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

            {/* Audio Upload */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium">
                Upload Audio{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>

              {/* Existing Audio (Edit Mode) - ✅ UPDATED */}
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
                  {/* Audio player for preview - ✅ ADDED */}
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
                  {/* Audio player for new file preview */}
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
                    ? "Update Mantra"
                    : "Add Mantra"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MantraDialog;
