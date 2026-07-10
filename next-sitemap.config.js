const siteUrl = process.env.SITE_URL || 'https://multicargoltd.com';

/**
 * Lists the 4 locale home pages. hreflang alternates are emitted in each
 * page's HTML <head> via Next.js metadata (alternates.languages), which is
 * the more reliable signal for path-based i18n — so we don't duplicate
 * (incorrectly) here.
 *
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  transform: async (config, path) => ({
    loc: path,
    changefreq: 'weekly',
    priority: path === '/en' ? 1.0 : 0.8,
    lastmod: new Date().toISOString(),
  }),
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
};
