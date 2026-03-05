import { useState, useEffect, useCallback } from 'react';
import { Zone, ZoneFormData } from '@/types';
import * as zoneService from '@/services/zone.service';

interface UseZonesReturn {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: ZoneFormData) => Promise<Zone>;
  update: (id: string, data: Partial<ZoneFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useZones(parcelId: string): UseZonesReturn {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!parcelId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await zoneService.getZones(parcelId);
      setZones(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des zones');
    } finally {
      setIsLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: ZoneFormData): Promise<Zone> => {
      const zone = await zoneService.createZone(parcelId, data);
      setZones((prev) => [zone, ...prev]);
      return zone;
    },
    [parcelId],
  );

  const update = useCallback(
    async (id: string, data: Partial<ZoneFormData>) => {
      await zoneService.updateZone(id, data);
      setZones((prev) =>
        prev.map((z) => (z.id === id ? { ...z, ...data } : z)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await zoneService.deleteZone(id);
    setZones((prev) => prev.filter((z) => z.id !== id));
  }, []);

  return { zones, isLoading, error, refresh, create, update, remove };
}
