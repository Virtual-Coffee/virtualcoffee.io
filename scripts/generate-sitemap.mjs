import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEpisodes } from '../src/data/podcast';
import { getNewsletter } from '../src/data/newsletters';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateStaticParams() {
	const newsletters = await getNewsletter();
	const podcasts = await getEpisodes();

	const newsletterUrls = newsletters.map((newsletter) => ({
		href: newsletter.href,
		lastModified: newsletter.lastModified,
	}));
	const podcastUrls = podcasts.map((podcast) => ({
		href: podcast.href,
		lastModified: podcast.lastModified, // Ensure you have this field in your data
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
		...newsletterUrls,
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
