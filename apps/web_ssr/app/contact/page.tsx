import type { Metadata } from 'next';
import { ContactPage as ContactPageComponent } from '../../components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us - Minimart',
  description: 'Get in touch with us for any questions or concerns',
};

export default function ContactPage() {
  return <ContactPageComponent />;
}
