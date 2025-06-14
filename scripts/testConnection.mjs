import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://kruwzzjwcuprnuqsygrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  
  try {
    // Test simple avec la table users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.error('Code:', error.code);
      console.error('Détails:', error.details);
    } else {
      console.log('✅ Connexion réussie !');
      console.log('Données trouvées:', data?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testConnection();
