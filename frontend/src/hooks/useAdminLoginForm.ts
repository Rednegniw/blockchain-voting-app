import { useFormik, FormikErrors } from "formik";
import axios from 'redaxios'
import { setCookie } from "nookies";
import router from "next/router";

export interface AdminLoginFormValues {
  email: string,
  password: string,
}

export const useAdminLoginForm = () => {
  return useFormik<AdminLoginFormValues>({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
      email: '',
      password: ''
    },
    validate: (values) => {
      const errors: FormikErrors<AdminLoginFormValues> = {};

      if (!values.email.length) errors.email = "Field is required";
      if (!values.password.length) errors.password = "Field is required";

      return errors;
    },
    onSubmit: async ({ email, password }, { setStatus }) => {
      const result = await axios.post('/api/authenticateAdmin', { email, password }).catch((err) => {
        console.log('ERROR', err)
        alert('User is forbidden')
      });

      console.log(result)
      if (result?.status === 200) {
        setStatus('success')
        setCookie(null, 'votingAppAuthAdmin', 'true', { path: '/' })
        
        console.log('PUSHING')
        router.push('/admin')
      }
    },
  });
};
