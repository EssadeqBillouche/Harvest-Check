import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useParcels } from '@/hooks/use-parcels';
import { useAllHarvests } from '@/hooks/use-harvests';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { Harvest } from '@/types';
import { formatDate } from '@/utils/date';

const QUALITY_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  excellent: { label: 'Excellent', variant: 'success' },
  good: { label: 'Bon', variant: 'info' },
  average: { label: 'Moyen', variant: 'warning' },
  poor: { label: 'Faible', variant: 'danger' },
};

export default function HarvestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { parcels, isLoading: loadingParcels } = useParcels();

  const parcelIds = useMemo(() => parcels.map((p) => p.id), [parcels]);
  const {
    harvests,
    isLoading: loadingHarvests,
    refresh,
  } = useAllHarvests(parcelIds);

  const isLoading = loadingParcels || loadingHarvests;

  const totalWeight = useMemo(
    () => harvests.reduce((sum, h) => sum + h.weight, 0),
    [harvests],
  );

  const renderHarvest = ({ item }: { item: Harvest }) => {
    const parcel = parcels.find((p) => p.id === item.parcelId);
    const quality = QUALITY_MAP[item.quality] ?? QUALITY_MAP.average;
    return (
      <Card
        title={`${item.weight} kg`}
        subtitle={parcel?.name ?? 'Parcelle inconnue'}
        onPress={() => router.push(`/culture/${item.cultureId}` as any)}
        rightAction={<Badge text={quality.label} variant={quality.variant} />}
      >
        <View style={styles.harvestMeta}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        {item.notes ? (
          <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}
      </Card>
    );
  };

  if (isLoading && harvests.length === 0) {
    return <LoadingView />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Summary */}
      {harvests.length > 0 && (
        <View style={[styles.summary, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {harvests.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Récoltes
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {totalWeight.toFixed(0)} kg
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Poids total
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={harvests}
        keyExtractor={(item) => item.id}
        renderItem={renderHarvest}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucune récolte"
            message="Enregistrez vos récoltes depuis les détails d'une culture."
            icon={<Ionicons name="basket-outline" size={48} color={colors.icon} />}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  divider: { width: 1, marginVertical: 4 },
  list: { padding: Spacing.md, paddingBottom: 100 },
  harvestMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  dateText: { fontSize: 12 },
  notes: { fontSize: 13, marginTop: Spacing.xs },
});
