import memberAccountUsername from './member-account-username.mjs';
import memberEmoji from './member-emoji.mjs';
import memberFileIdentity from './member-file-identity.mjs';
import noRawDangerouslySetInnerHtml from './no-raw-dangerously-set-inner-html.mjs';
import pageRequiresMetadata from './page-requires-metadata.mjs';

/**
 * Rules for the parts of this repo that contributors edit but TypeScript cannot
 * check. Wired up, and scoped to the right files, in `eslint.config.mjs`.
 *
 * @type {import('eslint').ESLint.Plugin}
 */
const plugin = {
	meta: { name: 'eslint-plugin-vc', version: '1.0.0' },
	rules: {
		'member-account-username': memberAccountUsername,
		'member-emoji': memberEmoji,
		'member-file-identity': memberFileIdentity,
		'no-raw-dangerously-set-inner-html': noRawDangerouslySetInnerHtml,
		'page-requires-metadata': pageRequiresMetadata,
	},
};

export default plugin;
