import { MaybeArray } from './types';
/**
 * Call one or multiple functions with the same arguments
 */
export declare function call<T extends (...args: never[]) => unknown>(funcs: MaybeArray<T> | null | undefined, ...args: Parameters<T>): void;
