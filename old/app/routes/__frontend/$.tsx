import styles from '../../styles/main.css';
import { CatchBoundary } from '~/components/content/NotFoundCatch';

export function meta() {
	return {
		title: 'Page not found - VirtualCoffeeIO',
		description: `We weren't able to find that content.`,
	};
}

export function links() {
	return [{ rel: 'stylesheet', href: styles }];
}

export default CatchBoundary;
