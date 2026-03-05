import { useState, useEffect, useCallback } from 'react';
import { Culture, CultureFormData } from '@/types';
import * as cultureService from '@/services/culture.service';

interface UseCulturesReturn {
  cultures: Culture[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (zoneId: string, data: CultureFormData) => Promise<Culture>;
  update: (id: string, data: Partial<CultureFormData>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useCultures(parcelId: string): UseCulturesReturn {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!parcelId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await cultureService.getCultures(parcelId);
      setCultures(data);
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors du chargement des cultures');
    } finally {
      setIsLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (zoneId: string, data: CultureFormData): Promise<Culture> => {
      const culture = await cultureService.createCulture(parcelId, zoneId, data);
      setCultures((prev) => [culture, ...prev]);
      return culture;
    },
    [parcelId],
  );

  const update = useCallback(
    async (id: string, data: Partial<CultureFormData>) => {
      await cultureService.updateCulture(id, data);
      setCultures((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await cultureService.deleteCulture(id);
    setCultures((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { cultures, isLoading, error, refresh, create, update, remove };
}
