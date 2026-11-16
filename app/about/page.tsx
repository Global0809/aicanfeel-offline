import type {Metadata} from 'next';
import Studio from '../../components/Studio';
export const metadata:Metadata={title:'The offline studio'};
export default function Page(){return <Studio view="about"/>}
