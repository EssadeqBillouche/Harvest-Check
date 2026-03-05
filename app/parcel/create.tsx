import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useParcels } from '@/hooks/use-parcels';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { ParcelFormData, ParcelStatus } from '@/types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Jachère', value: 'fallow' },
  { label: 'Archivée', value: 'archived' },
];

export default function CreateParcelScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { create } = useParcels();

  const [name, setName] = useState('');
  const [surface, setSurface] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ParcelStatus>('active');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data: ParcelFormData = {
        name: name.trim(),
        surface: Number(surface),
        location: location.trim(),
        status,
      };
      await create(data);
      Alert.alert('Succès', 'Parcelle créée avec succès');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la parcelle');
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
          title="Créer la parcelle"
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
