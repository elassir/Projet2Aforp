/**
 * Script de diagnostic approfondi pour Supabase
 * Ce script identifie les problèmes spécifiques de configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseStructure() {
  console.log('🔍 DIAGNOSTIC DE LA STRUCTURE DE BASE DE DONNÉES\n');

  try {
    // Test 1: Vérifier la table users
    console.log('1️⃣ Analyse de la table users...');
    
    // Essayer de récupérer la structure (sans données sensibles)
    const { data, error } = await supabase
      .from('users')
      .select('user_id, user_email, user_nom, user_prenom, user_role, created_at')
      .limit(1);

    if (error) {
      console.log('❌ Erreur d\'accès à la table users:', error.message);
      console.log('💡 Code d\'erreur:', error.code);
      
      if (error.code === 'PGRST116') {
        console.log('🔧 SOLUTION: La table "users" n\'existe pas');
        console.log('   Exécutez le script SQL dans supabase-setup.sql');
      } else if (error.code === '42501') {
        console.log('🔧 SOLUTION: Problème de permissions RLS');
        console.log('   Vérifiez les policies dans Supabase Dashboard');
      }
    } else {
      console.log('✅ Table users accessible');
      console.log('📊 Structure détectée:', Object.keys(data[0] || {}));
    }

    // Test 2: Vérifier les utilisateurs auth existants
    console.log('\n2️⃣ Vérification des utilisateurs Supabase Auth...');
    
    const { data: session } = await supabase.auth.getSession();
    
    if (session.session) {
      console.log('✅ Session active détectée');
      console.log('👤 Utilisateur:', session.session.user.email);
      console.log('🔑 ID Auth:', session.session.user.id);
      
      // Vérifier si cet utilisateur a un profil dans la table users
      console.log('\n3️⃣ Vérification de la synchronisation...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_email', session.session.user.email)
        .single();

      if (profileError) {
        console.log('❌ Profil manquant dans la table users');
        console.log('🔧 SOLUTION: Créer le profil manuellement ou utiliser AuthProviderHybrid');
        
        // Proposer de créer le profil
        console.log('\n🛠️  Script SQL pour créer le profil:');
        console.log(`INSERT INTO users (user_email, user_role) VALUES ('${session.session.user.email}', 'user');`);
      } else {
        console.log('✅ Profil synchronisé trouvé');
        console.log('📝 Données profil:', profile);
      }
    } else {
      console.log('ℹ️  Aucune session active');
      console.log('💡 Connectez-vous d\'abord pour tester la synchronisation');
    }

  } catch (error) {
    console.log('❌ Erreur lors du diagnostic:', error.message);
  }
}

async function testAuthSettings() {
  console.log('\n🔍 DIAGNOSTIC DES PARAMÈTRES D\'AUTHENTIFICATION\n');

  try {
    // Test avec un email valide mais fictif
    console.log('4️⃣ Test des règles de validation d\'email...');
    
    const testEmail = 'testuser@gmail.com';
    const testPassword = 'TestPassword123!';

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.log('❌ Erreur d\'inscription test:', error.message);
      
      if (error.message.includes('invalid')) {
        console.log('🔧 SOLUTION: Vérifiez les paramètres de validation d\'email dans Supabase');
        console.log('   Dashboard > Authentication > Settings');
      } else if (error.message.includes('already registered')) {
        console.log('✅ Validation d\'email fonctionne (utilisateur déjà existant)');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('🔧 SOLUTION: Confirmation par email requise');
        console.log('   Dashboard > Authentication > Settings > Email confirmations');
      }
    } else {
      console.log('✅ Inscription test réussie');
      console.log('📧 Email de confirmation envoyé à:', testEmail);
      
      // Nettoyer l'utilisateur test (nécessite privilèges admin)
      console.log('🧹 Nettoyage requis pour:', testEmail);
    }

  } catch (error) {
    console.log('❌ Erreur lors du test d\'authentification:', error.message);
  }
}

async function checkApplicationConfiguration() {
  console.log('\n🔍 DIAGNOSTIC DE LA CONFIGURATION APPLICATION\n');

  try {
    // Vérifier les fichiers de configuration
    console.log('5️⃣ Vérification des configurations Supabase...');
    
    console.log('📁 Fichiers de configuration détectés:');
    console.log('   - src/initSupabase.ts');
    console.log('   - config/supabaseClient.js');
    
    console.log('\n🔧 Recommandations:');
    console.log('   1. Utiliser uniquement src/initSupabase.ts');
    console.log('   2. Supprimer config/supabaseClient.js pour éviter les conflits');
    console.log('   3. S\'assurer que tous les providers utilisent src/initSupabase.ts');

    // Vérifier les providers
    console.log('\n📦 Providers d\'authentification:');
    console.log('   ✅ AuthProviderHybrid (recommandé)');
    console.log('   ❌ AuthProviderSQL (à supprimer)');
    console.log('   ❌ AuthProvider (à supprimer)');

  } catch (error) {
    console.log('❌ Erreur lors de la vérification:', error.message);
  }
}

async function provideSolutions() {
  console.log('\n🎯 SOLUTIONS RECOMMANDÉES\n');

  console.log('ÉTAPE 1: Nettoyage des configurations');
  console.log('- Supprimer config/supabaseClient.js');
  console.log('- Supprimer AuthProviderSQL.tsx');
  console.log('- Utiliser uniquement AuthProviderHybrid');

  console.log('\nÉTAPE 2: Configuration Supabase Dashboard');
  console.log('- Désactiver la confirmation par email (temporairement pour les tests)');
  console.log('- Vérifier les policies RLS sur la table users');
  console.log('- S\'assurer que la table users existe');

  console.log('\nÉTAPE 3: Tests d\'intégration');
  console.log('- Tester inscription avec l\'app');
  console.log('- Vérifier la création automatique du profil');
  console.log('- Tester la connexion et l\'affichage du profil');

  console.log('\nÉTAPE 4: Scripts SQL à exécuter');
  console.log(`
-- Si la table users n'existe pas:
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  user_nom TEXT,
  user_prenom TEXT,
  user_role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy pour voir son profil:
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (auth.email() = user_email);

-- Policy pour insérer son profil:
CREATE POLICY "users_insert_own" ON users
FOR INSERT WITH CHECK (auth.email() = user_email);

-- Policy pour modifier son profil:
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (auth.email() = user_email);
  `);
}

// Exécution du diagnostic complet
async function runFullDiagnosis() {
  console.log('🏥 DIAGNOSTIC COMPLET SUPABASE\n');
  console.log('⏰ Date:', new Date().toLocaleString('fr-FR'));
  console.log('🌐 URL:', supabaseUrl);
  console.log('🔑 Clé:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Non définie');
  console.log('\n' + '='.repeat(60) + '\n');

  await diagnoseDatabaseStructure();
  await testAuthSettings();
  await checkApplicationConfiguration();
  await provideSolutions();

  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSTIC TERMINÉ');
  console.log('📄 Consultez également: SUPABASE_AUTH_VERIFICATION.md');
  console.log('🚀 Prochaine étape: Appliquer les solutions recommandées');
}

runFullDiagnosis().catch(console.error);
