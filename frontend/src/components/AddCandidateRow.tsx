/* eslint-disable @next/next/no-img-element */
import c from 'clsx';
import { FC } from 'react';
import { VotableItem } from '../../../types';

interface CandidateRowProps {
  candidate: VotableItem;
}

const AddCandidateRow: FC<CandidateRowProps> = ({ candidate }) => {
  return (
 
        <div
          className={c(
            'flex items-center w-full p-4 space-x-4 border border-black rounded-xl',
          )}
          data-test={candidate.id}
        >
          <img
            alt={candidate.name}
            className="w-10 rounded-full"
            src="https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/68.png"
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold">{candidate.name}</span>
            <span>{candidate.description}</span>
          </div>
        </div>
  );
};

export default AddCandidateRow;
