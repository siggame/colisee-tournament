export function catchError<T>(fn: (...args: any[]) => Promise<T>) {
    return async (...args: any[]) => fn(...args).catch(args[2]);
}

export async function delay(ms: number) {
    return new Promise((res, rej) => { setTimeout(res, ms); });
}
