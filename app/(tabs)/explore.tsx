import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useParcels } from '@/hooks/use-parcels';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Parcel } from '@/types';
import { formatDate } from '@/utils/date';

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', variant: 'success' },
  fallow: { label: 'Jachère', variant: 'warning' },
  archived: { label: 'Archivée', variant: 'neutral' },
};

export default function ParcelsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { parcels, isLoading, refresh } = useParcels();

  const renderParcel = ({ item }: { item: Parcel }) => {
    const status = STATUS_LABELS[item.status] ?? STATUS_LABELS.active;
    return (
      <Card
        title={item.name}
        subtitle={`${item.surface} ha · ${item.location}`}
        onPress={() => router.push(`/parcel/${item.id}` as any)}
        rightAction={<Badge text={status.label} variant={status.variant} />}
      >
        <View style={styles.parcelFooter}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            Créée le {formatDate(item.createdAt)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.icon} />
        </View>
      </Card>
    );
  };

  if (isLoading && parcels.length === 0) {
    return <LoadingView />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={parcels}
        keyExtractor={(item) => item.id}
        renderItem={renderParcel}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucune parcelle"
            message="Ajoutez votre première parcelle pour commencer le suivi de vos cultures."
            actionLabel="Ajouter une parcelle"
            onAction={() => router.push('/parcel/create' as any)}
            icon={<Ionicons name="map-outline" size={48} color={colors.icon} />}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push('/parcel/create' as any)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.md, paddingBottom: 100 },
  parcelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dateText: { fontSize: 12 },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
