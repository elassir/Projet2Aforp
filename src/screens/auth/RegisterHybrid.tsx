import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuthHybrid } from '../../provider/AuthProviderHybrid';

export default function RegisterHybridScreen({ navigation }: any) {
  const { isDarkmode } = useTheme();
  const { register, loading } = useAuthHybrid();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !nom.trim() || !prenom.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const { error } = await register(email, password, nom, prenom);
    
    if (error) {
      Alert.alert(
        'Erreur d\'inscription',
        error.message || 'Impossible de créer le compte'
      );
    } else {
      Alert.alert(
        'Inscription réussie',
        'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Layout>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* En-tête */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <View
              style={{
                height: 80,
                width: 80,
                backgroundColor: themeColor.primary,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Ionicons 
                name="person-add-outline" 
                size={40} 
                color="white" 
              />
            </View>
            <Text
              fontWeight="bold"
              size="h3"
              style={{
                alignSelf: 'center',
                marginBottom: 10,
              }}
            >
              Créer un compte
            </Text>
            <Text
              size="md"
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                color: isDarkmode ? '#9CA3AF' : '#6B7280',
              }}
            >
              Rejoignez-nous pour gérer vos réservations
            </Text>
          </View>

          {/* Formulaire */}
          <View style={{ width: '100%', maxWidth: 400 }}>
            
            {/* Prénom */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5 }}>Prénom *</Text>
              <TextInput
                placeholder="Votre prénom"
                value={prenom}
                autoCapitalize="words"
                autoComplete="given-name"
                onChangeText={setPrenom}
                leftContent={
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                  />
                }
              />
            </View>

            {/* Nom */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5 }}>Nom *</Text>
              <TextInput
                placeholder="Votre nom de famille"
                value={nom}
                autoCapitalize="words"
                autoComplete="family-name"
                onChangeText={setNom}
                leftContent={
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                  />
                }
              />
            </View>

            {/* Email */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5 }}>Email *</Text>
              <TextInput
                placeholder="votre@email.com"
                value={email}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                leftContent={
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                  />
                }
              />
            </View>

            {/* Mot de passe */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5 }}>Mot de passe *</Text>
              <TextInput
                placeholder="Au moins 6 caractères"
                value={password}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                leftContent={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                  />
                }
                rightContent={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Confirmation mot de passe */}
            <View style={{ marginBottom: 25 }}>
              <Text style={{ marginBottom: 5 }}>Confirmer le mot de passe *</Text>
              <TextInput
                placeholder="Retapez votre mot de passe"
                value={confirmPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                autoCorrect={false}
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
                leftContent={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                  />
                }
                rightContent={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={isDarkmode ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Bouton d'inscription */}
            <Button
              text={loading ? "Création du compte..." : "Créer mon compte"}
              onPress={handleRegister}
              style={{ marginBottom: 15 }}
              disabled={loading}
            />

            {/* Note sur les champs obligatoires */}
            <Text
              size="sm"
              style={{
                textAlign: 'center',
                color: isDarkmode ? '#9CA3AF' : '#6B7280',
                marginBottom: 30,
              }}
            >
              * Champs obligatoires
            </Text>

          </View>

          {/* Connexion */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Text size="md">Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                size="md"
                fontWeight="bold"
                style={{
                  color: themeColor.primary,
                }}
              >
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
