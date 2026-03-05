import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LoadingView } from '@/components/ui/loading-view';
import { CultureFormData, CultureStatus, CultureType, Zone } from '@/types';
import * as cultureService from '@/services/culture.service';
import * as zoneService from '@/services/zone.service';
import { nowISO, getDateInputValue } from '@/utils/date';

const TYPE_OPTIONS = [
  { label: 'Céréales', value: 'cereals' },
  { label: 'Légumes', value: 'vegetables' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Légumineuses', value: 'legumes' },
  { label: 'Oléagineux', value: 'oilseeds' },
  { label: 'Autre', value: 'other' },
];

const STATUS_OPTIONS = [
  { label: 'Planifiée', value: 'planned' },
  { label: 'En croissance', value: 'growing' },
  { label: 'Récoltée', value: 'harvested' },
  { label: 'Échouée', value: 'failed' },
];

export default function CreateCultureScreen() {
  const { parcelId, zoneId } = useLocalSearchParams<{
    parcelId: string;
    zoneId?: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const [name, setName] = useState('');
  const [type, setType] = useState<CultureType>('cereals');
  const [selectedZoneId, setSelectedZoneId] = useState(zoneId ?? '');
  const [plantingDate, setPlantingDate] = useState(getDateInputValue());
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [status, setStatus] = useState<CultureStatus>('planned');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadZones() {
      if (!parcelId) return;
      try {
        const data = await zoneService.getZones(parcelId);
        setZones(data);
        if (!zoneId && data.length > 0) {
          setSelectedZoneId(data[0].id);
        }
      } catch {
        Alert.alert('Erreur', 'Impossible de charger les zones');
      } finally {
        setLoadingZones(false);
      }
    }
    loadZones();
  }, [parcelId, zoneId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nom requis';
    if (!selectedZoneId) newErrors.zone = 'Zone requise';
    if (!plantingDate) newErrors.plantingDate = 'Date de plantation requise';
    if (!expectedHarvestDate) newErrors.expectedHarvestDate = 'Date de récolte estimée requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !parcelId) return;
    setLoading(true);
    try {
      const data: CultureFormData = {
        name: name.trim(),
        type,
        plantingDate: new Date(plantingDate).toISOString(),
        expectedHarvestDate: new Date(expectedHarvestDate).toISOString(),
        status,
        notes: notes.trim(),
      };
      await cultureService.createCulture(parcelId, selectedZoneId, data);
      Alert.alert('Succès', 'Culture créée avec succès');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la culture');
    } finally {
      setLoading(false);
    }
  };

  if (loadingZones) {
    return <LoadingView />;
  }

  const zoneOptions = zones.map((z) => ({ label: `${z.name} (${z.surface} ha)`, value: z.id }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Nom de la culture"
          placeholder="Ex: Blé tendre, Tomates"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: '' }));
          }}
          error={errors.name}
        />

        <Select label="Type de culture" options={TYPE_OPTIONS} value={type} onChange={(v) => setType(v as CultureType)} />

        {!zoneId && (
          <Select
            label="Zone"
            options={zoneOptions}
            value={selectedZoneId}
            onChange={setSelectedZoneId}
            error={errors.zone}
          />
        )}

        <Input
          label="Date de plantation (AAAA-MM-JJ)"
          placeholder="2026-03-01"
          value={plantingDate}
          onChangeText={(t) => {
            setPlantingDate(t);
            if (errors.plantingDate) setErrors((e) => ({ ...e, plantingDate: '' }));
          }}
          error={errors.plantingDate}
        />

        <Input
          label="Date de récolte estimée (AAAA-MM-JJ)"
          placeholder="2026-07-15"
          value={expectedHarvestDate}
          onChangeText={(t) => {
            setExpectedHarvestDate(t);
            if (errors.expectedHarvestDate) setErrors((e) => ({ ...e, expectedHarvestDate: '' }));
          }}
          error={errors.expectedHarvestDate}
        />

        <Select label="Statut" options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as CultureStatus)} />

        <Input
          label="Notes (optionnel)"
          placeholder="Observations, remarques..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Button
          title="Créer la culture"
          onPress={handleCreate}
          loading={loading}
          size="lg"
          style={{ marginTop: Spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
});
