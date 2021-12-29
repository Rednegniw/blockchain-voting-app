import { GetServerSidePropsContext } from 'next';
import React, { FC } from 'react';
import nookies from 'nookies';
import Link from 'next/link';
import { filter } from 'lodash';
import BasicLayout from '../../components/Layout/BasicLayout';
import { Election } from '../../../../types';
import { getElections } from '../../services/request';
import ElectionRow from '../../components/ElectionRow';
import Button from '../../components/UI/Button';
import { isDateBeforeToday } from '../../../../utils/dates';

interface AdnminDashboardProps {
  elections: Election[];
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const cookies = nookies.get(ctx);

  console.log('COOKIES', cookies)

  if (!cookies.votingAppAuthAdmin) {
      console.log('RETURNING!');
    return { redirect: { destination: '/admin/login' } };
  }

  let elections = await getElections();
  elections = filter(elections, election => !isDateBeforeToday(election.endDate))

  return { props: { elections } };
};

const AdminDashboard: FC<AdnminDashboardProps> = ({ elections }) => {
  return (
    <BasicLayout>
      <div className="w-1/2 space-y-10">
        <div className="space-y-7">
          <div className="text-2xl font-bold">
            Hi admin!
          </div>
          <div className="text-xl font-bold">
            Here are your currently running elections:
          </div>
          {elections.map(election => (
            <ElectionRow election={election} key={election.id} />
          ))}
        </div>
        <div className="w-full px-8">
          <Link href="/admin/new" passHref>
            <Button>+ Create new election</Button>
          </Link>
        </div>
      </div>
    </BasicLayout>
  );
};

export default AdminDashboard;
