/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';
import { RadioGroup } from '@headlessui/react';
import c from 'clsx';
import { VotableItem } from '../../../types'

interface CandidateRowProps {
  candidate: VotableItem;
}

const CandidateRow: FC<CandidateRowProps> = ({ candidate }) => {
  return (
    <RadioGroup.Option value={candidate.id}>
      {({ checked }) => (
        <div
          className={c(
            'flex items-center w-full p-4 space-x-4 border border-black rounded-xl cursor-pointer',
            'hover:bg-black hover:text-white transform transition',
            checked && 'bg-black text-white'
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
      )}
    </RadioGroup.Option>
  );
};

export default CandidateRow;
