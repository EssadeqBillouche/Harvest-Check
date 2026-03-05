import { useState, useEffect, useCallback } from 'react';
import { Harvest, HarvestFormData } from '@/types';
import * as harvestService from '@/services/harvest.service';

interface UseHarvestsReturn {
  harvests: Harvest[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: HarvestFormData) => Promise<Harvest>;
  update: (id: string, data: Partial<HarvestFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useHarvests(
  parcelId: string,
  zoneId: string,
  cultureId: string,
): UseHarvestsReturn {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!cultureId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await harvestService.getHarvestsByCulture(cultureId);
      setHarvests(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des récoltes');
    } finally {
      setIsLoading(false);
    }
  }, [cultureId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: HarvestFormData): Promise<Harvest> => {
      const harvest = await harvestService.createHarvest(
        parcelId,
        zoneId,
        cultureId,
        data,
      );
      setHarvests((prev) => [harvest, ...prev]);
      return harvest;
    },
    [parcelId, zoneId, cultureId],
  );

  const update = useCallback(
    async (id: string, data: Partial<HarvestFormData>) => {
      await harvestService.updateHarvest(id, data);
      setHarvests((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...data } : h)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await harvestService.deleteHarvest(id);
    setHarvests((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { harvests, isLoading, error, refresh, create, update, remove };
}

/**
 * Fetch all harvests across all parcels for the dashboard view.
 */
export function useAllHarvests(parcelIds: string[]) {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (parcelIds.length === 0) {
      setHarvests([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await harvestService.getAllFarmerHarvests(parcelIds);
      setHarvests(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des récoltes');
    } finally {
      setIsLoading(false);
    }
  }, [parcelIds.join(',')]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { harvests, isLoading, error, refresh };
}
