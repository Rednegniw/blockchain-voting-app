import * as Dialog from '@radix-ui/react-dialog';
import { useFormik } from 'formik';
import { FC } from 'react';
import Form from './Form/Form';
import FormField from './Form/FormField';
import FormTextArea from './Form/FormTextArea';
import Button from './UI/Button';

interface VotableItemFormValues {
  name: string;
  description: string;
}

interface VotableItemModalProps {
  onSubmit: (values: VotableItemFormValues) => void;
}

const VotableItemModal: FC<VotableItemModalProps> = ({
  children,
  onSubmit,
}) => {
  const form = useFormik<VotableItemFormValues>({
    validateOnChange: false,
    initialValues: {
      name: '',
      description: '',
    },
    onSubmit,
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 left-0 w-screen h-screen transition-opacity bg-black opacity-20" />
        <Dialog.Content
          className="fixed w-screen max-w-lg p-8 space-y-4 bg-white rounded-md shadow-md top-1/2 left-1/2"
          data-test="modal"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <Dialog.Title className="text-xl font-bold">
            Add votable item
          </Dialog.Title>
          <Form form={form}>
            <div className="space-y-5">
              <FormField label="Name of the votable item" name="name" required/>
              <FormTextArea
                label="Description of the votable item"
                name="description"
                required
              />
              <Dialog.Close asChild>
                <Button onClick={() => form.handleSubmit()} type="submit">Submit</Button>
              </Dialog.Close>
            </div>
          </Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default VotableItemModal;
