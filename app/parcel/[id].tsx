import React, { useEffect, useState, useCallback } from 'react';
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
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useZones } from '@/hooks/use-zones';
import { useCultures } from '@/hooks/use-cultures';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StatCard } from '@/components/ui/stat-card';
import { Parcel, Zone, Culture } from '@/types';
import * as parcelService from '@/services/parcel.service';
import { formatDate } from '@/utils/date';

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', variant: 'success' },
  fallow: { label: 'Jachère', variant: 'warning' },
  archived: { label: 'Archivée', variant: 'neutral' },
};

const CULTURE_STATUS: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  planned: { label: 'Planifiée', variant: 'info' },
  growing: { label: 'En croissance', variant: 'success' },
  harvested: { label: 'Récoltée', variant: 'warning' },
  failed: { label: 'Échouée', variant: 'danger' },
};

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const { zones, isLoading: loadingZones, refresh: refreshZones } = useZones(id);
  const { cultures, isLoading: loadingCultures, refresh: refreshCultures } = useCultures(id);

  const loadParcel = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await parcelService.getParcel(id);
      setParcel(data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la parcelle');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadParcel();
  }, [loadParcel]);

  const handleRefresh = async () => {
    await Promise.all([loadParcel(), refreshZones(), refreshCultures()]);
  };

  const handleDelete = async () => {
    if (!id) return;
    setShowDelete(false);
    try {
      await parcelService.deleteParcel(id);
      Alert.alert('Succès', 'Parcelle supprimée');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer la parcelle');
    }
  };

  if (loading || !parcel) {
    return <LoadingView />;
  }

  const status = STATUS_LABELS[parcel.status] ?? STATUS_LABELS.active;
  const totalZoneSurface = zones.reduce((sum, z) => sum + z.surface, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading || loadingZones || loadingCultures}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={[styles.parcelName, { color: colors.text }]}>{parcel.name}</Text>
          <Badge text={status.label} variant={status.variant} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {parcel.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Créée le {formatDate(parcel.createdAt)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Surface"
          value={`${parcel.surface} ha`}
          icon={<Ionicons name="resize" size={18} color={colors.primary} />}
          color={colors.primary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label="Zones"
          value={zones.length}
          icon={<Ionicons name="grid" size={18} color={colors.secondary} />}
          color={colors.secondary}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          label="Cultures"
          value={cultures.length}
          icon={<Ionicons name="leaf" size={18} color={colors.primary} />}
          color={colors.primary}
        />
      </View>

      {/* Zones Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Zones ({zones.length})
          </Text>
          <Button
            title="Ajouter"
            onPress={() => router.push(`/zone/create?parcelId=${id}` as any)}
            size="sm"
            variant="ghost"
            fullWidth={false}
            icon={<Ionicons name="add" size={16} color={colors.primary} />}
          />
        </View>

        {zones.length === 0 ? (
          <EmptyState
            title="Aucune zone"
            message="Divisez votre parcelle en zones pour mieux organiser vos cultures."
            actionLabel="Ajouter une zone"
            onAction={() => router.push(`/zone/create?parcelId=${id}` as any)}
            icon={<Ionicons name="grid-outline" size={36} color={colors.icon} />}
          />
        ) : (
          zones.map((zone) => (
            <Card
              key={zone.id}
              title={zone.name}
              subtitle={`${zone.surface} ha`}
              onPress={() => router.push(`/zone/${zone.id}?parcelId=${id}` as any)}
            >
              <View style={styles.zoneFooter}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  {formatDate(zone.createdAt)}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.icon} />
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Cultures Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cultures ({cultures.length})
          </Text>
          {zones.length > 0 && (
            <Button
              title="Ajouter"
              onPress={() => router.push(`/culture/create?parcelId=${id}` as any)}
              size="sm"
              variant="ghost"
              fullWidth={false}
              icon={<Ionicons name="add" size={16} color={colors.primary} />}
            />
          )}
        </View>

        {cultures.length === 0 ? (
          <EmptyState
            title="Aucune culture"
            message={
              zones.length === 0
                ? 'Ajoutez d\'abord une zone à cette parcelle.'
                : 'Ajoutez une culture pour suivre votre production.'
            }
            icon={<Ionicons name="leaf-outline" size={36} color={colors.icon} />}
          />
        ) : (
          cultures.map((culture) => {
            const cs = CULTURE_STATUS[culture.status] ?? CULTURE_STATUS.planned;
            return (
              <Card
                key={culture.id}
                title={culture.name}
                subtitle={culture.type}
                onPress={() => router.push(`/culture/${culture.id}?parcelId=${id}` as any)}
                rightAction={<Badge text={cs.label} variant={cs.variant} />}
              >
                <View style={styles.cultureFooter}>
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    Planté: {formatDate(culture.plantingDate)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Modifier"
          onPress={() => router.push(`/parcel/edit/${id}` as any)}
          variant="outline"
          icon={<Ionicons name="pencil" size={18} color={colors.primary} />}
          style={{ marginBottom: Spacing.sm }}
        />
        <Button
          title="Supprimer"
          onPress={() => setShowDelete(true)}
          variant="danger"
          icon={<Ionicons name="trash" size={18} color="#fff" />}
        />
      </View>

      <ConfirmDialog
        visible={showDelete}
        title="Supprimer la parcelle"
        message="Cette action est irréversible. Toutes les zones, cultures et récoltes associées seront perdues."
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
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  parcelName: { fontSize: 24, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 13 },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.md },
  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  zoneFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  cultureFooter: { marginTop: Spacing.xs },
  dateText: { fontSize: 12 },
  actions: { marginTop: Spacing.xl },
});
