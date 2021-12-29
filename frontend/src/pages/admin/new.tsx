import c from 'clsx';
import React, { FC, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import AddCandidateRow from '../../components/AddCandidateRow';
import Form from '../../components/Form/Form';
import FormField from '../../components/Form/FormField';
import Label from '../../components/Form/Label';
import BasicLayout from '../../components/Layout/BasicLayout';
import Button from '../../components/UI/Button';
import VotableItemModal from '../../components/VotableItemModal';
import { useElectionForm } from '../../hooks/useElectionForm';

const NewElectionPage: FC = () => {
	const form = useElectionForm();

	useEffect(() => {
		console.log(form.values);
	}, [form.values]);

	return (
		<BasicLayout>
			<div className="flex flex-col w-1/2 space-y-10">
				<h1 className="self-start text-3xl font-bold">Admin Login</h1>
				<Form form={form}>
					<div className="space-y-6">
						<FormField label="Name of the election" name="name" required />
						<Label label="Start date of the election" required>
							<DatePicker
								className={c(
									'w-full p-3 px-4 transition transform border border-gray-500 rounded-lg focus:border-blue-600'
								)}
								name="startDate"
								onChange={v => form.setFieldValue('startDate', v)}
								selected={form.values.startDate}
							/>
						</Label>
						<Label label="End date of the election" required>
							<DatePicker
								className={c(
									'w-full p-3 px-4 transition transform border border-gray-500 rounded-lg focus:border-blue-600'
								)}
								name="endDate"
								onChange={v => form.setFieldValue('endDate', v)}
								selected={form.values.endDate}
							/>
						</Label>
					</div>
					<div className="space-y-4">
						<div className="text-xl font-bold">Votable Items:</div>
						{form.values.votableItems.map(votableItem => (
							<AddCandidateRow candidate={votableItem} key={votableItem.name} />
						))}
					</div>
					<VotableItemModal
						onSubmit={values => {
							form.setFieldValue('votableItems', [
								...form.values.votableItems,
								values,
							]);
						}}
					>
						<Button data-test="votable-item-button">Add votable item</Button>
					</VotableItemModal>
					<Button onClick={() => form.handleSubmit()} type="submit">
						Add Election
					</Button>
				</Form>
			</div>
		</BasicLayout>
	);
};

export default NewElectionPage;
