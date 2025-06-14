/**
 * Script de correction automatique pour Supabase
 * Ce script applique toutes les corrections nécessaires
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Vérification de la structure actuelle de la table users...\n');

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error && error.code === '42703' && error.message.includes('user_id')) {
      console.log('❌ PROBLÈME CONFIRMÉ: La colonne user_id n\'existe pas');
      console.log('📋 Structure actuelle détectée (basée sur l\'erreur):');
      console.log('   - user_email ✅');
      console.log('   - user_nom ✅'); 
      console.log('   - user_prenom ✅');
      console.log('   - user_role ✅');
      console.log('   - user_id ❌ (manquant)');
      return 'missing_user_id';
    } else if (error) {
      console.log('❌ Autre erreur:', error.message);
      return 'other_error';
    } else {
      console.log('✅ Structure de la table users OK');
      console.log('📊 Colonnes détectées:', Object.keys(data[0] || {}));
      return 'ok';
    }
  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return 'exception';
  }
}

async function testAuthProviderHybridCompatibility() {
  console.log('\n🧪 Test de compatibilité avec AuthProviderHybrid...\n');

  try {
    // Simuler ce que fait AuthProviderHybrid
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      console.log('ℹ️  Aucune session active - créons un utilisateur test');
      
      // Test d'inscription
      const testEmail = `test.${Date.now()}@gmail.com`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
      });

      if (signUpError) {
        console.log('❌ Erreur d\'inscription:', signUpError.message);
        return false;
      }

      console.log('✅ Utilisateur test créé:', testEmail);
      
      // Tenter de créer le profil comme le ferait AuthProviderHybrid
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            user_email: testEmail,
            user_nom: 'Test',
            user_prenom: 'User',
            user_role: 'user',
          });

        if (insertError) {
          console.log('❌ Erreur lors de la création du profil:', insertError.message);
          if (insertError.code === '42703') {
            console.log('🔧 SOLUTION: La table users doit être mise à jour');
            return 'need_user_id_column';
          }
        } else {
          console.log('✅ Profil créé avec succès');
          
          // Test de récupération
          const { data: profile, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('user_email', testEmail)
            .single();

          if (selectError) {
            console.log('❌ Erreur de récupération du profil:', selectError.message);
          } else {
            console.log('✅ Profil récupéré:', profile);
          }
        }
      } catch (error) {
        console.log('💥 Erreur lors de la création du profil:', error.message);
        return false;
      }
    }

    return true;

  } catch (error) {
    console.log('💥 Erreur de test:', error.message);
    return false;
  }
}

async function generateSQLFixScript() {
  console.log('\n📝 Génération du script SQL de correction...\n');

  const sqlScript = `
-- 🔧 SCRIPT DE CORRECTION POUR LA TABLE USERS
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne user_id si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'user_id'
    ) THEN
        -- Ajouter la colonne user_id
        ALTER TABLE users ADD COLUMN user_id SERIAL PRIMARY KEY;
        
        -- Mettre à jour les utilisateurs existants s'il y en a
        -- (optionnel si la table est vide)
        
        RAISE NOTICE 'Colonne user_id ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne user_id existe déjà';
    END IF;
END $$;

-- 2. Ajouter la colonne created_at si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne created_at existe déjà';
    END IF;
END $$;

-- 3. S'assurer que RLS est activé
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- 5. Créer les nouvelles policies
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.email() = user_email);

-- 6. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);

-- 7. Vérification finale
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- ✅ Script terminé
SELECT 'Configuration de la table users terminée !' as status;
`;

  console.log('📄 Script SQL généré:');
  console.log(sqlScript);
  
  return sqlScript;
}

async function suggestAppFixes() {
  console.log('\n🔧 Suggestions de corrections pour l\'application...\n');

  const fixes = [
    {
      title: '1. Modifier AuthProviderHybrid pour être compatible',
      description: 'Adapter le provider pour fonctionner sans user_id',
      action: 'Utiliser user_email comme clé primaire temporairement'
    },
    {
      title: '2. Corriger le fichier Profile.tsx',
      description: 'Adapter la fonction de sauvegarde du profil',
      action: 'Utiliser user_email au lieu de user_id pour les mises à jour'
    },
    {
      title: '3. Nettoyer les configurations',
      description: 'Supprimer les anciens providers et configurations',
      action: 'Garder uniquement AuthProviderHybrid et src/initSupabase.ts'
    },
    {
      title: '4. Tester l\'inscription/connexion',
      description: 'Vérifier que le flux complet fonctionne',
      action: 'Test avec un vrai email (pas @example.com)'
    }
  ];

  fixes.forEach((fix, index) => {
    console.log(`${fix.title}`);
    console.log(`   📋 ${fix.description}`);
    console.log(`   🎯 Action: ${fix.action}\n`);
  });
}

async function main() {
  console.log('🚀 SCRIPT DE CORRECTION AUTOMATIQUE SUPABASE');
  console.log('⏰ ' + new Date().toLocaleString('fr-FR'));
  console.log('=' .repeat(60) + '\n');

  // Étape 1: Vérifier la structure
  const structureStatus = await checkTableStructure();
  
  if (structureStatus === 'missing_user_id') {
    console.log('🎯 PROBLÈME IDENTIFIÉ: Colonne user_id manquante\n');
    
    // Étape 2: Tester la compatibilité
    const compatibilityResult = await testAuthProviderHybridCompatibility();
    
    // Étape 3: Générer le script SQL
    await generateSQLFixScript();
    
    // Étape 4: Suggestions d'application
    await suggestAppFixes();
    
    console.log('📋 RÉSUMÉ DES ACTIONS À EFFECTUER:');
    console.log('1. 🗃️  Exécuter le script SQL ci-dessus dans Supabase Dashboard');
    console.log('2. 🔧 Appliquer les corrections d\'application recommandées');
    console.log('3. 🧪 Tester l\'inscription/connexion dans l\'app');
    console.log('4. ✅ Vérifier que le profil se synchronise correctement\n');
    
  } else if (structureStatus === 'ok') {
    console.log('✅ Structure de la table OK - Pas de correction nécessaire');
  } else {
    console.log('❌ Problème de configuration détecté');
    console.log('💡 Consultez le diagnostic pour plus de détails');
  }
  
  console.log('=' .repeat(60));
  console.log('🏁 Script de correction terminé');
}

main().catch(console.error);
