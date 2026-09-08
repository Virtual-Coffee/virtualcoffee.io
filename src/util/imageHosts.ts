/**
 * Hostnames of the CDNs that serve this site's images.
 *
 * Shared by the URL builders ({@link import('./cmsimage').default}) and the
 * `next/image` loaders in `@/components/CdnImage`, so a host is named once.
 */

/** Craft CMS assets: podcast artwork, guest headshots, sponsor logos. */
export const CMS_IMGIX_HOST = 'virtualcoffeeio-cms.imgix.net';

/** Site-owned assets under `/assets`, used by the sponsor overrides. */
export const ASSETS_IMGIX_HOST = 'virtualcoffee.imgix.net';

/** GitHub profile avatars, for members and most sponsors. */
export const GITHUB_AVATAR_HOST = 'avatars.githubusercontent.com';
