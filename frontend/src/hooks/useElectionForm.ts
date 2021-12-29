import { FormikErrors, useFormik } from 'formik';
import { useRouter } from 'next/router';
import { VotableItem } from '../../../types';
import { createElection } from '../services/request';

export interface ElectionFormValues {
    name: string;
    startDate: Date;
    endDate: Date;
    votableItems: VotableItem[];
}

export const useElectionForm = () => {
    const router = useRouter();

    return useFormik<ElectionFormValues>({
        validateOnChange: false,
        validateOnBlur: false,
        initialValues: {
            name: '',
            startDate: new Date(),
            endDate: new Date(),
            votableItems: [],
        },
        validate: values => {
            const errors: FormikErrors<ElectionFormValues> = {};

            if (!values.name.length) errors.name = 'Field is required';
            if (!values.votableItems.length)
                errors.votableItems = 'At least one candidate is required';

            return errors;
        },
        onSubmit: async values => {
            const createElectionProps = {
                ...values,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
            };

            const result = await createElection(createElectionProps);

            if (result.success) {
                console.log(result);
                router.push('/admin');
            }
        },
    });
};
