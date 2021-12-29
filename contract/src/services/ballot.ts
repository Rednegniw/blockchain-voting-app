import { Context } from "fabric-contract-api";
import { objectToByteArray } from "../../../utils";
import { Election, Voter, Ballot } from "../../../types";
import { generateId } from '../../../utils/index';

export const generateBallot = async (
    ctx: Context,
    election: Election,
    voter: Voter
) => {
    let ballot: Ballot = {
        id: generateId(),
        electionId: election.id,
        voterId: voter.id,
        isCast: false,
        type: 'ballot',
    };

    voter.ballot = ballot.id;
    voter.hasBallot = true;

    await ctx.stub.putState(ballot.id, objectToByteArray(ballot));
    await ctx.stub.putState(voter.id, objectToByteArray(voter));
}