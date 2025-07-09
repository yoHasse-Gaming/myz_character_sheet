/**
 * Generate multiple unique variants for a set of inputs
 * Ensures no two consecutive inputs have the same variant
 */
export function generateUniqueVariants(count: number): string[] {
    const variants: string[] = [];
    let lastVariant = '';
    
    for (let i = 0; i < count; i++) {
        let variant = getRandomTornVariant();
        // Ensure we don't get the same variant twice in a row
        while (variant === lastVariant && count > 1) {
            variant = getRandomTornVariant();
        }
        variants.push(variant);
        lastVariant = variant;
    }
    
    return variants;
}


/**
 * Utility function to get a random variant class for torn paper inputs
 * This ensures each input has a unique torn paper appearance
 */
export function getRandomTornVariant(): string {
    const variants = [
        'variant-1', 'variant-2', 'variant-3', 'variant-4', 
        'variant-5', 'variant-6', 'variant-7', 'variant-8'
    ];
    return variants[Math.floor(Math.random() * variants.length)];
}



