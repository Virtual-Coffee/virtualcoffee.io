import { Form, Link, useActionData, useCatch } from '@remix-run/react';
import {
	ActionFunction,
	json,
	LoaderFunction,
	redirect,
} from '@remix-run/node';
import { authenticator } from '~/auth/auth.server';
import { sessionStorage } from '~/auth/session.server';
import { AuthorizationError } from 'remix-auth';
import { CmsAuth } from '~/api/cmsauth.server';
import { CmsError } from '~/api/util';
import SingleTask from '~/components/layouts/SingleTask';
import Alert from '~/components/app/Alert';
import { Button } from '~/components/app/Button';
import { TextInput, FieldSet, TextAreaInput } from '~/components/app/Forms';
import LeadText from '~/components/content/LeadText';

export default function Screen() {
	return (
		<SingleTask title="Register for Virtual Coffee" wide>
			<div className="flex flex-row gap-4 justify-between items-center">
				<Button size="xl" as={Link} to="new-member" color="primary">
					I'm a New Member
				</Button>

				<Button size="xl" as={Link} to="current-member" color="primary">
					I'm a Current Member
				</Button>
			</div>
		</SingleTask>
	);
}

// lookUpByEmail
