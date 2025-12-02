import { cn } from "@/lib/utils";
import { mergeRefs } from "@/utils/mergeRef.utils";
import toId from "@/utils/toId.utils";
import { forwardRef, Ref /* SelectHTMLAttributes */, useCallback } from "react";
import { FieldPath, FieldValues, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Enhanced option types
interface SimpleOption {
  _id?: string;
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
}

interface OptionGroup {
  label: string;
  options: SimpleOption[];
}

interface SeparatorOption {
  type: "separator";
}

type OptionItem = SimpleOption | OptionGroup | SeparatorOption;

// type definitions
interface FieldConfigProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  options: OptionItem[];
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  showScrollButtons?: boolean;
  className?: {
    itemClass?: string;
    selectClass?: string;
    labelClass?: string;
    descriptionClass?: string;
    controlClass?: string;
    messageClass?: string;
  };
}

// NOTE: If user passes `value`, `onChange`, or `onBlur` via props,
// it will override React Hook Form's defaults.
// This allows controlled usage but removes RHF sync.

export type SelectFieldConfigProps<T extends FieldValues = FieldValues> =
  FieldConfigProps<T> & /*     Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      | "ref"
      | "className"
      | "name"
      | "id"
      | "type"
      | "defaultValue"
      | "onChange"
      | "onBlur"
    > & */ {
    /** Override RHF's controlled value */
    value?: string;

    /** Called in addition to RHF's onChange */
    onValueChange?: (value: string) => void;

    /** Called in addition to RHF's onBlur */
    onOpenChange?: (open: boolean) => void;

    // Only include the specific HTML attributes you actually need
    form?: string;
    autoComplete?: string;
    tabIndex?: number;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "data-testid"?: string;
    "data-*"?: string;
    style?: React.CSSProperties;

    // Allow any data-* attributes
    [key: `data-${string}`]: string | undefined;
  };

// type guards

const isSimpleOption = (item: OptionItem): item is SimpleOption => {
  return "value" in item && "label" in item;
};

const isOptionGroup = (item: OptionItem): item is OptionGroup => {
  return "options" in item && Array.isArray((item as any).options);
};

const isSeparator = (item: OptionItem): item is SeparatorOption => {
  return "type" in item && (item as any).type === "separator";
};

const SelectFieldComp = <T extends FieldValues = FieldValues>(
  props: SelectFieldConfigProps<T>,
  ref: Ref<HTMLSelectElement>
) => {
  const { control } = useFormContext<T>();

  const {
    name,
    options,
    label,
    className,
    placeholder,
    description,
    required = false,
    disabled = false,
    showScrollButtons = false,
    value,
    onValueChange,
    onOpenChange,
    form,
    autoComplete,
    ...restProps
  } = props;

  const renderOptions = useCallback(() => {
    return options.map((item, index) => {
      if (isSimpleOption(item)) {
        return (
          <SelectItem
            key={item._id || item.id || `${item.value}-${index}`}
            value={item.value}
          >
            {item.label}
          </SelectItem>
        );
      } else if (isOptionGroup(item)) {
        return (
          <SelectGroup key={`group-${item.label}`}>
            <SelectLabel>{item.label}</SelectLabel>
            {item.options.map((option) => (
              <SelectItem
                key={option.value}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        );
      } else if (isSeparator(item)) {
        return <SelectSeparator key={`separator-${index}`} />;
      } else {
        return null;
      }
    });
  }, [options]);

  // Validation for required props
  if (!name || !control) {
    console.error("SelectField: name and control are required props");
    return null;
  }

  if ("defaultValue" in props) {
    console.warn(
      "[SelectField]: `defaultValue` is ignored. Please use useForm({ defaultValues }) instead."
    );
  }

  const {
    itemClass,
    labelClass,
    selectClass,
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
            <Select
              disabled={disabled}
              required={required}
              form={form}
              autoComplete={autoComplete}
              {...fieldProps}
              onValueChange={(value: string) => {
                fieldProps.onChange(value);
                onValueChange?.(value);
              }}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  fieldProps.onBlur();
                }
                onOpenChange?.(open);
              }}
              value={
                value
                  ? String(value)
                  : fieldProps.value
                    ? String(fieldProps.value)
                    : undefined
              }
              // defaultValue={field.value}
            >
              <FormControl className={cn("", controlClass)}>
                <SelectTrigger
                  ref={mergedRef}
                  id={safeId}
                  className={cn("w-full", selectClass)}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={fieldState.error ? "true" : "false"}
                  aria-required={required}
                  {...restProps}
                >
                  <SelectValue placeholder={placeholder || name} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {showScrollButtons && <SelectScrollUpButton />}
                {renderOptions()}
                {showScrollButtons && <SelectScrollDownButton />}
              </SelectContent>
            </Select>
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
const SelectField = forwardRef(SelectFieldComp) as <
  T extends FieldValues = FieldValues,
>(
  props: SelectFieldConfigProps<T> & { ref?: Ref<HTMLSelectElement> }
) => ReturnType<typeof SelectFieldComp>;

export default SelectField;
