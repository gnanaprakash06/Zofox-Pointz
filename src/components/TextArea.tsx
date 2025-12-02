import { forwardRef, Ref, TextareaHTMLAttributes } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { mergeRefs } from "@/utils/mergeRef.utils";
import toId from "@/utils/toId.utils";

// type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: {
    itemClass?: string;
    textareaClass?: string;
    labelClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
  };
}

// NOTE: If user passes `value`, `onChange`, or `onBlur` via props,
// it will override React Hook Form's defaults.
// This allows controlled usage but removes RHF sync.

type TextareaFieldConfigProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> &
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      "ref" | "className" | "name" | "id" | "type" | "defaultValue"
    > & {
      /** Override RHF's controlled value */
      value?: string | number;

      /** Called in addition to RHF's onChange */
      onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;

      /** Called in addition to RHF's onBlur */
      onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    };

const TextareaFieldComp = <T extends FieldValues = FieldValues>(
  props: TextareaFieldConfigProps<T>,
  ref: Ref<HTMLTextAreaElement>
) => {
  const { control } = useFormContext<T>();

  const {
    name,
    label,
    className,
    placeholder,
    description,
    required = false,
    disabled = false,
    ...restProps
  } = props;

  // Validation for required props
  if (!name || !control) {
    console.error("TextareaField: name and control are required props");
    return null;
  }

  if ("defaultValue" in props) {
    console.warn(
      "[TextareaField]: `defaultValue` is ignored. Please use useForm({ defaultValues }) instead."
    );
  }

  const {
    itemClass,
    labelClass,
    textareaClass,
    descriptionClass,
    controlClass,
    messageClass,
  } = className ?? {};

  const safeId = toId(name);
  const errorId = `${safeId}-error`;
  const descriptionId = description ? `${name}-description` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const { ref: fieldRef, ...fieldProps } = field;
        const ariaDescribedBy = [
          descriptionId,
          fieldState.error ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(" ");
        const mergedRef = mergeRefs(fieldRef, ref);

        return (
          <FormItem className={cn("space-y-0", itemClass)}>
            <FormLabel
              className={cn(
                "flex items-center justify-start text-sm font-medium",
                label ? "" : "hidden",
                labelClass
              )}
              htmlFor={safeId}
            >
              <span>{label ? label : name}</span>
              {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <FormControl className={cn("", controlClass)}>
              <Textarea
                ref={mergedRef}
                id={safeId}
                className={cn("", textareaClass)}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                aria-describedby={ariaDescribedBy}
                aria-invalid={fieldState.error ? "true" : "false"}
                aria-required={required}
                {...fieldProps}
                value={restProps.value ?? fieldProps.value}
                onChange={(e) => {
                  fieldProps.onChange(e);
                  restProps?.onChange?.(e);
                }}
                onBlur={(e) => {
                  fieldProps.onBlur();
                  restProps?.onBlur?.(e);
                }}
                {...restProps}
              />
            </FormControl>
            {description && (
              <FormDescription
                id={descriptionId}
                className={cn("text-sm text-gray-600", descriptionClass)}
              >
                {description}
              </FormDescription>
            )}
            <FormMessage className={cn("", messageClass)} id={errorId} />
          </FormItem>
        );
      }}
    />
  );
};

// Create the forwardRef component with proper typing
const TextareaField = forwardRef(TextareaFieldComp) as <
  T extends FieldValues = FieldValues,
>(
  props: TextareaFieldConfigProps<T> & { ref?: Ref<HTMLTextAreaElement> }
) => ReturnType<typeof TextareaFieldComp>;

export default TextareaField;
