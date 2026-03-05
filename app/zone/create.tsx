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
import { ZoneFormData } from '@/types';
import * as zoneService from '@/services/zone.service';

export default function CreateZoneScreen() {
  const { parcelId } = useLocalSearchParams<{ parcelId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [surface, setSurface] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nom requis';
    if (!surface.trim()) newErrors.surface = 'Surface requise';
    else if (isNaN(Number(surface)) || Number(surface) <= 0)
      newErrors.surface = 'Surface invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate() || !parcelId) return;
    setLoading(true);
    try {
      const data: ZoneFormData = {
        name: name.trim(),
        surface: Number(surface),
      };
      await zoneService.createZone(parcelId, data);
      Alert.alert('Succès', 'Zone créée avec succès');
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer la zone');
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
          label="Nom de la zone"
          placeholder="Ex: Zone A, Secteur Nord"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: '' }));
          }}
          error={errors.name}
        />

        <Input
          label="Surface (hectares)"
          placeholder="Ex: 0.5"
          value={surface}
          onChangeText={(t) => {
            setSurface(t);
            if (errors.surface) setErrors((e) => ({ ...e, surface: '' }));
          }}
          error={errors.surface}
          keyboardType="decimal-pad"
        />

        <Button
          title="Créer la zone"
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
