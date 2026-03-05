import React, { useState } from 'react';
import {
  View,
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
import { HarvestFormData, HarvestQuality } from '@/types';
import * as harvestService from '@/services/harvest.service';
import { getDateInputValue } from '@/utils/date';

const QUALITY_OPTIONS = [
  { label: 'Excellent', value: 'excellent' },
  { label: 'Bon', value: 'good' },
  { label: 'Moyen', value: 'average' },
  { label: 'Faible', value: 'poor' },
];

export default function CreateHarvestScreen() {
  const { parcelId, zoneId, cultureId } = useLocalSearchParams<{
    parcelId: string;
    zoneId: string;
    cultureId: string;
  }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [date, setDate] = useState(getDateInputValue());
  const [weight, setWeight] = useState('');
  const [quality, setQuality] = useState<HarvestQuality>('good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Date requise';
    if (!weight.trim()) newErrors.weight = 'Poids requis';
    else if (isNaN(Number(weight)) || Number(weight) <= 0)
      newErrors.weight = 'Poids invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !parcelId || !zoneId || !cultureId) return;
    setLoading(true);
    try {
      const data: HarvestFormData = {
        date: new Date(date).toISOString(),
        weight: Number(weight),
        quality,
        notes: notes.trim(),
      };
      await harvestService.createHarvest(parcelId, zoneId, cultureId, data);
      Alert.alert('Succès', 'Récolte enregistrée avec succès');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la récolte');
    } finally {
      setLoading(false);
    }
  };

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
          label="Date de récolte (AAAA-MM-JJ)"
          placeholder="2026-03-05"
          value={date}
          onChangeText={(t) => {
            setDate(t);
            if (errors.date) setErrors((e) => ({ ...e, date: '' }));
          }}
          error={errors.date}
        />

        <Input
          label="Poids récolté (kg)"
          placeholder="Ex: 150"
          value={weight}
          onChangeText={(t) => {
            setWeight(t);
            if (errors.weight) setErrors((e) => ({ ...e, weight: '' }));
          }}
          error={errors.weight}
          keyboardType="decimal-pad"
        />

        <Select
          label="Qualité"
          options={QUALITY_OPTIONS}
          value={quality}
          onChange={(v) => setQuality(v as HarvestQuality)}
        />

        <Input
          label="Notes (optionnel)"
          placeholder="Observations, conditions météo..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Button
          title="Enregistrer la récolte"
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
