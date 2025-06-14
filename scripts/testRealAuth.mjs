/**
 * Test complet de l'authentification avec création de données réelles
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealAuthFlow() {
  console.log('🧪 TEST COMPLET DU FLUX D\'AUTHENTIFICATION');
  console.log('⏰ ' + new Date().toLocaleString('fr-FR'));
  console.log('=' .repeat(50) + '\n');

  try {
    // Étape 1: Test d'inscription avec un vrai email
    console.log('1️⃣ Test d\'inscription avec email valide...');
    const testEmail = `test.user.${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Email de test: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.log('❌ Erreur d\'inscription:', signUpError.message);
      return false;
    }

    console.log('✅ Inscription réussie');
    console.log('👤 ID utilisateur:', signUpData.user?.id);
    console.log('📨 Confirmation requise:', !signUpData.session);

    // Étape 2: Tenter de créer le profil dans la table users
    console.log('\n2️⃣ Création du profil dans la table users...');
    
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          user_email: testEmail,
          user_nom: 'Dupont',
          user_prenom: 'Jean',
          user_role: 'user',
        })
        .select()
        .single();

      if (insertError) {
        console.log('❌ Erreur de création du profil:', insertError.message);
        console.log('🔧 Code d\'erreur:', insertError.code);
        
        if (insertError.code === '42703') {
          console.log('💡 Colonne manquante - vérifiez la structure de la table');
        } else if (insertError.code === '42501') {
          console.log('💡 Problème de permissions RLS');
        }
        return false;
      } else {
        console.log('✅ Profil créé avec succès');
        console.log('📋 Données du profil:', insertData);
      }

    } catch (error) {
      console.log('💥 Exception lors de la création du profil:', error.message);
      return false;
    }

    // Étape 3: Test de récupération du profil
    console.log('\n3️⃣ Test de récupération du profil...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_email', testEmail)
      .single();

    if (profileError) {
      console.log('❌ Erreur de récupération:', profileError.message);
      return false;
    } else {
      console.log('✅ Profil récupéré avec succès');
      console.log('📊 Structure du profil:', Object.keys(profileData));
      console.log('👥 Données:', profileData);
    }

    // Étape 4: Test de mise à jour du profil
    console.log('\n4️⃣ Test de mise à jour du profil...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        user_nom: 'Martin',
        user_prenom: 'Pierre',
      })
      .eq('user_email', testEmail)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erreur de mise à jour:', updateError.message);
      return false;
    } else {
      console.log('✅ Profil mis à jour avec succès');
      console.log('📝 Nouvelles données:', updateData);
    }

    // Étape 5: Simuler le flux AuthProviderHybrid
    console.log('\n5️⃣ Simulation du flux AuthProviderHybrid...');
    
    const fetchUserProfile = async (authUserId, email) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('user_nom, user_prenom, user_role')
          .eq('user_email', email.toLowerCase())
          .single();

        if (error) {
          console.log('Aucun profil personnalisé trouvé');
          return {
            id: authUserId,
            email: email,
          };
        }

        return {
          id: authUserId,
          email: email,
          user_nom: data.user_nom,
          user_prenom: data.user_prenom,
          user_role: data.user_role,
        };
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return {
          id: authUserId,
          email: email,
        };
      }
    };

    const hybridUser = await fetchUserProfile(signUpData.user?.id, testEmail);
    console.log('✅ Données utilisateur hybride:', hybridUser);

    console.log('\n🎉 TOUS LES TESTS ONT RÉUSSI !');
    console.log('✅ L\'authentification hybride fonctionne correctement');
    
    return true;

  } catch (error) {
    console.log('💥 Erreur générale:', error.message);
    return false;
  }
}

async function checkCurrentState() {
  console.log('📊 Vérification de l\'état actuel de la base...\n');

  try {
    // Vérifier les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.log('❌ Erreur d\'accès aux utilisateurs:', usersError.message);
    } else {
      console.log(`👥 Utilisateurs dans la table users: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('📋 Structure détectée:', Object.keys(users[0]));
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.user_email} (${user.user_nom} ${user.user_prenom})`);
        });
      }
    }

    // Vérifier les utilisateurs auth
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      console.log(`🔐 Session active: ${session.session.user.email}`);
    } else {
      console.log('🔐 Aucune session active');
    }

  } catch (error) {
    console.log('💥 Erreur:', error.message);
  }
}

async function main() {
  await checkCurrentState();
  console.log('\n' + '=' .repeat(50) + '\n');
  
  const success = await testRealAuthFlow();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 RÉSULTAT FINAL:');
  
  if (success) {
    console.log('🎯 ✅ AUTHENTIFICATION HYBRIDE OPÉRATIONNELLE');
    console.log('📱 L\'application peut maintenant utiliser AuthProviderHybrid');
    console.log('🔄 Testez maintenant l\'inscription/connexion dans l\'app');
  } else {
    console.log('🎯 ❌ PROBLÈMES DÉTECTÉS');
    console.log('🔧 Vérifiez la configuration Supabase et les policies RLS');
    console.log('📚 Consultez SUPABASE_AUTH_VERIFICATION.md pour plus de détails');
  }
}

main().catch(console.error);
