import DefaultLayout from '@/components/layouts/DefaultLayout';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
	return <DefaultLayout simple>{children}</DefaultLayout>;
}
