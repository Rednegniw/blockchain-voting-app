import { RadioGroup } from '@headlessui/react';
import { useFormik } from 'formik';
import { GetServerSidePropsContext } from 'next';
import { FC, useEffect, useState } from 'react';
import nookies from 'nookies'
import router from 'next/dist/client/router';
import CandidateRow from '../../../components/CandidateRow';
import BasicLayout from '../../../components/Layout/BasicLayout';
import Button from '../../../components/UI/Button';
import { castBallot, getElectionByVoterId, getVoter } from '../../../services/request';
import { GetElectionResponse as Election, CastVoteArgs } from '../../../../../types/methods'

interface ElectionPageProps {
  election: Election;
  voterId: string;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const voterId = ctx.params!.id as string
  const election = await getElectionByVoterId(voterId)
  const voter = await getVoter(voterId)

  if (voter.hasCastBallot) {
    return { redirect: { destination: `/election/${voterId}/postvote` }}
  }
  
  const cookies = nookies.get(ctx)

  if (!election || !cookies.votingAppAuth) {
    return { redirect: { destination: '/' } };
  }

  return { props: { election, voterId } };
};

const ElectionPage: FC<ElectionPageProps> = ({ election, voterId }) => {
  const [successMessage, setSuccessMessage] = useState(false)

  const form = useFormik<CastVoteArgs>({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: { picked: '', electionId: election.id, voterId },
    onSubmit: async values => {
      const res = await castBallot(values)

      if (res.hasCastBallot) {
        alert('Vote has been cast successfully.')
        router.push(`/election/${voterId}/postvote`)
      }
    }
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
          onChange={value => form.setFieldValue('picked', value)}
          value={form.values.picked}
        >
          <div className="space-y-4">
            {election.votableItems.map(candidate => (
              <CandidateRow candidate={candidate} key={candidate.name} />
            ))}
          </div>
        </RadioGroup>
        <Button data-test="submit" disabled={!form.isValid} onClick={() => form.handleSubmit()}>
          Submit vote
        </Button>
        { successMessage ? <span className="text-center text-green-600">You have successfully casted a vote!</span> : null}
      </div>
    </BasicLayout>
  );
};

export default ElectionPage;
