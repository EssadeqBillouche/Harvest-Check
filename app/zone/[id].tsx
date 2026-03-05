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
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingView } from '@/components/ui/loading-view';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Zone, Culture } from '@/types';
import * as zoneService from '@/services/zone.service';
import * as cultureService from '@/services/culture.service';
import { formatDate } from '@/utils/date';

const CULTURE_STATUS: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  planned: { label: 'Planifiée', variant: 'info' },
  growing: { label: 'En croissance', variant: 'success' },
  harvested: { label: 'Récoltée', variant: 'warning' },
  failed: { label: 'Échouée', variant: 'danger' },
};

export default function ZoneDetailScreen() {
  const { id, parcelId } = useLocalSearchParams<{ id: string; parcelId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [zone, setZone] = useState<Zone | null>(null);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [zoneData, culturesData] = await Promise.all([
        zoneService.getZone(id),
        cultureService.getCulturesByZone(id),
      ]);
      setZone(zoneData);
      setCultures(culturesData);
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
      await zoneService.deleteZone(id);
      Alert.alert('Succès', 'Zone supprimée');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de supprimer la zone');
    }
  };

  if (loading || !zone) {
    return <LoadingView />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      {/* Zone Header */}
      <View style={styles.header}>
        <Text style={[styles.zoneName, { color: colors.text }]}>{zone.name}</Text>
        <Text style={[styles.zoneInfo, { color: colors.textSecondary }]}>
          {zone.surface} hectares · Créée le {formatDate(zone.createdAt)}
        </Text>
      </View>

      {/* Cultures in this Zone */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Cultures ({cultures.length})
          </Text>
          <Button
            title="Ajouter"
            onPress={() =>
              router.push(`/culture/create?parcelId=${parcelId}&zoneId=${id}` as any)
            }
            size="sm"
            variant="ghost"
            fullWidth={false}
            icon={<Ionicons name="add" size={16} color={colors.primary} />}
          />
        </View>

        {cultures.length === 0 ? (
          <EmptyState
            title="Aucune culture"
            message="Ajoutez une culture dans cette zone."
            actionLabel="Ajouter une culture"
            onAction={() =>
              router.push(`/culture/create?parcelId=${parcelId}&zoneId=${id}` as any)
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
                onPress={() =>
                  router.push(`/culture/${culture.id}?parcelId=${parcelId}` as any)
                }
                rightAction={<Badge text={cs.label} variant={cs.variant} />}
              >
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  Planté: {formatDate(culture.plantingDate)}
                </Text>
              </Card>
            );
          })
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Supprimer la zone"
          onPress={() => setShowDelete(true)}
          variant="danger"
          icon={<Ionicons name="trash" size={18} color="#fff" />}
        />
      </View>

      <ConfirmDialog
        visible={showDelete}
        title="Supprimer la zone"
        message="Toutes les cultures et récoltes de cette zone seront perdues."
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
  zoneName: { fontSize: 24, fontWeight: '800' },
  zoneInfo: { fontSize: 14, marginTop: Spacing.xs },
  section: { marginTop: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  dateText: { fontSize: 12, marginTop: Spacing.xs },
  actions: { marginTop: Spacing.xl },
});
