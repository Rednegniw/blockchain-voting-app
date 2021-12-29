import { ComponentPropsWithoutRef, FC } from 'react';
import c from 'clsx';

export interface TextAreaProps extends ComponentPropsWithoutRef<'textarea'> {
  hasErrors: boolean;
}

const TextArea: FC<TextAreaProps> = ({ hasErrors, ...props }) => {
  return (
    <textarea
      className={c(
        'w-full p-3 px-4 transition transform border border-gray-500 rounded-lg focus:border-blue-600',
        hasErrors && 'border-red-600'
      )}
      rows={3}
      {...props}
    />
  );
};

export default TextArea;
