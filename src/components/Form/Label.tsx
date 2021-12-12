import c from 'clsx'

export interface LabelProps {
	label: string
	required?: boolean
	labelClassName?: string
    labelTextClassName?: string
}

const Label: React.FC<LabelProps> = ({ children, label, required = false, labelClassName = '', labelTextClassName }) => {
	return (
		<label className={c('block space-y-1.5 text-gray-900 w-full', labelClassName)}>
			<span className={c("flex items-center text-md", labelTextClassName)}>
				{label}
				{!required && <span className="ml-2 text-gray-400">(nepovinné)</span>}
			</span>
			{children}
		</label>
	)
}

export default Label
