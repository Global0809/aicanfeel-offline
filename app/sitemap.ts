import type {MetadataRoute} from 'next';
import {campaigns} from '../lib/campaigns';
export default function sitemap():MetadataRoute.Sitemap{const origin='https://aicanfeel-offline.globalgupta14.chatgpt.site';return ['','/campaigns','/how-it-works','/about','/terms','/privacy',...campaigns.map(c=>`/campaign/${c.id}`)].map(path=>({url:origin+path,lastModified:new Date('2026-11-16T03:10:00Z'),changeFrequency:'monthly',priority:path===''?1:path==='/campaigns'?.9:.7}))}
