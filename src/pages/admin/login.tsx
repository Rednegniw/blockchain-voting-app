import React, { FC } from "react";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import BasicLayout from "../../components/Layout/BasicLayout";
import Button from "../../components/UI/Button";
import { useAdminLoginForm } from "./hooks/useAdminLoginForm";

const AdminLoginPage: FC = () => {
    const form = useAdminLoginForm()

    return (
        <BasicLayout>
      <div className="flex flex-col w-1/2 space-y-10">
        <h1 className="self-start text-3xl font-bold">Admin Login</h1>
        <Form form={form}>
          <div className="space-y-6">
            <FormField label="Email" name="email" required />
            <FormField
              label="Password"
              name="password"
              type="password"
              required
            />
          </div>
          <Button onClick={() => form.handleSubmit()} type="submit">Log In</Button>
        </Form>
      </div>
    </BasicLayout>
    );
}

export default AdminLoginPage;