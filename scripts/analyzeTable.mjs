/**
 * Script pour analyser la structure réelle de la table users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kruwzzjwcuprnuqsygrt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms";

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTableStructure() {
  console.log('🔍 ANALYSE DE LA STRUCTURE RÉELLE DE LA TABLE USERS\n');

  try {
    // Méthode 1: Essayer de récupérer une ligne sans spécifier les colonnes
    console.log('1️⃣ Test d\'accès général à la table users...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erreur:', error.message);
      console.log('💡 Code:', error.code);
      
      if (error.code === 'PGRST116') {
        console.log('🔧 La table "users" n\'existe pas du tout');
        return false;
      }
    } else {
      console.log('✅ Table users accessible');
      
      if (data && data.length > 0) {
        console.log('📊 Structure détectée:');
        const columns = Object.keys(data[0]);
        columns.forEach(col => console.log(`   - ${col}`));
        
        console.log('\n📝 Exemple de données:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('📝 Table vide, tentative d\'analyse des colonnes...');
        
        // Essayer différentes colonnes possibles
        const possibleColumns = [
          'id', 'user_id', 'email', 'user_email', 
          'nom', 'user_nom', 'prenom', 'user_prenom',
          'role', 'user_role', 'created_at', 'updated_at'
        ];
        
        console.log('\n2️⃣ Test des colonnes possibles...');
        for (const col of possibleColumns) {
          try {
            const { error: colError } = await supabase
              .from('users')
              .select(col)
              .limit(1);
            
            if (!colError) {
              console.log(`   ✅ ${col}`);
            }
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      }
    }

    return true;

  } catch (error) {
    console.log('❌ Erreur lors de l\'analyse:', error.message);
    return false;
  }
}

async function suggestTableCorrection() {
  console.log('\n🔧 SUGGESTIONS DE CORRECTION\n');

  console.log('Basé sur l\'analyse, voici les scripts SQL à exécuter dans Supabase:');
  
  console.log('\n📋 OPTION 1: Créer une nouvelle table users (recommandé)');
  console.log(`
-- Supprimer l'ancienne table si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- Créer la nouvelle table avec la bonne structure
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  user_nom TEXT,
  user_prenom TEXT,
  user_role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_users_email ON users(user_email);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "users_select_own" ON users
FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "users_insert_own" ON users
FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (auth.email() = user_email);
  `);

  console.log('\n📋 OPTION 2: Modifier la table existante (si elle contient des données importantes)');
  console.log(`
-- Ajouter les colonnes manquantes
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id SERIAL PRIMARY KEY;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_nom TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_prenom TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Mettre à jour les contraintes
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (user_email);
  `);
}

async function runAnalysis() {
  console.log('🏥 ANALYSE STRUCTURE TABLE USERS\n');
  console.log('⏰ Date:', new Date().toLocaleString('fr-FR'));
  console.log('\n' + '='.repeat(50) + '\n');

  const success = await analyzeTableStructure();
  
  if (success) {
    await suggestTableCorrection();
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 ANALYSE TERMINÉE');
  console.log('🚀 Exécutez les scripts SQL recommandés dans Supabase Dashboard');
  console.log('📄 Puis relancez le test avec: node scripts/testSupabaseAuth.mjs');
}

runAnalysis().catch(console.error);
