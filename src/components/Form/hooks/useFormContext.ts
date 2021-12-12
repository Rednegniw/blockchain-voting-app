import { useContext } from 'react';
import { FormContext } from '../Form';

export const useFormContext = () => {
    const form = useContext(FormContext)

    if (!form) {
        throw Error('Form Field needs to be a child of <Form>')
    }

    return form
}