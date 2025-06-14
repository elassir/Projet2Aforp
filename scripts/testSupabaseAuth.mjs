/**
 * Script de test pour vérifier la configuration Supabase
 * Exécutez ce script avec : node scripts/testSupabaseAuth.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase directe (remplacez par vos vraies valeurs)
const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Vérifiez que les URLs et clés Supabase sont correctes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔄 Test de connexion à Supabase...\n');

  try {
    // Test 1: Connexion de base
    console.log('1️⃣ Test de connexion de base...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return false;
    }
    console.log('✅ Connexion à Supabase réussie\n');

    // Test 2: Vérification de la table users
    console.log('2️⃣ Vérification de la structure de la table users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Erreur lors de l\'accès à la table users:', usersError.message);
      console.log('💡 Vérifiez que la table existe et que les policies RLS sont configurées');
      return false;
    }
    console.log('✅ Table users accessible\n');

    // Test 3: Vérification des policies RLS
    console.log('3️⃣ Test d\'une inscription fictive...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      console.log('❌ Erreur lors de l\'inscription test:', signUpError.message);
      return false;
    }

    console.log('✅ Inscription test réussie');
    console.log('📧 Email test:', testEmail);

    // Test 4: Nettoyage (suppression de l'utilisateur test)
    if (signUpData.user) {
      console.log('🧹 Nettoyage de l\'utilisateur test...');
      
      // Note: La suppression d'utilisateur nécessite des privilèges admin
      // En production, vous devriez implémenter une fonction edge pour cela
      console.log('⚠️  Nettoyage manuel requis pour l\'utilisateur:', testEmail);
    }

    console.log('\n✅ Tous les tests Supabase ont réussi !');
    return true;

  } catch (error) {
    console.log('❌ Erreur inattendue:', error.message);
    return false;
  }
}

async function testAuthFlow() {
  console.log('\n🔄 Test du flux d\'authentification...\n');

  try {
    // Test de connexion avec un utilisateur existant (si il y en a)
    console.log('4️⃣ Vérification de la session actuelle...');
    const { data: session } = await supabase.auth.getSession();
    
    if (session.session) {
      console.log('✅ Session active trouvée pour:', session.session.user.email);
      
      // Test de récupération du profil
      console.log('5️⃣ Test de récupération du profil...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_email', session.session.user.email)
        .single();

      if (profileError) {
        console.log('❌ Erreur lors de la récupération du profil:', profileError.message);
        console.log('💡 Le profil n\'existe peut-être pas dans la table users');
      } else {
        console.log('✅ Profil récupéré avec succès:', profile);
      }
    } else {
      console.log('ℹ️  Aucune session active (normal si aucun utilisateur connecté)');
    }

  } catch (error) {
    console.log('❌ Erreur lors du test d\'authentification:', error.message);
  }
}

async function testHybridAuthFlow() {
  console.log('\n🔄 Test du flux d\'authentification hybride...\n');

  try {
    // Test 1: Vérifier la structure de la table users
    console.log('1️⃣ Vérification de la structure de la table users...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('user_id, user_email, user_nom, user_prenom, user_role')
      .limit(0);

    if (tableError) {
      console.log('❌ Erreur d\'accès à la table users:', tableError.message);
      console.log('💡 Vérifiez que la table existe et que les policies RLS sont configurées');
      return false;
    }
    console.log('✅ Structure de la table users confirmée\n');

    // Test 2: Vérifier la session actuelle
    console.log('2️⃣ Vérification de la session Supabase Auth...');
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      console.log('✅ Session active trouvée pour:', sessionData.session.user.email);
      
      // Test 3: Tester la synchronisation avec la table users
      console.log('3️⃣ Test de synchronisation avec la table users...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_email', sessionData.session.user.email)
        .single();

      if (profileError) {
        console.log('❌ Erreur lors de la récupération du profil:', profileError.message);
        console.log('💡 Le profil n\'existe peut-être pas dans la table users');
        console.log('💡 L\'utilisateur doit s\'inscrire via l\'AuthProviderHybrid pour créer le profil');
      } else {
        console.log('✅ Profil utilisateur récupéré avec succès:');
        console.log('   - ID Auth:', sessionData.session.user.id);
        console.log('   - Email:', profile.user_email);
        console.log('   - Nom:', profile.user_nom || 'Non renseigné');
        console.log('   - Prénom:', profile.user_prenom || 'Non renseigné');
        console.log('   - Rôle:', profile.user_role || 'user');
      }
    } else {
      console.log('ℹ️  Aucune session active');
      console.log('💡 Connectez-vous via l\'application pour tester la synchronisation');
    }

    // Test 4: Vérifier les policies RLS
    console.log('4️⃣ Test des policies RLS...');
    const { data: usersCount, error: countError } = await supabase
      .from('users')
      .select('user_id', { count: 'exact' });

    if (countError) {
      console.log('❌ Erreur RLS:', countError.message);
      console.log('💡 Les policies RLS bloquent l\'accès - c\'est normal si pas connecté');
    } else {
      console.log('✅ Accès aux données autorisé');
    }

    return true;

  } catch (error) {
    console.log('❌ Erreur lors du test hybride:', error.message);
    return false;
  }
}

async function displayConfig() {
  console.log('⚙️  Configuration Supabase:');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Non définie');
  console.log();
}

// Exécution des tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de configuration Supabase\n');
  
  displayConfig();
  
  const connectionOk = await testSupabaseConnection();
  
  if (connectionOk) {
    await testAuthFlow();
    await testHybridAuthFlow();
  }
  console.log('\n📋 Résumé:');
  console.log(connectionOk ? '✅ Configuration Supabase opérationnelle' : '❌ Configuration Supabase à corriger');
  console.log('\n🔧 Actions recommandées:');
  console.log('1. Utiliser exclusivement AuthProviderHybrid');
  console.log('2. Supprimer AuthProviderSQL (mots de passe en plain text)');
  console.log('3. Vérifier les policies RLS sur la table users');
  console.log('4. Tester inscription/connexion dans l\'app');
  console.log('\n💡 Consultez SUPABASE_AUTH_VERIFICATION.md pour plus de détails');
}

runAllTests().catch(console.error);
