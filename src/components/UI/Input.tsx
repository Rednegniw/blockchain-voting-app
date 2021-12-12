import { ComponentPropsWithoutRef, FC } from "react";
import c from 'clsx'

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
    hasErrors: boolean
}

const Input: FC<InputProps> = ({ hasErrors, ...props }) => {
    return (
        <input type="text" className={c("w-full p-3 px-4 transition transform border border-gray-500 rounded-lg focus:border-blue-600", hasErrors && 'border-red-600')} { ...props } />
    );
}

export default Input;