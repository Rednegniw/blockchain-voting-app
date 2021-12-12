/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import Image from "next/image";
import { RadioGroup } from "@headlessui/react";
import c from "clsx";
import { Candidate } from "../types";

interface CandidateRowProps {
  candidate: Candidate;
}

const CandidateRow: FC<CandidateRowProps> = ({ candidate }) => {
  return (
    <RadioGroup.Option value={candidate.id}>
      {({ checked }) => (
        <div
          className={c(
            "flex items-center w-full p-4 space-x-4 border border-black rounded-xl cursor-pointer",
            "hover:bg-black hover:text-white transform transition",
            checked && "bg-black text-white"
          )}
        >
          <img
            src={candidate.photo_url}
            alt={candidate.name}
            className="w-10 rounded-full"
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
