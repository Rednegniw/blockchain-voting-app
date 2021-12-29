import { Ballot, Election, Voter } from "../../../types";
import axios from "redaxios";
import { VotableItem } from "../../../types/index";
import { CastVoteArgs, CreateElectionArgs, CreateVoterArgs } from "../../../types/methods";

export const api = (url: string) => {
  return process.env.NEXT_PUBLIC_API_URL + url;
};

export const getElectionByVoterId = async (voterId: Voter["id"]) => {
  try {
    const result = await axios.get(api(`/getElection/?voterId=${voterId}`));

    return result.data as Election;
  } catch (err) {
    throw "Could not get current election.";
  }
};

export const getElectionStandings = async (electionId: Election["id"]) => {
  try {
    const result = await axios.post(api("/getCurrentStanding"), { electionId });

    return result.data as VotableItem[];
  } catch (err) {
    throw "Could not get current election standings.";
  }
};

export const getElectionWorldState = async (electionId: Election["id"]) => {
	try {
	  const result = await axios.get(api(`/getElectionWorldState?electionId=${electionId}`));
  
	  return result.data as (Election | VotableItem | Ballot)[];
	} catch (err) {
	  throw "Could not get current election world state.";
	}
  };

export const getBallotByVoterId = async (voterId: Voter["id"]) => {
  try {
    const result = await axios.post(api("/queryWithQueryString"), {
      query: { selector: { type: "ballot", voterId } },
    });

    const ballot: Ballot = result.data[0];

    return ballot;
  } catch (err) {
    throw "Could not get the voters ballot.";
  }
};

export const getElections = async () => {
	try {
	  const result = await axios.post(api("/queryWithQueryString"), {
		query: { selector: { type: "election" } },
	  });
  
	  return result.data as Election[];
	} catch (err) {
	  throw "Could not get the voters ballot.";
	}
  };

export const castBallot = async (values: CastVoteArgs) => {
	try {
	  const result = await axios.post(api('/castBallot'), values)
  
	  return result.data as Voter;
	} catch (err) {
	  throw "Could not cast the vote.";
	}
};

export const getVoter = async (id: Voter['id']) => {
	try {
	  const result = await axios.post(api(`/queryByKey`), { key: id })
  
	  return result.data as Voter;
	} catch (err) {
	  throw "Could not get the voter.";
	}
};

export const validateVoter = async (id: Voter['id']) => {
	try {
	  const result = await axios.get(api(`/validateVoter?id=${id}`))
  
	  return result.data as Voter;
	} catch (err) {
	  throw "Could not get the voter.";
	}
};

export const registerVoter = async (values: CreateVoterArgs) => {
	try {
	  const result = await axios.post(api(`/registerVoter`), values)
  
	  return result.data as { success: string };
	} catch (err) {
	  throw "Could not get the voter.";
	}
};

export const createElection = async (values: CreateElectionArgs) => {
	try {
	  const result = await axios.post(api('/createElection'), values)
  
	  return result.data as { success: string };
	} catch (err) {
	  throw "Could not get the voter.";
	}
};
