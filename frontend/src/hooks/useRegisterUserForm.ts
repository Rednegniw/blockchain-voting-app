import { FormikErrors, useFormik } from 'formik';
import { useRouter } from 'next/router';
import axios from 'redaxios';
import { Election, Voter } from '../../../types';
import { api } from '../services/request';

interface RegisterUserFormValues {
  name: Voter['name'];
  registrarId: Voter['registrarId'];
  electionId: Election['id'];
}

interface RegisterUserFormProps {
  electionId: Election['id'];
}

export const useRegisterUserForm = ({ electionId }: RegisterUserFormProps) => {
  const router = useRouter();

  return useFormik<RegisterUserFormValues>({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
      name: '',
      registrarId: '',
      electionId,
    },
    validate: values => {
      const errors: FormikErrors<RegisterUserFormValues> = {};

      if (!values.name.length) errors.name = 'Field is required';
      if (!values.registrarId.length) errors.registrarId = 'Field is required';

      return errors;
    },
    onSubmit: async (values, { setStatus }) => {
      const result = await axios.post(api('/registerVoter'), values);

      if (result.status === 200) {
        setStatus('success');
        router.push('/admin');
      }
    },
  });
};
