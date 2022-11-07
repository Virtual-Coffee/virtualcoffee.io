import { Link } from '@remix-run/react';
import SingleTask from '~/components/layouts/SingleTask';
import { Button } from '~/components/app/Button';

export default function Screen() {
	return (
		<SingleTask title="Register for Virtual Coffee" wide>
			<div className="flex flex-row gap-4 justify-between items-center">
				<Button size="xl" as={Link} to="/join" color="primary">
					I'd like to Join Virtual Coffee
				</Button>

				<Button size="xl" as={Link} to="current-member" color="primary">
					I'm a Current Member
				</Button>
			</div>
		</SingleTask>
	);
}

// lookUpByEmail
