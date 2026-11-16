import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/studio','/booking/','/book/']},sitemap:'https://aicanfeel-offline.globalgupta14.chatgpt.site/sitemap.xml'}}
