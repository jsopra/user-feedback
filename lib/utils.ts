import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitário para combinar classes CSS de forma otimizada
 * Combina clsx para condicionais e tailwind-merge para otimização
 * @param inputs - Classes CSS para combinar
 * @returns String com classes CSS otimizadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
