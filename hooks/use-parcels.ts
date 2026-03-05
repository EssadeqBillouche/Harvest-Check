import { useState, useEffect, useCallback } from 'react';
import { Parcel, ParcelFormData } from '@/types';
import * as parcelService from '@/services/parcel.service';
import { useAuth } from '@/contexts/auth.context';

interface UseParcelsReturn {
  parcels: Parcel[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: ParcelFormData) => Promise<Parcel>;
  update: (id: string, data: Partial<ParcelFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useParcels(): UseParcelsReturn {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await parcelService.getParcels(user.uid);
      setParcels(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des parcelles');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: ParcelFormData): Promise<Parcel> => {
      if (!user) throw new Error('Non authentifié');
      const parcel = await parcelService.createParcel(user.uid, data);
      setParcels((prev) => [parcel, ...prev]);
      return parcel;
    },
    [user],
  );

  const update = useCallback(
    async (id: string, data: Partial<ParcelFormData>) => {
      await parcelService.updateParcel(id, data);
      setParcels((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await parcelService.deleteParcel(id);
    setParcels((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { parcels, isLoading, error, refresh, create, update, remove };
}
