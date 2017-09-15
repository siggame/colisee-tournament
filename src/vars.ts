import * as _ from "lodash";

export const PORT: number = _.defaultTo<number>(_.toNumber(process.env.PORT), 8080);
