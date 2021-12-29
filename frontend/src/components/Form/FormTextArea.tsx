import { get } from 'lodash'
import React from 'react'
import { FC } from 'react'
import TextArea, { TextAreaProps } from '../UI/TextArea'
import ErrorMessage, { ErrorMessageProps } from './ErrorMessage'
import { useFormContext } from './hooks/useFormContext'
import Label, { LabelProps } from './Label'

export interface FormFieldProps extends Omit<TextAreaProps, 'hasErrors'> {
	label: string
	name: string
	errorMessageProps?: Partial<ErrorMessageProps>
	labelProps?: Partial<LabelProps>
}

const FormTextArea: FC<FormFieldProps> = ({ label, name, errorMessageProps, required, labelProps, ...props }) => {
	const form = useFormContext()

	return (
		<Label label={label} required={required} { ...labelProps }>
			<TextArea
				{...form.getFieldProps(name)}
				{...props}
                hasErrors={!!get(form.errors, name)}
				onChange={e => {
					form.setFieldValue(name, e.target.value)
					form.setFieldError(name, '')
				}}
				onKeyUp={event => {
					if ( event.key === 'Enter' ) form.handleSubmit()
				}}
			/>
			<ErrorMessage errors={form.errors} name={name} { ...errorMessageProps } />
		</Label>
	)
}

export default FormTextArea
