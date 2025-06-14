const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://kruwzzjwcuprnuqsygrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('🔍 Test des tables...');
  
  const tables = ['users', 'terrain', 'equipement', 'cours'];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Test de la table: ${table}`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`❌ Erreur pour ${table}:`, error.message);
      } else {
        console.log(`✅ ${table}: ${count || 0} enregistrements total`);
        if (data && data.length > 0) {
          console.log(`   Colonnes:`, Object.keys(data[0]).join(', '));
        }
      }
      
    } catch (error) {
      console.error(`❌ Exception pour ${table}:`, error.message);
    }
  }
}

testTables().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur générale:', error);
  process.exit(1);
});
