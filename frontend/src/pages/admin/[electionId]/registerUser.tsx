import { GetServerSidePropsContext } from 'next';
import nookies from 'nookies';
import React, { FC, useEffect, useState } from 'react';
import { Election } from '../../../../../types';
import Form from '../../../components/Form/Form';
import FormField from '../../../components/Form/FormField';
import BasicLayout from '../../../components/Layout/BasicLayout';
import Button from '../../../components/UI/Button';
import { useRegisterUserForm } from '../../../hooks/useRegisterUserForm';

interface AdminRegisterUserPageProps {
    electionId: Election['id'];
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const cookies = nookies.get(ctx);

    if (!cookies.votingAppAuthAdmin)
        return { redirect: { destination: '/admin/login' } };

    const electionId = ctx.params!.electionId;

    if (!electionId) return { redirect: { destination: '/admin' } };

    return { props: { electionId } };
};

const AdminRegisterUserPage: FC<AdminRegisterUserPageProps> = ({
    electionId,
}) => {
    const form = useRegisterUserForm({ electionId });

    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        if (form.status === 'success' && !successMessage) {
            setSuccessMessage(true);
            window.setTimeout(() => setSuccessMessage(false), 10000);
        }
    }, [form.status, successMessage]);

    return (
        <BasicLayout>
            <div className="flex flex-col w-1/2 space-y-10">
                <h1 className="self-start text-3xl font-bold">
                    Register voter here
                </h1>
                <p>ElectionId: {electionId}</p>
                <Form form={form}>
                    <div className="space-y-6">
                        <FormField label="Name" name="name" required />
                        <FormField
                            label="Registrar ID"
                            name="registrarId"
                            required
                        />
                    </div>
                    <Button onClick={() => form.handleSubmit()} type="submit">
                        Register user
                    </Button>
                </Form>
            </div>
        </BasicLayout>
    );
};

export default AdminRegisterUserPage;
