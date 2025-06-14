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
import { useAuthHybrid } from '../provider/AuthProviderHybrid';
import { MainStackNavigationProp } from '../types/navigation';

export default function ProfileScreen() {
  const { isDarkmode } = useTheme();
  const navigation = useNavigation<MainStackNavigationProp>();
  const { user, logout } = useAuthHybrid();
  
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // États pour l'édition
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  useEffect(() => {
    if (user) {
      setNom(user.user_nom || '');
      setPrenom(user.user_prenom || '');
      setLoading(false);
    }
  }, [user]);
  const handleCancel = () => {
    setEditing(false);
    setNom(user?.user_nom || '');
    setPrenom(user?.user_prenom || '');
  };
  const handleSave = async () => {
    if (!user?.email) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          user_nom: nom,
          user_prenom: prenom,
        })
        .eq('user_email', user.email);

      if (error) {
        Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
        console.error('Erreur mise à jour profil:', error);
      } else {
        setEditing(false);
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        // Optionnel: recharger les données utilisateur
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setSaving(false);
    }
  };
  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Date non disponible';
    }
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

  if (!user) {
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
              </View>                <Text fontWeight="bold" size="xl" style={{ marginTop: 16, textAlign: 'center' }}>
                {user.user_prenom && user.user_nom 
                  ? `${user.user_prenom} ${user.user_nom}` 
                  : user.user_nom || 'Nom non renseigné'}
              </Text>
                <Text style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280', textAlign: 'center' }}>
                {user.email}
              </Text>
              
              {user.user_role && (
                <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginTop: 4 }}>
                  Rôle: {user.user_role}
                </Text>
              )}
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
                  value={nom}
                  onChangeText={setNom}
                />              ) : (
                <View style={[styles.infoField, { backgroundColor: isDarkmode ? '#374151' : '#F9FAFB' }]}>
                  <Text>{user.user_nom || 'Non renseigné'}</Text>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8 }}>Prénom</Text>
              {editing ? (
                <TextInput
                  placeholder="Votre prénom"
                  value={prenom}
                  onChangeText={setPrenom}
                />
              ) : (
                <View style={[styles.infoField, { backgroundColor: isDarkmode ? '#374151' : '#F9FAFB' }]}>
                  <Text>{user.user_prenom || 'Non renseigné'}</Text>
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
            </Text>
            
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: isDarkmode ? '#374151' : '#E5E7EB' }]}
              onPress={() => navigation.navigate('ReservationsScreenSQL')}
            >
              <Ionicons name="calendar-outline" size={24} color={themeColor.primary} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text fontWeight="bold">Mes réservations</Text>
                <Text size="sm" style={{ color: isDarkmode ? '#9CA3AF' : '#6B7280' }}>
                  Voir et gérer vos réservations
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkmode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionItem, { borderBottomColor: isDarkmode ? '#374151' : '#E5E7EB' }]}
              onPress={() => navigation.navigate('CoursScreenSQL')}
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
