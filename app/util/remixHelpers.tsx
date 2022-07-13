import type { MetaFunction } from '@remix-run/node';

export const metaFromData: MetaFunction = ({ data }) => {
	if (data.meta) {
		return data.meta;
	}

	return {};
};
