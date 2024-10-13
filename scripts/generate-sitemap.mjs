import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEpisodes } from '../src/data/podcast';
import { getNewsletter } from '../src/data/newsletters';
import { url } from 'inspector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateStaticParams() {
	const newsletters = await getNewsletter();
	const podcasts = await getEpisodes();

	const newsletterUrls = newsletters.map((newsletter) => ({
		href: newsletter.href,
		lastModified: new Date(newsletter.date),
	}));
	const podcastUrls = podcasts.map((podcast) => ({
		href: podcast.href,
		lastModified: new Date(podcast.date),
	}));

	return {
		newsletters: newsletterUrls,
		podcasts: podcastUrls,
	};
}

async function sitemap() {
	const newsletters = await generateStaticParams();

	const newsletterUrls = newsletters.map((newsletter) => ({
		url: `https://virtualcoffee.io/newsletter/issues/${newsletter.href.replace('/newsletter/issues/', '')}`,
		lastModified: new Date(newsletter.lastModified),
		changeFrequency: 'monthly',
		priority: 0.7,
	}));

	return [
		{
			url: 'https://virtualcoffee.io',
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 1,
		},
		{
			url: 'https://virtualcoffee.io/about',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
    {
      url: 'https://store.virtualcoffee.io/pages/contact',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
		{
			url: 'https://virtualcoffee.io/resources',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: 'https://virtualcoffee.io/resources/virtual-coffee-handbook/join-virtual-coffee',
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.6,
		},
		{
			url: 'https://store.virtualcoffee.io/',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: 'https://store.virtualcoffee.io/collections/all',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		...newsletterUrls,
		...podcastUrls,
	];
}

(async () => {
	console.log('Generating sitemap...');

	const sitemapContent = (await sitemap())
		.map(
			(entry) => `
    <url>
      <loc>${entry.url}</loc>
      <lastmod>${entry.lastModified.toISOString()}</lastmod>
      <changefreq>${entry.changeFrequency}</changefreq>
      <priority>${entry.priority}</priority>
    </url>
  `,
		)
		.join('');

	const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapContent}
  </urlset>`;

	const outputPath = path.join(__dirname, '../public/sitemap.xml');
	fs.writeFileSync(outputPath, sitemapXml, 'utf8');
	console.log(`Sitemap generated successfully at ${outputPath}`);
})();
