/**
 * Asset path utility for handling base paths in different environments
 * Automatically handles GitHub Pages subdirectory paths
 */

let base: string;
try {
    const { base: appBase } = await import('$app/paths');
    base = appBase;
} catch {
    // Fallback for environments where $app/paths is not available
    base = '';
}

/**
 * Get the correct asset path with base path prefix
 * @param path - The asset path (should start with /)
 * @returns The full path including base path
 */
export function assetPath(path: string): string {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    return base + path;
}

/**
 * Get image path
 * @param imagePath - Path relative to /img/ directory
 * @returns Full image path with base
 */
export function imgPath(imagePath: string): string {
    return assetPath(`/img/${imagePath}`);
}

/**
 * Get stroke image path (for the condition X/O images)
 * @param type - 'x' or 'o'
 * @param number - The stroke number (1-8)
 * @returns Full stroke image path
 */
export function strokePath(type: 'x' | 'o', number: number): string {
    return assetPath(`/img/strokes/${type}${number}.png`);
}

/**
 * Get font path
 * @param fontName - The font filename
 * @returns Full font path with base
 */
export function fontPath(fontName: string): string {
    return assetPath(`/fonts/${fontName}`);
}
