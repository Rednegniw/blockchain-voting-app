import { FormikContextType } from "formik";
import { createContext, FC } from "react";

type FormProps = { form: FormikContextType<any> }
type FormType = FC<FormProps>

export const FormContext = createContext<FormikContextType<any> | null>(null)

const Form: FormType = ({ form, children }) => {
    return (
        <FormContext.Provider value={form}>
            { children }
        </FormContext.Provider>
    );
}

export default Form