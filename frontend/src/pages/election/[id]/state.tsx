import { GetServerSidePropsContext } from 'next';
import { FC } from 'react';
import nookies from 'nookies';
import Link from 'next/link';
import {
  getElectionByVoterId,
  getElectionWorldState,
} from '../../../services/request';
import { Ballot, Election, VotableItem } from '../../../../../types';
import Button from '../../../components/UI/Button';

interface ElectionStatePageProps {
  data: (Election | VotableItem | Ballot)[];
  voterId: string;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const voterId = ctx.params!.id as string;

  if (!voterId) return { redirect: { destination: '/' } };

  const election = await getElectionByVoterId(voterId);

  // const isElectionOver = isDateBeforeToday(electionData.endDate)
  const isElectionOver = true;
  
  if (!isElectionOver)
    return { redirect: { destination: `/election/${voterId}` } };

  const data = await getElectionWorldState(election.id);

  const cookies = nookies.get(ctx);

  if (!data || !cookies.votingAppAuth)
    return { redirect: { destination: '/' } };

  return { props: { data, voterId } };
};

const ElectionStatePage: FC<ElectionStatePageProps> = ({ data, voterId }) => {
  return (
    <div className="flex flex-col justify-center w-screen max-w-6xl m-auto mt-10 space-y-10 text-center">
      <h1 className="text-3xl font-bold">
          This is the current world state of your election.
        </h1>
        <Link href={`/election/${voterId}/postvote`} passHref>
          <Button>
              Go back
          </Button>
        </Link>
        <code className="flex p-4 overflow-auto text-left bg-gray-200">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </div>
  );
};

export default ElectionStatePage;
