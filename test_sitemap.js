const fetch = require('node-fetch');

async function testSitemap() {
  console.log('Testing sitemap parsing...');
  
  const sitemapUrl = 'https://old.appointy.com/sitemap.xml';
  const res = await fetch(sitemapUrl);
  const xml = await res.text();
  
  console.log('XML length:', xml.length);
  console.log('First 500 chars:', xml.substring(0, 500));
  
  const urls = [];
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
  for (const match of matches) {
    urls.push(match[1]);
  }
  
  console.log('Total URLs found:', urls.length);
  console.log('First 5 URLs:');
  urls.slice(0, 5).forEach(url => console.log('  -', url));
  console.log('Last 5 URLs:');
  urls.slice(-5).forEach(url => console.log('  -', url));
}

testSitemap().catch(console.error);
