import type { MaybeArray } from './types';
/**
 * Call one or multiple functions with the same arguments
 */
export declare function call<T extends (...args: any[]) => any>(funcs: MaybeArray<T>, ...args: Parameters<T>): void;
