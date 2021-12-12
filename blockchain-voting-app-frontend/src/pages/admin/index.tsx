import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { FC } from "react";
import BasicLayout from "../../components/Layout/BasicLayout";
import nookies from 'nookies'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const cookies = nookies.get(ctx)
    console.log('COOKIES BITCH', cookies)
  
    if (!cookies.votingAppAuthAdmin) {
      return { redirect: { destination: "/admin/login" } };
    }
  
    return { props: {} };
};

const AdminDashboard: FC = () => {
    return (
        <BasicLayout>
            This is the admin dashboard page
        </BasicLayout>
    );
}

export default AdminDashboard;