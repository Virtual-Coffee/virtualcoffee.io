'use server';

import Airtable, { FieldSet } from 'airtable';
import { redirect } from 'next/navigation';
import { FormState } from './types';
import AirtableError from 'airtable/lib/airtable_error';

function getRecordFromFormData<T>(
	formData: FormData,
	fields: string[],
): T | null {
	const record: Record<string, unknown> = {};

	fields.forEach((field) => {
		record[field] = formData.get(field);
	});

	if (isValidRecord<T>(record, fields)) {
		return record;
	}

	return null;
}

function isValidRecord<T>(record: unknown, fields: string[]): record is T {
	if (typeof record === 'object' && record !== null) {
		let isValid = true;
		fields.forEach((key) => {
			if (typeof key !== 'string') {
				isValid = false;
			}
		});
		Object.keys(record).forEach((key) => {
			if (!fields.includes(key)) {
				isValid = false;
			}
		});

		return isValid;
	}

	return false;
}

function makeAction<T extends FieldSet>(
	fields: string[],
	table: string,
	redirectPath: string,
) {
	return async function create(_: FormState, formData: FormData) {
		if (process.env.FORMS_AIRTABLE_API_KEY) {
			const base = new Airtable({
				apiKey: process.env.FORMS_AIRTABLE_API_KEY,
			}).base('appZ4d2Q9K0IepQnA');

			const record = getRecordFromFormData<T>(formData, fields);

			if (record) {
				try {
					await base<T>(table).create(record);
				} catch (error) {
					console.error(error);
					if (error instanceof AirtableError) {
						return {
							is_error: true,
							message: error.message,
						};
					}
					return {
						is_error: true,
						message: 'Form submission failed.',
					};
				}
				redirect(redirectPath);
			}
		}
		return {
			is_error: true,
			message: 'No API key provided.',
		};
	};
}

const lunchAndLearnSubmissionFields = [
	'Name',
	'Email',
	'Topic',
	'Description',
	'Format',
	'Timing',
];

type LunchAndLearnSubmission = {
	Name: string;
	Email: string;
	Topic: string;
	Description: string;
	Format: string;
	Timing: string;
};

export const createLunchAndLearnSubmission =
	makeAction<LunchAndLearnSubmission>(
		lunchAndLearnSubmissionFields,
		'Lunch and Learn Idea',
		'/lunch-and-learn-idea/thanks',
	);

type CoCViolation = {
	name: string;
	email: string;
	reportee_name: string;
	time_location: string;
	description: string;
	anyone_else_involved: string;
};

const CoCViolationFields = [
	'name',
	'email',
	'reportee_name',
	'time_location',
	'description',
	'anyone_else_involved',
];

export const createCoCViolation = makeAction<CoCViolation>(
	CoCViolationFields,
	'CoC Violation Reports',
	'/report-coc-violation/thanks',
);

type CoffeeTableGroup = {
	name: string;
	email: string;
	description: string;
	group_name: string;
};

const CoffeeTableGroupFields = ['name', 'email', 'description', 'group_name'];

export const createCoffeeTableGroup = makeAction<CoffeeTableGroup>(
	CoffeeTableGroupFields,
	'New Coffee Table Group',
	'/start-coffee-table-group/thanks',
);
