import React, { FC, useEffect, useState } from "react";
import BasicLayout from "../../components/Layout/BasicLayout";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/UI/Button";
import { useRegisterUserForm } from "./hooks/useRegisterUserForm";
import Link from 'next/link'
import { GetServerSidePropsContext } from "next";
import nookies from 'nookies'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const cookies = nookies.get(ctx)
    console.log('COOKIES BITCH', cookies)
  
    if (!cookies.votingAppAuthAdmin) {
      return { redirect: { destination: "/admin/login" } };
    }
  
    return { props: {} };
};

const AdminRegisterUserPage: FC = () => {
  const form = useRegisterUserForm();

  const [successMessage, setSuccessMessage] = useState(false)

  useEffect(() => {
      if (form.status === 'success' && !successMessage) {
          setSuccessMessage(true)
          window.setTimeout(() => setSuccessMessage(false), 10000)
        }
  }, [form.status, successMessage]);

  return (
    <BasicLayout>
      <div className="flex flex-col w-1/2 space-y-10">
        <h1 className="self-start text-3xl font-bold">Register voter here</h1>
        <Form form={form}>
          <div className="space-y-6">
            <FormField label="Name" name="name" required />
            <FormField
              label="Registrar ID"
              name="registrarId"
              required
            />
          </div>
          <Button onClick={() => form.handleSubmit()}>Register user</Button>
        </Form>
        { successMessage ? <span className="text-center text-green-600">User was successfully registered. They can sign in <Link href="/app">here</Link> with voter id <b>{form.values.voterId}</b>.</span> : null}
      </div>
    </BasicLayout>
  );
};

export default AdminRegisterUserPage;
