/** Public files need the deployment prefix; external photos keep their URL. */
export function assetPath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//")
    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`
    : path;
}
