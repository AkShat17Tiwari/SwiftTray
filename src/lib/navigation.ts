export function safeDestination(
  value: string | null,
  fallback = "/dashboard"
): string {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : fallback;
}
