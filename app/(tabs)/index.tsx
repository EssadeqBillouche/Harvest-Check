import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth.context';
import { useParcels } from '@/hooks/use-parcels';
import { useAllHarvests } from '@/hooks/use-harvests';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { parcels, isLoading: loadingParcels, refresh: refreshParcels } = useParcels();

  const parcelIds = useMemo(() => parcels.map((p) => p.id), [parcels]);
  const {
    harvests,
    isLoading: loadingHarvests,
    refresh: refreshHarvests,
  } = useAllHarvests(parcelIds);

  const isLoading = loadingParcels || loadingHarvests;

  const stats = useMemo(() => {
    const totalSurface = parcels.reduce((sum, p) => sum + p.surface, 0);
    const totalHarvestWeight = harvests.reduce((sum, h) => sum + h.weight, 0);

    return {
      totalParcels: parcels.length,
      totalSurface: totalSurface.toFixed(1),
      totalHarvests: harvests.length,
      totalWeight: totalHarvestWeight.toFixed(0),
    };
  }, [parcels, harvests]);

  const recentHarvests = useMemo(() => harvests.slice(0, 5), [harvests]);

  const handleRefresh = async () => {
    await Promise.all([refreshParcels(), refreshHarvests()]);
  };

  if (isLoading && parcels.length === 0) {
    return <LoadingView />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bonjour,</Text>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.displayName ?? 'Agriculteur'} 👋
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Parcelles"
          value={stats.totalParcels}
          icon={<Ionicons name="map" size={20} color={colors.primary} />}
          color={colors.primary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label="Surface (ha)"
          value={stats.totalSurface}
          icon={<Ionicons name="resize" size={20} color={colors.secondary} />}
          color={colors.secondary}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Récoltes"
          value={stats.totalHarvests}
          icon={<Ionicons name="basket" size={20} color={colors.primary} />}
          color={colors.primary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label="Poids (kg)"
          value={stats.totalWeight}
          icon={<Ionicons name="scale" size={20} color={colors.secondary} />}
          color={colors.secondary}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <Button
            title="Nouvelle Parcelle"
            onPress={() => router.push('/parcel/create' as any)}
            size="sm"
            icon={<Ionicons name="add-circle" size={18} color="#fff" />}
            fullWidth={false}
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
          <Button
            title="Voir Parcelles"
            onPress={() => router.push('/(tabs)/explore' as any)}
            variant="outline"
            size="sm"
            icon={<Ionicons name="map-outline" size={18} color={colors.primary} />}
            fullWidth={false}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Recent Harvests */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dernières récoltes</Text>
        {recentHarvests.length === 0 ? (
          <EmptyState
            title="Aucune récolte"
            message="Enregistrez votre première récolte depuis une parcelle."
            icon={<Ionicons name="basket-outline" size={48} color={colors.icon} />}
          />
        ) : (
          recentHarvests.map((harvest) => {
            const parcel = parcels.find((p) => p.id === harvest.parcelId);
            return (
              <Card
                key={harvest.id}
                title={`${harvest.weight} kg`}
                subtitle={parcel?.name ?? 'Parcelle'}
                onPress={() => router.push(`/culture/${harvest.cultureId}` as any)}
                rightAction={
                  <Badge
                    text={harvest.quality}
                    variant={
                      harvest.quality === 'excellent'
                        ? 'success'
                        : harvest.quality === 'good'
                          ? 'info'
                          : harvest.quality === 'average'
                            ? 'warning'
                            : 'danger'
                    }
                  />
                }
              >
                <Text style={[styles.harvestDate, { color: colors.textSecondary }]}>
                  {formatDate(harvest.date)}
                </Text>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  welcomeSection: { marginBottom: Spacing.lg },
  greeting: { fontSize: 15 },
  userName: { fontSize: 24, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  actionsRow: { flexDirection: 'row' },
  harvestDate: { fontSize: 13, marginTop: Spacing.xs },
});
