import { ComponentPropsWithoutRef, FC } from 'react';
import c from 'clsx';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {}

const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className={c(
        'w-full p-3 px-4 font-bold text-white transition transform bg-black border border-black rounded-lg hover:bg-white hover:text-black',
        'disabled:bg-gray-400 disabled:border-gray-400 disabled:pointer-events-none'
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
