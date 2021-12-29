import { FC } from 'react';
import nookies from 'nookies';
import { GetServerSidePropsContext } from 'next';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import Link from 'next/link';
import BasicLayout from '../../../components/Layout/BasicLayout';
import { getElectionByVoterId, getElectionStandings } from '../../../services/request';
import { VotableItem, Voter } from '../../../../../types';
import Button from '../../../components/UI/Button';

interface StandingsPageProps {
  standings: VotableItem[];
  voterId: Voter['id']
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const voterId = ctx.params!.id as string;

  if (!voterId) return { redirect: { destination: '/' } };

  const election = await getElectionByVoterId(voterId)
  const standings = await getElectionStandings(election.id)

  // If election is not over, return them to the election page.
  // const isElectionOver = isDateBeforeToday(electionData.endDate)
  const isElectionOver = true;
  if (!isElectionOver) return { redirect: { destination: `/election/${voterId}` } };

  const cookies = nookies.get(ctx);

  if (!election || !cookies.votingAppAuth) {
    return { redirect: { destination: '/' } };
  }

  return { props: { standings, voterId } };
};

const StandingsPage: FC<StandingsPageProps> = ({ standings, voterId }) => {
  const data = standings

  return (
    <BasicLayout>
      <div className="space-y-8 text-center">
        <h1 className="text-3xl font-bold">
          These are the current election standings:
        </h1>
        <BarChart
          data={data}
          height={400}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          width={600}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="voteCount" fill="black" />
        </BarChart>
        <Link href={`/election/${voterId}/postvote`} passHref>
          <Button>
              Go back
          </Button>
        </Link>
      </div>
    </BasicLayout>
  );
};

export default StandingsPage;
