import { Election, VotableItem, Voter } from ".";

export interface CreateVoterArgs {
    electionId: Election['id'],
    registrarId: string,
    name: string
}

export interface CastVoteArgs {
    picked: VotableItem['id']
    voterId: Voter['id']
    electionId: Election['id']
}

export interface CreateElectionArgs {
    votableItems: Partial<VotableItem>[]
    name: Election['name']
    startDate: Election['startDate']
    endDate: Election['endDate']
}

export interface GetElectionResponse extends Election {
    votableItems: VotableItem[]
}