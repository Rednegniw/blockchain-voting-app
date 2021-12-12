import { RadioGroup } from "@headlessui/react";
import { useFormik } from "formik";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { FC, useEffect, useState } from "react";
import CandidateRow from "../../../components/CandidateRow";
import BasicLayout from "../../../components/Layout/BasicLayout";
import Button from "../../../components/UI/Button";
import { Election } from "../../../types";
import axios from 'redaxios';
import { api } from "../../../services/request";
import Link from 'next/link'
import nookies from 'nookies'

interface ElectionPageProps {
  election: Election;
  voterId: string;
}

interface VoteFormValues {
  candidateId: string;
}

const elections: Election[] = [
  {
    id: "election1",
    candidates: [
      {
        id: "candidate1",
        name: "Jouda 1",
        photo_url: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
        description: "Je to fakt jouda",
      },
      {
        id: "candidate2",
        name: "Jouda 2",
        photo_url: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
        description: "Je to fakt jouda 2",
      },
      {
        id: "candidate3",
        name: "Jouda 3",
        photo_url: "https://cdn-icons-png.flaticon.com/512/147/147144.png",
        description: "Je to fakt jouda 3",
      },
    ],
    start_at: new Date().setDate(new Date().getDate - 1).toLocaleString(),
    end_at: new Date().setDate(new Date().getDate + 1).toLocaleString(),
  },
];


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const election = elections.find((election) => election.id === ctx.params!.id);
  const cookies = nookies.get(ctx)
  console.log('COOKIES BITCH', cookies)

  if (!election || !cookies.votingAppAuth) {
    return { redirect: { destination: "/" } };
  }

  return { props: { election, voterId: cookies.votingAppAuth } };
};

const ElectionPage: FC<ElectionPageProps> = ({ election, voterId }) => {
  const [successMessage, setSuccessMessage] = useState(false)

  const form = useFormik<VoteFormValues>({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: { candidateId: "" },
    onSubmit: async ({ candidateId }) => {
      const res = await axios.post(api('/castBallot'), {
        electionId: 'election1',
        voterId: voterId,
        picked: candidateId
      })

      if (res.status === 200) {
        alert('Vote has been cast successfully.')
      }
    },
    validate: ({ candidateId }) => {
      return {
        candidateId: !candidateId.length
          ? "You need to select a candidate"
          : undefined,
      };
    },
  });

  useEffect(() => {
    if (form.status === 'success' && !successMessage) {
        setSuccessMessage(true)
        window.setTimeout(() => setSuccessMessage(false), 10000)
      }
}, [form.status, successMessage]);

  return (
    <BasicLayout>
      <div className="flex flex-col w-1/2 space-y-10">
        <h1 className="self-start text-4xl font-bold">Available candidates</h1>
        <h3 className="self-start text-2xl font-bold">Your ID: {voterId}</h3>
        <RadioGroup
          value={form.values.candidateId}
          onChange={(value) => form.setFieldValue("candidateId", value)}
        >
          <div className="space-y-4">
            {election.candidates.map((candidate) => (
              <CandidateRow key={candidate.name} candidate={candidate} />
            ))}
          </div>
        </RadioGroup>
        <Button onClick={() => form.handleSubmit()} disabled={!form.isValid}>
          Submit vote
        </Button>
        { successMessage ? <span className="text-center text-green-600">You have successfully casted a vote!</span> : null}
      </div>
    </BasicLayout>
  );
};

export default ElectionPage;
