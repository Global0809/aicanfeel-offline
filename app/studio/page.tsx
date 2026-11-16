import type {Metadata} from 'next';
import Studio from '../../components/Studio';
export const metadata:Metadata={title:'Production desk',robots:{index:false,follow:false}};
export default function Page(){return <Studio view="studio"/>}
