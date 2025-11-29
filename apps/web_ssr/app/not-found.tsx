import type { Metadata } from 'next';
import { NotFoundPage as NotFoundPageComponent } from '../components/NotFoundPage';

export const metadata: Metadata = {
  title: 'Page Not Found - Minimart',
  description: 'The page you are looking for does not exist',
};

export default function NotFound() {
  return <NotFoundPageComponent />;
}
