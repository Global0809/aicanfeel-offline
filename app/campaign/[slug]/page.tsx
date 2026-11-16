import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Studio from '../../../components/Studio';
import {campaignById,campaigns} from '../../../lib/campaigns';
export function generateStaticParams(){return campaigns.map(c=>({slug:c.id}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const c=campaignById(slug);return {title:c?.name||'Campaign',description:c?.description,openGraph:{images:[{url:`/campaigns/${slug}/01.webp`,width:1536,height:1024,alt:`${c?.name} campaign concept`}]}}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!campaignById(slug))notFound();return <Studio view="campaign" slug={slug}/>}
