import { useFormik, FormikErrors } from "formik";
import { getRandomNumberBetween } from "../../../services/misc";
import { api } from "../../../services/request";
import axios from 'redaxios'

interface RegisterUserFormValues {
  name: string;
  registrarId: string;
  voterId: string;
}

export const useRegisterUserForm = () => {
  return useFormik<RegisterUserFormValues>({
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: {
      name: "",
      registrarId: "",
      voterId: getRandomNumberBetween(100000, 100000000).toString(),
    },
    validate: (values) => {
      const errors: FormikErrors<RegisterUserFormValues> = {};

      if (!values.name.length) errors.name = "Field is required";
      if (!values.registrarId.length) errors.registrarId = "Field is required";

      return errors;
    },
    onSubmit: async ({ name, registrarId, voterId }, { setStatus }) => {
      const requestData = {
        name,
        registrarId,
        voterId,
      };

      console.log("REQUEST", requestData);

      const result = await axios.post(api("/registerVoter"), requestData);

      if (result.status === 200) {
        setStatus('success')
      }

      console.log("RESULT", result);
    },
  });
};
