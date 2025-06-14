import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function LoginHybridScreen({ navigation }: any) {
  const { isDarkmode } = useTheme();
  const { login, loading } = useAuthHybrid();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const { error } = await login(email, password);
    
    if (error) {
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Impossible de se connecter'
      );
    } else {
      // La navigation sera automatiquement gérée par le provider
      console.log('Connexion réussie');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Layout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          
          {/* Logo */}
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
                name="fitness-outline" 
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
              Gestion Réservations
            </Text>
            <Text
              size="md"
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                color: isDarkmode ? '#9CA3AF' : '#6B7280',
              }}
            >
              Connectez-vous à votre compte
            </Text>
          </View>

          {/* Formulaire */}
          <View style={{ width: '100%', maxWidth: 400 }}>
            
            {/* Email */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ marginBottom: 5 }}>Email</Text>
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
            <View style={{ marginBottom: 20 }}>
              <Text style={{ marginBottom: 5 }}>Mot de passe</Text>
              <TextInput
                placeholder="Votre mot de passe"
                value={password}
                autoCapitalize="none"
                autoComplete="password"
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

            {/* Bouton de connexion */}
            <Button
              text={loading ? "Connexion..." : "Se connecter"}
              onPress={handleLogin}
              style={{ marginBottom: 15 }}
              disabled={loading}
            />

            {/* Mot de passe oublié */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgetPassword')}
              style={{ alignItems: 'center', marginBottom: 30 }}
            >
              <Text
                size="md"
                style={{
                  color: themeColor.primary,
                }}
              >
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

          </View>

          {/* Inscription */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text size="md">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text
                size="md"
                fontWeight="bold"
                style={{
                  color: themeColor.primary,
                }}
              >
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </Layout>
    </KeyboardAvoidingView>
  );
}
