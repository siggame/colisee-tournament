export function catchError<T extends Function>(fn: T): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => fn(...args).catch(args[2]);
}

export async function delay(ms: number) {
    return new Promise((res, rej) => { setTimeout(res, ms); });
}
