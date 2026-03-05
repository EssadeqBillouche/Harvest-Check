import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatCard } from '@/components/ui/stat-card';
import { Culture, Harvest } from '@/types';
import * as cultureService from '@/services/culture.service';
import * as harvestService from '@/services/harvest.service';
import { formatDate, daysBetween } from '@/utils/date';

const CULTURE_STATUS: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  planned: { label: 'Planifiée', variant: 'info' },
  growing: { label: 'En croissance', variant: 'success' },
  harvested: { label: 'Récoltée', variant: 'warning' },
  failed: { label: 'Échouée', variant: 'danger' },
};

const QUALITY_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  excellent: { label: 'Excellent', variant: 'success' },
  good: { label: 'Bon', variant: 'info' },
  average: { label: 'Moyen', variant: 'warning' },
  poor: { label: 'Faible', variant: 'danger' },
};

export default function CultureDetailScreen() {
  const { id, parcelId } = useLocalSearchParams<{ id: string; parcelId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [culture, setCulture] = useState<Culture | null>(null);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [cultureData, harvestsData] = await Promise.all([
        cultureService.getCulture(id),
        harvestService.getHarvestsByCulture(id),
      ]);
      setCulture(cultureData);
      setHarvests(harvestsData);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!id) return;
    setShowDelete(false);
    try {
      await cultureService.deleteCulture(id);
      Alert.alert('Succès', 'Culture supprimée');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer la culture');
    }
  };

  const totalWeight = useMemo(
    () => harvests.reduce((sum, h) => sum + h.weight, 0),
    [harvests],
  );

  if (loading || !culture) {
    return <LoadingView />;
  }

  const cs = CULTURE_STATUS[culture.status] ?? CULTURE_STATUS.planned;
  const daysToHarvest = daysBetween(new Date().toISOString(), culture.expectedHarvestDate);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.cultureName, { color: colors.text }]}>{culture.name}</Text>
          <Badge text={cs.label} variant={cs.variant} />
        </View>
        <Text style={[styles.cultureType, { color: colors.textSecondary }]}>
          {culture.type}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Récoltes"
          value={harvests.length}
          icon={<Ionicons name="basket" size={18} color={colors.primary} />}
          color={colors.primary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label="Poids (kg)"
          value={totalWeight.toFixed(0)}
          icon={<Ionicons name="scale" size={18} color={colors.secondary} />}
          color={colors.secondary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label={daysToHarvest > 0 ? 'Jours restants' : 'Jours passés'}
          value={Math.abs(daysToHarvest)}
          icon={<Ionicons name="calendar" size={18} color={colors.primary} />}
          color={colors.primary}
        />
      </View>

      {/* Timeline Info */}
      <Card title="Informations">
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Planté le {formatDate(culture.plantingDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="flag-outline" size={16} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Récolte prévue le {formatDate(culture.expectedHarvestDate)}
          </Text>
        </View>
        {culture.notes ? (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.icon} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {culture.notes}
            </Text>
          </View>
        ) : null}
      </Card>

      {/* Harvests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Récoltes ({harvests.length})
          </Text>
          <Button
            title="Enregistrer"
            onPress={() =>
              router.push(
                `/harvest/create?parcelId=${culture.parcelId}&zoneId=${culture.zoneId}&cultureId=${id}` as any,
              )
            }
            size="sm"
            variant="ghost"
            fullWidth={false}
            icon={<Ionicons name="add" size={16} color={colors.primary} />}
          />
        </View>

        {harvests.length === 0 ? (
          <EmptyState
            title="Aucune récolte"
            message="Enregistrez votre première récolte pour cette culture."
            actionLabel="Enregistrer une récolte"
            onAction={() =>
              router.push(
                `/harvest/create?parcelId=${culture.parcelId}&zoneId=${culture.zoneId}&cultureId=${id}` as any,
              )
            }
            icon={<Ionicons name="basket-outline" size={36} color={colors.icon} />}
          />
        ) : (
          harvests.map((harvest) => {
            const q = QUALITY_MAP[harvest.quality] ?? QUALITY_MAP.average;
            return (
              <Card
                key={harvest.id}
                title={`${harvest.weight} kg`}
                subtitle={formatDate(harvest.date)}
                rightAction={<Badge text={q.label} variant={q.variant} />}
              >
                {harvest.notes ? (
                  <Text
                    style={[styles.harvestNotes, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {harvest.notes}
                  </Text>
                ) : null}
              </Card>
            );
          })
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Supprimer la culture"
          onPress={() => setShowDelete(true)}
          variant="danger"
          icon={<Ionicons name="trash" size={18} color="#fff" />}
        />
      </View>

      <ConfirmDialog
        visible={showDelete}
        title="Supprimer la culture"
        message="Toutes les récoltes associées seront perdues."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cultureName: { fontSize: 24, fontWeight: '800' },
  cultureType: { fontSize: 14, marginTop: Spacing.xs, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  infoText: { fontSize: 14, flex: 1 },
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  harvestNotes: { fontSize: 13, marginTop: Spacing.xs },
  actions: { marginTop: Spacing.xl },
});
