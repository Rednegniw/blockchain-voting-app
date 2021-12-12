import { useFormik, FormikErrors } from "formik";
import axios from 'redaxios'
import { setCookie } from "nookies";
import { useRouter } from "next/dist/client/router";

export interface AdminLoginFormValues {
  email: string,
  password: string,
}

export const useAdminLoginForm = () => {
  const router = useRouter()

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
        setCookie(null, 'votingAppAuthAdmin', 'true')
        router.push('/admin')
      }
    },
  });
};
