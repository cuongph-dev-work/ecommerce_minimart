import type { Metadata } from 'next';
import { StoresPage as StoresPageComponent } from '../../components/StoresPage';

export const metadata: Metadata = {
  title: 'Our Stores - Minimart',
  description: 'Find a store near you',
};

export default function StoresPage() {
  return <StoresPageComponent />;
}
