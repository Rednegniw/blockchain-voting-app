import { Context } from "fabric-contract-api";
import { elections } from "./data/elections";
import { votableItems } from "./data/votableItems";
import { voters } from "./data/voters";
import { Contract } from "fabric-contract-api";
import { Ballot, Election, VotableItem, Voter } from '../../types'
import {
    decodeAndParse,
    generateId,
    objectToByteArray,
} from "../../utils";
import {
    isDateBeforeOtherDate,
    isDateBeforeToday
} from "../../utils/dates";
import { generateBallot } from "./services/ballot";
import { filter, find, first, map } from "lodash";
import { addToState } from "./misc/fabric";
import {
    CastVoteArgs,
    CreateElectionArgs,
    CreateVoterArgs,
} from "../../types/methods";

export class VoterContract extends Contract {
    /**
     * Initializes the smart contract with default data.
     *
     * @param {Context} ctx - Hyperledger context
     * @memberof VoterContract
     */
    async init(ctx: Context) {
        let election: Election;

        let currElections: Election[] = await this.queryByObjectType(
            ctx,
            "election"
        );

        if (!currElections.length) {
            election = first(elections);

            await addToState(ctx, election.id, election);
        } else {
            election = currElections[0];
        }

        // Assign all the voters to the blockchain
        for (const voter of voters) {
            const voterExists = await this.myAssetExists(ctx, voter.id);

            if (!voterExists) {
                await generateBallot(ctx, election, voter);
            }
        }

        for (const votableItem of votableItems) {
            const votableItemExists = await this.myAssetExists(ctx, votableItem.id);

            if (!votableItemExists) {
                await addToState(ctx, votableItem.id, votableItem);
            }
        }

        return voters;
    }

    /**
     * Creates an election by providing election parameters.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} args - stringified {CreateElectionArgs} type, election parameters.
     * @return {*} - success message or error message. 
     * @memberof VoterContract
     */
    async createElection(ctx: Context, args: string) {
        const { votableItems, name, startDate, endDate }: CreateElectionArgs =
            JSON.parse(args);

        // Validate the request

        if ( isDateBeforeToday(startDate) || !isDateBeforeOtherDate(startDate, endDate) )
            return { error: "An election cannot start in the past and start date must be before end date.", };

        for (const votableItem of votableItems) {
            if ( !votableItem?.description?.length || !votableItem?.name?.length )
                return { error: "There is an error with the format of one of the votable items.", };
        }

        // Generate the votable item ids
        const mappedVotableItems = map(votableItems, votableItem => ({
            ...votableItem,
            type: "votableItem",
            voteCount: 0,
            id: generateId(),
        }))

        // Create the election
        const election: Election = {
            id: generateId(),
            votableItemIds: map(mappedVotableItems, "id"),
            name,
            startDate,
            endDate,
            type: "election",
        };

        // Add the necessary election and votable items into state

        await addToState(ctx, election.id, election);

        for (const votableItem of mappedVotableItems) {
            await addToState(ctx, votableItem.id, votableItem);
        }

        // Return the election that we created.

        return { success: 'The election has been added' }
    }

    /**
     * Get votable items from election to get their standings
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {Election["id"]} electionId - id of the election we want the votable items from
     * @return {VotableItem[]} - votable items from the election 
     * @memberof VoterContract
     */
     async getVotablesByElectionId(ctx: Context, electionId: Election["id"]) {
        const queryResult: VotableItem[] = await this.queryByObjectType(ctx, "votableItem")
        const election: Election = await this.readMyAsset(ctx, electionId)

        if (!queryResult.length || !election)
            return { error: "The election doesn't exist." };

        const votableItemsFromElection = filter(queryResult, votableItem => election.votableItemIds.includes(votableItem.id))

        return votableItemsFromElection;
    }

    /**
     * Finds an election by the id of the voter. Every voter is specific to an election.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {Voter["id"]} voterId - id of the voter whose election we want to get
     * @return {Election} - the election that we want to get.
     * @memberof VoterContract
     */
    async getElectionByVoterId(ctx: Context, voterId: Voter["id"]) {
        const queryResult = await this.queryWithQueryString( ctx, JSON.stringify({ selector: { type: "ballot", voterId, } }) )
        const voterBallot: Ballot = queryResult[0]

        if (!voterBallot)
            return { error: "This voter does not have any ballots." };

        const election = await this.readMyAsset(ctx, voterBallot.electionId);

        const votableItems = [];

        for (const votableItemId of election.votableItemIds) {
            const votableItem = await this.readMyAsset(ctx, votableItemId);
            votableItems.push(votableItem);
        }

        return { ...election, votableItems };
    }

    /**
     * Creates a voter for a specific election. Voter must provide a registrarId which must be unique.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {CreateVoterArgs} args - stringified, voter creation parameters parameters.
     * @return {*} - success message or error message. 
     * @memberof VoterContract
     */
    async createVoter(ctx: Context, args: string) {
        const { name, registrarId, electionId }: CreateVoterArgs =
            JSON.parse(args);

        const voterExists = await this.queryWithQueryString( ctx, JSON.stringify({ selector: { type: "voter", registrarId }}))
        if (voterExists.length)
            return { error: "Voter already exists under the same registrar id." };

        const currElections: Election[] = await this.queryByObjectType(
            ctx,
            "election"
        );

        const election = find(currElections, { id: electionId });

        if (!election)
            return { error: "The election you specified does not exist." };

        const newVoter: Voter = {
            id: generateId(),
            registrarId,
            name,
            hasBallot: false,
            type: "voter",
        };

        // Autorizace vs autentifikace

        //update state with new voter
        await addToState(ctx, newVoter.id, newVoter);

        //generate ballot with the given votableItems
        await generateBallot(ctx, election, newVoter);

        return {
            success: `Voter with voterId ${newVoter.id} is updated in the world state`,
        };
    }

    /**
     * Deletes a voter and his ballot.
     * 
     * @remarks
     * Currently only used for testing.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} voterId - id of the voter to delete
     * @memberof VoterContract
     */
    async deleteVoter(ctx: Context, voterId: Voter["id"]) {
        const voter: Voter = await this.readMyAsset(ctx, voterId);

        if (!voter) {
            throw new Error(`The voter does not exist`);
        }

        await ctx.stub.deleteState(voterId);
        await ctx.stub.deleteState(voter.ballot);
    }

    /**
     * Deletes any asset from the ledger by providing its id.
     * 
     * @remarks
     * Currently only used for testing.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} id - id of the asset to delete.
     * @memberof VoterContract
     */
    async deleteMyAsset(ctx: Context, id: string) {
        const exists = await this.myAssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset with id ${id} does not exist`);
        }

        await ctx.stub.deleteState(id);
    }

    /**
     * Gets any asset from the ledger by id and returns it as a JS object.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} id - id of the asset to get
     * @returns {object} - the asset as a JavaScript object
     * @memberof VoterContract
     */
    async readMyAsset(ctx: Context, id: string) {
        const exists = await this.myAssetExists(ctx, id);

        if (!exists) return { error: `The asset ${id} does not exist` };

        const buffer = await ctx.stub.getState(id);

        return decodeAndParse(buffer);
    }

    /**
     * Checks whether an asset exists in the ledger or not.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} id - id of the asset to confirm existence of
     * @returns {boolean} - whether or not the asset exists
     * @memberof VoterContract
     */
    async myAssetExists(ctx: Context, id: string) {
        const buffer = await ctx.stub.getState(id);
        return !!buffer && buffer.length > 0;
    }

    /**
     * Casts vote for a voter and writes it into the ledger.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {CastVoteArgs} args - stringified, information to provide the info to cast a vote.
     * @returns {Voter | { error: string }} - returns either the voter or an error message.
     * @memberof VoterContract
     */
    async castVote(ctx: Context, args: string) {
        const {
            picked: votableItemId,
            voterId,
            electionId,
        }: CastVoteArgs = JSON.parse(args);

        const electionExists = await this.myAssetExists(ctx, electionId);

        if (!electionExists) return { error: "This election does not exist." };

        const election: Election = await this.readMyAsset(ctx, electionId);
        const voter: Voter = await this.readMyAsset(ctx, voterId);
        const ballot: Ballot = await this.readMyAsset(ctx, voter.ballot);

        if (voter.hasCastBallot || ballot.isCast)
            return { error: "This voter has voted already." };

        //check the date of the election, to make sure the election is still open
        const currentTime = new Date();

        //parse date objects
        const parsedCurrentTime = Date.parse(currentTime.toISOString());
        const electionStart = Date.parse(election.startDate);
        const electionEnd = Date.parse(election.endDate);

        //only allow vote if the election has started
        if (
            parsedCurrentTime >= electionStart &&
            parsedCurrentTime < electionEnd
        ) {
            let votableInElection = find(
                election.votableItemIds,
                (item) => item === votableItemId
            );

            if (!votableInElection)
                return {
                    error: "This candidate does not exist in the election you specified.",
                };

            let votableItem: VotableItem = await this.readMyAsset(
                ctx,
                votableItemId
            );

            // Increase the vote count
            votableItem.voteCount++;
            await ctx.stub.putState(
                votableItemId,
                objectToByteArray(votableItem)
            );

            // Mark the voter as having voted
            voter.hasCastBallot = true;
            await ctx.stub.putState(voter.id, objectToByteArray(voter));

            ballot.isCast = true
            await ctx.stub.putState(ballot.id, objectToByteArray(ballot));

            return voter;
        } else {
            return {
                error: "This election is not open right now.",
            };
        }
    }

    /**
     * Gets the whole world state.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @returns {any[]} - returns an array of every asset in the world state.
     * @memberof VoterContract
     */
    async queryAll(ctx: Context) {
        let queryString = {
            selector: {},
        };

        let queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );

        return queryResults;
    }

    /**
     * Gets assets that correspond to the query string (with a predefined format.)
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} queryString - a query string, needs to be a stringified JSON
     * @returns {any[]} - returns an array of assets corresponding to the query.
     * @memberof VoterContract
     */
    async queryWithQueryString(ctx: Context, queryString: string) {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);

        let allResults = [];

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value) {
                allResults = [...allResults, decodeAndParse(res.value.value)];
            }

            if (res.done) {
                await resultsIterator.close();
                return allResults;
            }
        }
    }

    /**
     * Gets assets that correspond to a certain object type, such as voter.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {string} objectType - an object type, such as 'voter' or 'votableItem'
     * @returns {any[]} - returns an array of assets corresponding to the object type.
     * @memberof VoterContract
     */
    async queryByObjectType(ctx: Context, objectType: string) {
        let queryString = {
            selector: {
                type: objectType,
            },
        };

        let queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );

        return queryResults;
    }

    /**
     * Deletes the current world state.
     * 
     * @remarks
     * Currently only used for testing.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @memberof VoterContract
     */
    async restartWorldState(ctx: Context) {
        const queryAllResult = await this.queryAll(ctx);

        const ids: string[] = map(queryAllResult, "id");

        for (const id of ids) {
            await this.deleteMyAsset(ctx, id);
        }
    }

    /**
     * Gets the information about the election that we can display to the user.
     *
     * @param {Context} ctx - context of the fabric contract api
     * @param {Election['id']} electionId - id of the election we wish to get the world state of
     * @return {*} 
     * @memberof VoterContract
     */
    async getElectionWorldState (ctx: Context, electionId: Election['id']) {
        // Get election
        const election: Election = await this.readMyAsset(ctx, electionId);

        if (!isDateBeforeToday(election.endDate))
            return { error: 'Election has not ended yet.' }

        // Get ballots
        const ballots: Ballot[] = await this.queryWithQueryString(ctx, JSON.stringify({
            selector: {
                type: 'ballot',
                electionId
            }
        }))

        // Get votable items
        const votableItems: VotableItem[] = []

        for (const votableItemId of election.votableItemIds) {
            const votableItem = await this.readMyAsset(ctx, votableItemId);
            votableItems.push(votableItem);
        }

        return [ election, ...ballots, ...votableItems ]
    }
}

module.exports = VoterContract;
