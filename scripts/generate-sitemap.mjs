import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sitemap() {
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
			url: 'https://virtualcoffee.io/events',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.6,
		},
		{
			url: 'https://virtualcoffee.io/podcast',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.7,
		},
		{
			url: 'https://virtualcoffee.io/contact',
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 0.4,
		},
	];
}

console.log('Generating sitemap...');

const sitemapContent = sitemap()
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
