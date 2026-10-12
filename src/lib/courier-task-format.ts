
export function taskStatusLabel(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function formatTaskDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

export function taskField(
  value: unknown,
  key: string,
): string | null {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const field =
    (value as Record<string, unknown>)[key];

  return typeof field === "string" &&
    field.trim().length > 0
    ? field.trim()
    : null;
}

export function formatTaskAddress(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value.trim() || "Not provided";
  }

  const directAddress =
    taskField(value, "address") ??
    taskField(value, "fullAddress");

  const parts = [
    directAddress ??
      taskField(value, "street") ??
      taskField(value, "line1"),
    taskField(value, "area"),
    taskField(value, "city"),
    taskField(value, "district"),
  ].filter((part): part is string =>
    Boolean(part),
  );

  return parts.length
    ? [...new Set(parts)].join(", ")
    : "Not provided";
}
