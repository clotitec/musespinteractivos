'use client';

import { useMuseums } from '@/hooks/useMuseums';
import { usePassport } from '@/hooks/usePassport';
import PassportView from '@/components/Passport/PassportView';
import Loading from '@/components/ui/Loading';

export default function PasaportePage() {
  const { museums, loading } = useMuseums();
  const passport = usePassport();

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PassportView
        museums={museums}
        visited={passport.visited}
        favorites={passport.favorites}
        toggleVisited={passport.toggleVisited}
        toggleFavorite={passport.toggleFavorite}
        isVisited={passport.isVisited}
        isFavorite={passport.isFavorite}
      />
    </div>
  );
}
