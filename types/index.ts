export interface Voter {
    id: string
    registrarId: string
    name: string
    hasBallot: boolean
    type: 'voter'
    hasCastBallot?: boolean
    ballot?: string
}

export interface Election {
    id: string
    name: string
    startDate: string
    endDate: string
    votableItemIds: VotableItem['id'][]
    type: 'election'
}

export interface VotableItem {
    id: string
    description: string
    name: string
    voteCount: number
    type: 'votableItem'
}

export interface Ballot {
    id: string;
    electionId: Election['id']
    voterId: Voter['id']
    isCast: boolean
    type: 'ballot'
}