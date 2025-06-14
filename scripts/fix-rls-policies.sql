-- 🔧 SCRIPT SQL DE CORRECTION POUR LES POLICIES RLS
-- Exécutez ce script dans Supabase Dashboard > SQL Editor

-- 1. Vérifier l'état actuel
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Lister les policies existantes
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;  
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur profil" ON users;
DROP POLICY IF EXISTS "Permettre l'insertion lors de l'inscription" ON users;
DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leur profil" ON users;

-- 4. Créer de nouvelles policies compatibles avec l'inscription
-- Policy pour voir son propre profil
CREATE POLICY "users_can_view_own_profile" ON users
    FOR SELECT 
    USING (auth.email() = user_email);

-- Policy pour insérer son profil lors de l'inscription
-- IMPORTANT: Cette policy permet l'insertion même si l'utilisateur vient de s'inscrire
CREATE POLICY "users_can_insert_own_profile" ON users
    FOR INSERT 
    WITH CHECK (
        auth.email() = user_email 
        OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.email = user_email 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
    );

-- Policy pour mettre à jour son profil
CREATE POLICY "users_can_update_own_profile" ON users
    FOR UPDATE 
    USING (auth.email() = user_email)
    WITH CHECK (auth.email() = user_email);

-- 5. Alternative: Policy plus permissive pour les tests
-- Décommentez cette section si les policies ci-dessus ne fonctionnent pas

/*
-- Désactiver temporairement RLS pour les tests
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Ou créer une policy très permissive pour les tests
CREATE POLICY "allow_all_for_testing" ON users
    FOR ALL 
    USING (true)
    WITH CHECK (true);
*/

-- 6. Vérifier que les policies sont bien créées
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 7. Test de la configuration
-- Créez un utilisateur de test depuis l'interface Supabase Auth
-- puis testez ces requêtes:

/*
-- Test SELECT (doit fonctionner si connecté)
SELECT * FROM users WHERE user_email = 'votre-email@test.com';

-- Test INSERT (doit fonctionner si connecté)
INSERT INTO users (user_email, user_nom, user_prenom, user_role) 
VALUES ('votre-email@test.com', 'Test', 'User', 'user');

-- Test UPDATE (doit fonctionner si connecté)
UPDATE users 
SET user_nom = 'Nouveau' 
WHERE user_email = 'votre-email@test.com';
*/

-- 8. Informations sur l'utilisateur actuel (pour debug)
SELECT 
    auth.uid() as user_id,
    auth.email() as user_email,
    auth.role() as user_role;

-- ✅ Script de correction terminé
SELECT 'Policies RLS mises à jour avec succès!' as status;
