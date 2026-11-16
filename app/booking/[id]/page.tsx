import type {Metadata} from 'next';
import Studio from '../../../components/Studio';
export const metadata:Metadata={title:'Your private production request',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Studio view="booking" bookingId={id}/>}
