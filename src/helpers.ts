export function wrap<T>(fn: (...args: any[]) => Promise<T>) {
    return async (...args: any[]) => fn(...args).catch(args[2]);
}
