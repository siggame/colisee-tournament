import { defaultTo, toNumber } from "lodash";

export const PORT: number = defaultTo<number>(toNumber(process.env.PORT), 8080);
