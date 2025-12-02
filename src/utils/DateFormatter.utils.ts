export interface FormatDateOptions {
  locale?: string; // Locale code like "en-IN", "fr-FR"
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  hour12?: boolean; // 12-hour or 24-hour format
  timeZone?: string; // Time zone identifier like "UTC", "America/New_York"
  // Allow any Intl.DateTimeFormatOptions to extend flexibility
  [key: string]: any;
}

/**
 * Formats a given date or timestamp to a locale-aware string.
 * Returns empty string on invalid input.
 *
 * @param input - Date | number (timestamp) | string (parsable date)
 * @param options - Formatting options with locale and styles
 * @returns Formatted date string
 */
export function formatDate(
  input: Date | number | string,
  options: FormatDateOptions = {}
): string {
  const {
    locale = "en-IN",
    dateStyle = "medium",
    timeStyle,
    hour12,
    timeZone,
    ...restOptions
  } = options;

  // Normalize input to Date
  let dateObj: Date;
  if (input instanceof Date) {
    dateObj = input;
  } else if (typeof input === "string" || typeof input === "number") {
    dateObj = new Date(input);
  } else {
    return "";
  }

  // Return empty if invalid date
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle,
      hour12,
      timeZone,
      ...restOptions,
    });

    return formatter.format(dateObj);
  } catch {
    // Fallback: ISO string or toLocaleString without options
    return dateObj.toLocaleString(locale);
  }
}

/**
 * Creates a reusable date formatter function preconfigured with locale and options.
 *
 * @param locale - Locale code like "en-IN"
 * @param options - FormatDateOptions excluding locale
 * @returns A function that formats dates with the preset configuration
 */
export function createDateFormatter(
  locale: string = "en-IN",
  options: Omit<FormatDateOptions, "locale"> = {}
) {
  const formatter = new Intl.DateTimeFormat(locale, options);

  return (input: Date | number | string): string => {
    const dateObj = input instanceof Date ? input : new Date(input);

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    try {
      return formatter.format(dateObj);
    } catch {
      return dateObj.toLocaleString(locale);
    }
  };
}

// Example predefined formatter - medium date + time, 12-hour, US locale
export const indDateTimeFormatter = createDateFormatter("en-IN", {
  dateStyle: "medium",
  //   timeStyle: "short",
  hour12: true,
});
