/**
 * Wraps fn with a catch handler.
 * 
 * @export
 */
export function catchError<T extends Function>(fn: T): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => fn(...args).catch(args[2]);
}

/**
 * Delays execution when awaited by ms milliseconds.
 * 
 * @export
 */
export function delay(ms: number): Promise<void> {
    return new Promise((res, rej) => { setTimeout(res, ms); });
}
