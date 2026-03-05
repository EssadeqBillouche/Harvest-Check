import React, { useEffect, useState, useCallback } from 'react';
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
import { LoadingView } from '@/components/ui/loading-view';
import { Parcel, ParcelFormData, ParcelStatus } from '@/types';
import * as parcelService from '@/services/parcel.service';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Jachère', value: 'fallow' },
  { label: 'Archivée', value: 'archived' },
];

export default function EditParcelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [surface, setSurface] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ParcelStatus>('active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadParcel = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await parcelService.getParcel(id);
      if (data) {
        setParcel(data);
        setName(data.name);
        setSurface(String(data.surface));
        setLocation(data.location);
        setStatus(data.status);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la parcelle');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadParcel();
  }, [loadParcel]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nom requis';
    if (!surface.trim()) newErrors.surface = 'Surface requise';
    else if (isNaN(Number(surface)) || Number(surface) <= 0)
      newErrors.surface = 'Surface invalide';
    if (!location.trim()) newErrors.location = 'Localisation requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !id) return;
    setSaving(true);
    try {
      const data: Partial<ParcelFormData> = {
        name: name.trim(),
        surface: Number(surface),
        location: location.trim(),
        status,
      };
      await parcelService.updateParcel(id, data);
      Alert.alert('Succès', 'Parcelle mise à jour');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la parcelle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingView />;
  }

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
          label="Nom de la parcelle"
          placeholder="Ex: Parcelle Nord"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: '' }));
          }}
          error={errors.name}
        />

        <Input
          label="Surface (hectares)"
          placeholder="Ex: 2.5"
          value={surface}
          onChangeText={(t) => {
            setSurface(t);
            if (errors.surface) setErrors((e) => ({ ...e, surface: '' }));
          }}
          error={errors.surface}
          keyboardType="decimal-pad"
        />

        <Input
          label="Localisation"
          placeholder="Ex: Route de Meknès, Km 5"
          value={location}
          onChangeText={(t) => {
            setLocation(t);
            if (errors.location) setErrors((e) => ({ ...e, location: '' }));
          }}
          error={errors.location}
        />

        <Select
          label="Statut"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v as ParcelStatus)}
        />

        <Button
          title="Enregistrer les modifications"
          onPress={handleSave}
          loading={saving}
          size="lg"
          style={{ marginTop: Spacing.md }}
        />

        <Button
          title="Annuler"
          onPress={() => router.back()}
          variant="ghost"
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
});
