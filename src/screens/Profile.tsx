import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Layout,
  Text,
  themeColor,
  useTheme,
  Button,
  TopNav,
  Section,
  SectionContent,
  TextInput,
} from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../initSupabase';
import { useAuth } from '../provider/AuthProvider';
import { MainStackNavigationProp } from '../types/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
}

export default function ProfileScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { user, signOut } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
      } else {
        // Créer un profil par défaut
        const defaultProfile = {
          id: user.id,
          email: user.email || '',
          full_name: '',
          phone: '',
          address: '',
          created_at: new Date().toISOString(),
        };
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      
      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setEditing(false);
      Alert.alert('Succès', 'Votre profil a été mis à jour');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
    setEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <TopNav middleContent="Mon Profil" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Chargement du profil...</Text>
        </View>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <TopNav middleContent="Mon Profil" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Impossible de charger le profil</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <TopNav
        middleContent="Mon Profil"
        rightContent={
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons
              name={editing ? 'close' : 'pencil'}
              size={20}
              color={isDarkmode ? themeColor.white100 : themeColor.dark}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Avatar et nom */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <View style={styles.header}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: isDarkmode ? '#374151' : '#F3F4F6' }
                ]}
              >
                <Ionicons
                  name="person"
                  size={50}
                  color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                />
              </View>
              
              <Text fontWeight="bold" size="xl" style={{ marginTop: 16, textAlign: 'center' }}>
                {profile.full_name || 'Nom non renseigné'}
              </Text>
              
              <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280', textAlign: 'center' }}>
                {profile.email}
              </Text>
              
              <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginTop: 4 }}>
                Membre depuis le {formatDate(profile.created_at)}
              </Text>
            </View>
          </SectionContent>
        </Section>

        {/* Informations personnelles */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 16 }}>
              Informations personnelles
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8 }}>Nom complet</Text>
              {editing ? (
                <TextInput
                  placeholder="Votre nom complet"
                  value={fullName}
                  onChangeText={setFullName}
                />
              ) : (
                <View style={[styles.infoField, { backgroundColor: isDarkmode ? '#374151' : '#F9FAFB' }]}>
                  <Text>{profile.full_name || 'Non renseigné'}</Text>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8 }}>Téléphone</Text>
              {editing ? (
                <TextInput
                  placeholder="Votre numéro de téléphone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              ) : (
                <View style={[styles.infoField, { backgroundColor: isDarkmode ? '#374151' : '#F9FAFB' }]}>
                  <Text>{profile.phone || 'Non renseigné'}</Text>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8 }}>Adresse</Text>
              {editing ? (
                <TextInput
                  placeholder="Votre adresse"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <View style={[styles.infoField, { backgroundColor: isDarkmode ? '#374151' : '#F9FAFB' }]}>
                  <Text>{profile.address || 'Non renseigné'}</Text>
                </View>
              )}
            </View>            {editing && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <Button
                  text="Annuler"
                  onPress={handleCancel}
                  style={{ flex: 1 }}
                />
                <Button
                  text={saving ? "Sauvegarde..." : "Sauvegarder"}
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </SectionContent>
        </Section>

        {/* Actions rapides */}
        <Section style={{ marginBottom: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" size="lg" style={{ marginBottom: 16 }}>
              Actions rapides
            </Text>            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: isDarkmode ? '#374151' : '#E5E7EB' }]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="calendar-outline" size={24} color={themeColor.primary} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text fontWeight="bold">Mes réservations</Text>
                <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Voir et gérer vos réservations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkmode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: isDarkmode ? '#374151' : '#E5E7EB' }]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="school-outline" size={24} color={themeColor.primary} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text fontWeight="bold">Mes cours</Text>
                <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Voir vos cours et inscriptions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkmode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </SectionContent>
        </Section>

        {/* Déconnexion */}
        <Section style={{ marginBottom: 40 }}>
          <SectionContent>
            <Button
              text="Se déconnecter"
              status="danger"
              onPress={handleSignOut}
              leftContent={<Ionicons name="log-out-outline" size={20} color="white" />}
            />
          </SectionContent>
        </Section>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoField: {
    padding: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
});
