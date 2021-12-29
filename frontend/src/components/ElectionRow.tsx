/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';
import c from 'clsx';
import Link from 'next/link';
import { Election } from '../../../types';
import Button from './UI/Button';

interface ElectionRowProps {
  election: Election;
}

const ElectionRow: FC<ElectionRowProps> = ({ election }) => {
  return (
    <div
      className={c(
        'flex items-center justify-between w-full p-4 space-x-4 border border-black rounded-xl cursor-pointer',
      )}
    >
      <div className="flex flex-col">
        <span className="text-lg font-bold">{election.name}</span>
        <span>
          {`${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}`}
        </span>
      </div>

      <Link href={`/admin/${election.id}/registerUser`} passHref>
        <div className="max-w-20">
          <Button data-test={`link-${election.id}`}>
            Register user for this election
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default ElectionRow;
