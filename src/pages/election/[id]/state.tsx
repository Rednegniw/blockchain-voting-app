import { GetServerSidePropsContext } from "next";
import { FC } from "react";
import BasicLayout from "../../../components/Layout/BasicLayout";
import axios from 'redaxios'
import nookies from 'nookies'
import { api } from "../../../services/request";

interface ElectionStatePageProps {
    electionData: any,
    voterId: string
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const electionData = (await axios.get(api('/queryAll'))).data

    const cookies = nookies.get(ctx)
  
    if (!electionData || !cookies.votingAppAuth) {
      return { redirect: { destination: "/" } };
    }
  
    return { props: { electionData, voterId: cookies.votingAppAuth } };
  };

const ElectionStatePage: FC<ElectionStatePageProps> = ({ electionData }) => {
    return (
        <BasicLayout>
            <div className="max-w-4xl space-y-10">
                {electionData.map((entry: any) => (
                    <div className="space-y-4" key={entry.Key}>
                        <p className="font-bold">{JSON.stringify(entry.Key, null, 2)}</p>
                        <p className="whitespace-normal">{JSON.stringify(entry.Record, null, 2)}</p>
                    </div>
                ))}
            </div>
        </BasicLayout>
    );
}

export default ElectionStatePage;