import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 tailwind-merge 处理冲突
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 工具函数统一导出
export { deepClone, makeUniqueKey, waitForImageLoad } from './helpers';
export { mergeTemplatesWithSystem, mergeBanksWithSystem } from './merge';
export { default as storageAdapter } from './storage';
export { default as fileManager } from './fileManager';
// export * from './fileManagerExample';
