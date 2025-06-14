import React, { useEffect } from 'react';
import { useAuthHybrid } from '../provider/AuthProviderHybrid';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';

import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';

// Composant de débogage en cas d'erreur
const DebugScreen = ({ user, loading }: { user: any, loading: boolean }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Informations de débogage
      </Text>
      <Text style={{ marginBottom: 10 }}>État de chargement: {loading ? 'En cours' : 'Terminé'}</Text>
      <Text style={{ marginBottom: 10 }}>Utilisateur: {user ? 'Connecté' : 'Non connecté'}</Text>
      {user && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', width: '100%' }}>
          <Text style={{ fontWeight: 'bold' }}>Détails utilisateur:</Text>
          <Text>ID: {user.id || 'Non défini'}</Text>
          <Text>Email: {user.email || 'Non défini'}</Text>
          <Text>Nom: {user.user_nom || 'Non défini'}</Text>
          <Text>Prénom: {user.user_prenom || 'Non défini'}</Text>
          <Text>Rôle: {user.user_role || 'Non défini'}</Text>
        </View>
      )}
    </View>
  );
};

export default () => {
	const { user, loading } = useAuthHybrid();
	
	// Afficher des informations de débogage dans la console
	useEffect(() => {
	  console.log('État de navigation:', { loading, userExists: !!user });
	  if (user) {
	    console.log('Utilisateur détecté:', { 
	      id: user.id,
	      email: user.email,
	      nom: user.user_nom,
	      prenom: user.user_prenom
	    });
	  }
	}, [loading, user]);
		return (
		<NavigationContainer>
			{loading && <Loading />}
			{!loading && !user && <Auth />}
			{!loading && user && <Main />}
			{/* Activation temporaire de l'écran de débogage pour vérifier l'authentification */}
			{/* <DebugScreen user={user} loading={loading} /> */}
		</NavigationContainer>
	);
};
