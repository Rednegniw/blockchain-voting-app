import { get } from 'lodash'
import c from 'clsx'

export interface ErrorMessageProps {
	name: string
	errors: any
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ name, errors }) => {
	const error = get(errors, name)

	if (error) {
		return (
			<div
				className={c('text-sm block text-left text-red-500 font-text')}
				data-test={`${name}-error`}
			>
				{error}
			</div>
		)
	}
	return null
}

export default ErrorMessage
