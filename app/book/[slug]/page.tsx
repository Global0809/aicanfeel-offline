import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Studio from '../../../components/Studio';
import {campaignById} from '../../../lib/campaigns';
export const metadata:Metadata={title:'Start your production brief',robots:{index:false,follow:true}};
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!campaignById(slug))notFound();return <Studio view="book" slug={slug}/>}
