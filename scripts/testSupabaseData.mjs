import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://kruwzzjwcuprnuqsygrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydXd6emp3Y3Vwcm51cXN5Z3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODQ5MzQsImV4cCI6MjA1Nzg2MDkzNH0.TIWxiAHVwZcqfWihN8PBEwxLqH3PoyjFuKKRfSwV7Ms';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllTables() {
  console.log('🔄 Test de toutes les tables avec données réelles...\n');
  
  const tables = [
    { name: 'users', description: 'Utilisateurs du système' },
    { name: 'terrain', description: 'Terrains de sport' },
    { name: 'equipement', description: 'Équipements sportifs' },
    { name: 'cours', description: 'Cours de sport' },
    { name: 'reservation_terrain', description: 'Réservations de terrains' },
    { name: 'reservation_equipement', description: 'Réservations d\'équipements' },
    { name: 'reservation_cours', description: 'Inscriptions aux cours' }
  ];
  
  let allSuccess = true;
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      console.log(`📋 Test de la table: ${table.name}`);
      console.log(`   Description: ${table.description}`);
      
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact' })
        .limit(3);
      
      if (error) {
        console.error(`❌ ERREUR pour ${table.name}:`, error.message);
        console.error(`   Code d'erreur:`, error.code);
        allSuccess = false;
      } else {
        const recordCount = count || data?.length || 0;
        totalRecords += recordCount;
        console.log(`✅ ${table.name}: ${recordCount} enregistrements trouvés`);
        
        if (data && data.length > 0) {
          console.log(`   Colonnes disponibles:`, Object.keys(data[0]).join(', '));
          console.log(`   Premier enregistrement:`, JSON.stringify(data[0], null, 2));
        }
      }
      
      console.log(''); // Ligne vide pour la lisibilité
      
    } catch (error) {
      console.error(`💥 EXCEPTION pour ${table.name}:`, error.message);
      allSuccess = false;
    }
  }
  
  console.log('📊 RÉSUMÉ:');
  console.log(`   Total des enregistrements: ${totalRecords}`);
  console.log(`   Statut global: ${allSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
  
  return allSuccess;
}

async function testSpecificQueries() {
  console.log('\n🔍 Test de requêtes spécifiques...\n');
  
  try {
    // Test 1: Récupérer tous les utilisateurs clients
    console.log('Test 1: Utilisateurs clients');
    const { data: clients, error: clientsError } = await supabase
      .from('users')
      .select('*')
      .eq('user_role', 'client');
    
    if (clientsError) {
      console.error('❌ Erreur clients:', clientsError.message);
    } else {
      console.log(`✅ ${clients?.length || 0} clients trouvés`);
    }
    
    // Test 2: Terrains disponibles
    console.log('\nTest 2: Terrains disponibles');
    const { data: terrainsDispos, error: terrainsError } = await supabase
      .from('terrain')
      .select('*')
      .eq('terrain_statut', 'disponible');
    
    if (terrainsError) {
      console.error('❌ Erreur terrains:', terrainsError.message);
    } else {
      console.log(`✅ ${terrainsDispos?.length || 0} terrains disponibles`);
      if (terrainsDispos && terrainsDispos.length > 0) {
        console.log('   Types de terrains:', [...new Set(terrainsDispos.map(t => t.terrain_type))].join(', '));
      }
    }
    
    // Test 3: Cours avec leurs tarifs
    console.log('\nTest 3: Cours et tarifs');
    const { data: cours, error: coursError } = await supabase
      .from('cours')
      .select('cours_nom, cours_tarif, cours_date')
      .order('cours_tarif');
    
    if (coursError) {
      console.error('❌ Erreur cours:', coursError.message);
    } else {
      console.log(`✅ ${cours?.length || 0} cours trouvés`);
      if (cours && cours.length > 0) {
        const minTarif = Math.min(...cours.map(c => c.cours_tarif));
        const maxTarif = Math.max(...cours.map(c => c.cours_tarif));
        console.log(`   Tarifs: ${minTarif}€ - ${maxTarif}€`);
      }
    }
    
    // Test 4: Réservations avec jointures
    console.log('\nTest 4: Réservations avec détails');
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservation_terrain')
      .select(`
        *,
        terrain:terrain_id(terrain_type, terrain_localisation),
        user:user_email(user_nom, user_prenom)
      `)
      .limit(3);
    
    if (reservationsError) {
      console.error('❌ Erreur réservations:', reservationsError.message);
    } else {
      console.log(`✅ ${reservations?.length || 0} réservations avec détails`);
      if (reservations && reservations.length > 0) {
        console.log('   Exemple de réservation:', JSON.stringify(reservations[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur dans les tests spécifiques:', error.message);
  }
}

async function main() {
  console.log('🚀 DÉMARRAGE DES TESTS SUPABASE\n');
  console.log('='.repeat(50));
  
  try {
    const tablesSuccess = await testAllTables();
    await testSpecificQueries();
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 TESTS TERMINÉS');
    
    if (tablesSuccess) {
      console.log('🎉 Toutes les tables sont accessibles et contiennent des données !');
      console.log('🔗 L\'application peut maintenant utiliser les services SQL.');
    } else {
      console.log('⚠️  Certaines tables ont des problèmes.');
      console.log('🔧 Vérifiez la configuration de votre base de données.');
    }
    
  } catch (error) {
    console.error('💥 ERREUR GÉNÉRALE:', error);
  }
}

main();
