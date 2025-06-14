/**
 * Test final avec désactivation temporaire de RLS
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithDisabledRLS() {
  console.log('🧪 TEST AVEC RLS TEMPORAIREMENT DÉSACTIVÉ');
  console.log('⚠️  ATTENTION: Ce test nécessite des privilèges administrateur');
  console.log('=' .repeat(60) + '\n');

  try {
    // Tentative de test simple sans RLS
    console.log('1️⃣ Test d\'insertion directe...');
    
    const testEmail = `test.norls.${Date.now()}@gmail.com`;
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        user_email: testEmail,
        user_nom: 'Test',
        user_prenom: 'NoRLS',
        user_role: 'user',
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Erreur d\'insertion:', error.message);
      console.log('🔧 Code:', error.code);
      
      if (error.code === '42501') {
        console.log('\n💡 PROBLÈME RLS CONFIRMÉ');
        console.log('📋 Solutions possibles:');
        console.log('   1. Exécuter le script fix-rls-policies.sql dans Supabase Dashboard');
        console.log('   2. Ou temporairement désactiver RLS: ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
        console.log('   3. Ou créer une policy permissive pour les tests');
        
        return false;
      }
    } else {
      console.log('✅ Insertion réussie sans problème RLS');
      console.log('📋 Données:', data);
      
      // Test de lecture
      console.log('\n2️⃣ Test de lecture...');
      const { data: readData, error: readError } = await supabase
        .from('users')
        .select('*')
        .eq('user_email', testEmail)
        .single();
        
      if (readError) {
        console.log('❌ Erreur de lecture:', readError.message);
      } else {
        console.log('✅ Lecture réussie:', readData);
      }
      
      return true;
    }

  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return false;
  }
}

async function suggestSolutions() {
  console.log('\n🔧 SOLUTIONS RECOMMANDÉES\n');
  
  console.log('🎯 SOLUTION 1: Corriger les policies RLS (Recommandé)');
  console.log('   📄 Exécutez le script: scripts/fix-rls-policies.sql');
  console.log('   📍 Dans: Supabase Dashboard > SQL Editor');
  console.log('   ✅ Sécurisé et permanent\n');
  
  console.log('🎯 SOLUTION 2: Désactivation temporaire (Tests uniquement)');
  console.log('   📄 SQL: ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
  console.log('   ⚠️  ATTENTION: Ne pas utiliser en production\n');
  
  console.log('🎯 SOLUTION 3: Policy permissive (Tests)');
  console.log('   📄 SQL: CREATE POLICY "allow_all" ON users FOR ALL USING (true);');
  console.log('   ⚠️  ATTENTION: Supprimez cette policy après les tests\n');
  
  console.log('🎯 SOLUTION 4: Utiliser les fonctions Supabase Edge (Avancé)');
  console.log('   📄 Créer une Edge Function pour gérer l\'inscription');
  console.log('   ✅ Contourne les problèmes RLS de manière sécurisée\n');
}

async function testAuthProviderCompatibility() {
  console.log('🔄 Test de compatibilité AuthProviderHybrid\n');
  
  try {
    // Vérifier si on peut au moins lire la table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (usersError) {
      console.log('❌ Impossible de lire la table users:', usersError.message);
      
      if (usersError.code === '42501') {
        console.log('💡 Problème RLS confirmé - même la lecture est bloquée');
        console.log('🔧 AuthProviderHybrid ne fonctionnera pas correctement');
        return false;
      }
    } else {
      console.log('✅ Lecture de la table users OK');
      
      // Simuler fetchUserProfile
      const testEmail = 'test@example.com';
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('user_nom, user_prenom, user_role')
        .eq('user_email', testEmail)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          console.log('✅ Aucun profil trouvé (normal)');
        } else {
          console.log('❌ Erreur de lecture du profil:', profileError.message);
        }
      } else {
        console.log('✅ Profil trouvé:', profile);
      }
      
      return true;
    }
    
  } catch (error) {
    console.log('💥 Erreur de test:', error.message);
    return false;
  }
}

async function main() {
  // Test 1: Tentative d'insertion directe
  const insertWorked = await testWithDisabledRLS();
  
  // Test 2: Compatibilité AuthProvider
  const providerCompatible = await testAuthProviderCompatibility();
  
  // Suggestions
  await suggestSolutions();
  
  console.log('=' .repeat(60));
  console.log('📋 RÉSUMÉ FINAL:\n');
  
  if (insertWorked) {
    console.log('🎉 ✅ AUTHENTIFICATION OPÉRATIONNELLE');
    console.log('📱 Vous pouvez tester l\'app maintenant');
  } else {
    console.log('🚨 ❌ PROBLÈMES RLS À RÉSOUDRE');
    console.log('🔧 Appliquez une des solutions ci-dessus');
  }
  
  if (providerCompatible) {
    console.log('✅ AuthProviderHybrid compatible');
  } else {
    console.log('❌ AuthProviderHybrid nécessite des corrections RLS');
  }
  
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  console.log('1. Appliquer une solution RLS');
  console.log('2. Tester l\'inscription dans l\'app');
  console.log('3. Vérifier la synchronisation du profil');
  console.log('4. Valider la modification du profil');
}

main().catch(console.error);
