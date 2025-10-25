import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, handling conditional classes
 * and merging Tailwind CSS classes intelligently.
 *
 * Uses `clsx` to handle conditional class names and `twMerge` to merge
 * Tailwind utility classes to prevent conflicts (e.g., `p-2 p-4` becomes `p-4`).
 *
 * @param {...(string|undefined|false|object)} inputs - Class names, objects with conditional classes, or falsy values.
 * @returns {string} - A single merged class string ready to be applied to a component.
 *
 * @example
 * cn("p-2", "text-center", { "bg-blue-500": isActive });
 * // => "p-2 text-center bg-blue-500" if isActive is true
 */

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
