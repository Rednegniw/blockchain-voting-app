import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import nookies from 'nookies';
import { FC } from 'react';
import axios from 'redaxios';
import { Ballot, Election } from '../../../../../types';
import postVoteSvg from '../../../../public/postvotescreen.svg';
import BasicLayout from '../../../components/Layout/BasicLayout';
import Button from '../../../components/UI/Button';
import { api, getBallotByVoterId } from '../../../services/request';

interface ElectionPostVotingPageProps {
  electionData: Election;
  voterId: string;
  ballot: Ballot;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const voterId = ctx.params!.id as string;
  if (!voterId) return { redirect: { destination: '/' } };

  const electionData = (
    await axios.get(api(`/getElection/?voterId=${voterId}`))
  ).data;
  const ballot = await getBallotByVoterId(voterId);

  const cookies = nookies.get(ctx);

  // If the election does not exist or the voter is not authorized
  if (!electionData || !cookies.votingAppAuth)
    return { redirect: { destination: '/' } };

  // If ballot is not cast, return voter to the election page to vote
  if (!ballot.isCast)
    return { redirect: { destination: `/election/${voterId}` } };

  return { props: { electionData, voterId, ballot } };
};

const ElectionPostVotingPage: FC<ElectionPostVotingPageProps> = ({
  electionData,
  ballot,
  voterId,
}) => {
  const isElectionOver = true;
  // const isElectionOver = useMemo(
  //   () => isDateBeforeToday(electionData.endDate),
  //   [electionData]
  // );

  return (
    <BasicLayout>
      <div className="flex flex-col items-center max-w-4xl space-y-8 text-center">
        <Image alt="graphic" height={300} src={postVoteSvg} width={400} />
        <div className="flex flex-col space-y-3">
          <h1 className="text-3xl font-bold" data-test="postvote-header">Your vote has been counted.</h1>
          <p>Here is your ballot as it is written in the database.</p>
        </div>
        <code className="p-4 text-left bg-gray-100">
          <pre>{JSON.stringify(ballot, null, 2)}</pre>
        </code>
        {!isElectionOver ? (
          <p>
            The current election will end at{' '}
            {new Date(electionData.endDate).toLocaleDateString()}.
            <br />
            You will then be able to see election results.
          </p>
        ) : (
          <>
            <p className="text-xl">
              Thank you! The current election has ended. Please click below to
              see the election results.
            </p>
            <Link href={`/election/${voterId}/standings`} passHref>
              <Button>See election results</Button>
            </Link>
            <Link href={`/election/${voterId}/state`} passHref>
              <Button>See unformatted world state</Button>
            </Link>
          </>
        )}
      </div>
    </BasicLayout>
  );
};

export default ElectionPostVotingPage;
