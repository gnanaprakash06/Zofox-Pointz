import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import TextareaField from "./TextArea";
import { Form } from "./ui/form";

interface ReasonDialogProps {
  formDescription: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string | ReactNode;
  label?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (comment: string) => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters")
    .trim(),
});

type formType = z.infer<typeof formSchema>;

const ReasonDialog = ({
  formDescription,
  isOpen,
  onOpenChange,
  title = "Provide Reason",
  description,
  label = "Reason",
  placeholder = "Enter your comment...",
  confirmText = "Submit",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ReasonDialogProps) => {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (data: formType) => {
    try {
      await onConfirm(data.reason);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting reason:", error);
      // Form stays open on error so user can retry
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="my-4">
              <TextareaField
                className={{
                  textareaClass:
                    "w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                }}
                name={"reason"}
                label={label}
                autoFocus={true}
                placeholder={placeholder}
                description={formDescription}
              />
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
              >
                {cancelText}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : confirmText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReasonDialog;
