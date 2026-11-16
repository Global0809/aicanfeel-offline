import type {Metadata} from 'next';
import Studio from '../../components/Studio';
export const metadata:Metadata={title:'The campaign collection',description:'Explore ten filmed offline brand activations in New York and London, with clear production scopes and starting prices.'};
export default function Page(){return <Studio view="campaigns"/>}
