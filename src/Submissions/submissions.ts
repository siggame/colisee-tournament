import { db } from "@siggame/colisee-lib";
import { QueryBuilder } from "knex";
import * as winston from "winston";
import { getTeamIds } from "../Teams";

interface ISubmissionFilter {
    status: db.SUBMISSION_STATUS_TYPE;
}

export function getSubmissions(filter: ISubmissionFilter, team_ids: number[]) {
    return new Promise<db.Submission[]>((res, rej) => {
        db.connection.from((query: QueryBuilder) => {
            return query.from("submissions")
                .select("team_id as teamId", db.connection.raw("max(version) as recent_version"))
                .where(filter)
                .whereIn("team_id", team_ids)
                .groupBy("teamId")
                .as("recent_subs");
        }).join("submissions as subs", function () {
            this.on({ "subs.team_id": "recent_subs.teamId" }).andOn({ "subs.version": "recent_subs.recent_version" });
        }).select("*")
            .then(db.rowsToSubmissions)
            .then(res)
            .catch(rej);
    }).catch((error) => { winston.error("Most recent eligible team submissions failed"); throw error; });
}

export function getEligibleSubmissions() {
    return getTeamIds({ is_eligible: true })
        .then((eligibleTeamIds) => {
            return getSubmissions({ status: "finished" }, eligibleTeamIds);
        }).catch((error) => {
            winston.error("unable to get eligible submissions");
            winston.error(error);
            throw error;
        });
}
