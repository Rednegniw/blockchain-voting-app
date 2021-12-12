import type { NextPage } from "next";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import { setCookie } from "nookies";
import { useState } from "react";
import axios from 'redaxios';
import BasicLayout from "../components/Layout/BasicLayout";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import { api } from "../services/request";

const Home: NextPage = () => {
  const [input, setInput] = useState("");
  const router = useRouter()

  const authenticate = async () => {
    if (input.length) {
      const res = await axios.post(api('/validateVoter'), { id: input })

      if (res.status === 200 && !res.data.error) {
        setCookie(null, "votingAppAuth", input);
        router.push('/election/election1')
      }
      
    } else {
      alert('ID field is required')
    }
  };

  return (
    <>
      <Head>
        <title>Blockchain voting app</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <BasicLayout>
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">
            Welcome to the blockchain voting app!
          </h1>
          <p>Please put in your id you received to vote:</p>
          <Input
            hasErrors={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="For example: dsf35dsfe521."
          />
          <Button onClick={authenticate}>Submit</Button>
        </div>
      </BasicLayout>
    </>
  );
};

export default Home;
