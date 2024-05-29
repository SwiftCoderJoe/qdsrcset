export function isImage(file: string) {
    // Purposefully ignore SVGs here because it seems unnecessary to resize them.
    return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"]
        .some((extension) => {
            return file.toLowerCase().endsWith(extension)
        })
}