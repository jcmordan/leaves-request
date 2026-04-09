import { Suspense } from 'react';
import { PreloadQuery } from '@/lib/apollo-client';
import LoadingCard from '@/components/card/LoadingCard';
import DashboardContent from './components/DashboardContent';
import { DASHBOARD_DATA_QUERY } from './graphql/DashboardQueries';

/**
 * Dashboard Page (Server Component)
 * Implements PreloadQuery approach to minimize waterfall loading.
 */
export default async function DashboardPage() {
  return (
    <PreloadQuery query={DASHBOARD_DATA_QUERY}>
      <Suspense fallback={<LoadingCard title="" subtitle="" description="" />}>
        <DashboardContent />
      </Suspense>
    </PreloadQuery>
  );
}
