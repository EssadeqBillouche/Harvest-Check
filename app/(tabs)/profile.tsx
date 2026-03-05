import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth.context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setShowLogout(false);
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.displayName ?? 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.displayName ?? 'Agriculteur'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Profile Card */}
        <Card
          title="Informations personnelles"
          rightAction={
            !isEditing ? (
              <Button
                title="Modifier"
                onPress={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                fullWidth={false}
                icon={<Ionicons name="pencil" size={14} color={colors.primary} />}
              />
            ) : undefined
          }
        >
          {isEditing ? (
            <>
              <Input
                label="Nom complet"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Votre nom"
                leftIcon={<Ionicons name="person-outline" size={18} color={colors.icon} />}
              />
              <Input
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                placeholder="+212 6XX XXX XXX"
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={18} color={colors.icon} />}
              />
              <Input
                label="Adresse"
                value={address}
                onChangeText={setAddress}
                placeholder="Votre adresse"
                leftIcon={<Ionicons name="location-outline" size={18} color={colors.icon} />}
              />
              <View style={styles.editActions}>
                <Button
                  title="Annuler"
                  onPress={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName ?? '');
                    setPhone(user?.phone ?? '');
                    setAddress(user?.address ?? '');
                  }}
                  variant="ghost"
                  fullWidth={false}
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <Button
                  title="Enregistrer"
                  onPress={handleSave}
                  loading={saving}
                  fullWidth={false}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          ) : (
            <>
              <ProfileRow
                icon="person-outline"
                label="Nom"
                value={user?.displayName}
                colors={colors}
              />
              <ProfileRow
                icon="call-outline"
                label="Téléphone"
                value={user?.phone || 'Non renseigné'}
                colors={colors}
              />
              <ProfileRow
                icon="location-outline"
                label="Adresse"
                value={user?.address || 'Non renseignée'}
                colors={colors}
              />
            </>
          )}
        </Card>

        {/* Logout */}
        <Button
          title="Se déconnecter"
          onPress={() => setShowLogout(true)}
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
          style={{ marginTop: Spacing.lg }}
        />

        <ConfirmDialog
          visible={showLogout}
          title="Déconnexion"
          message="Êtes-vous sûr de vouloir vous déconnecter ?"
          confirmLabel="Déconnexion"
          variant="danger"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value?: string;
  colors: any;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={18} color={colors.icon} />
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.md,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12 },
  rowValue: { fontSize: 15, fontWeight: '500', marginTop: 1 },
  editActions: { flexDirection: 'row', marginTop: Spacing.sm },
});
