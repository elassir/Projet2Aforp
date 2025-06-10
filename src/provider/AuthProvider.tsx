import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../initSupabase';

type ContextProps = {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
	children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState<boolean>(true);	useEffect(() => {
		const getSession = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		};

		getSession();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log(`Supabase auth event: ${event}`);
				setSession(session);
				setUser(session?.user ?? null);
				setLoading(false);
			}
		);

		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	return (		<AuthContext.Provider
			value={{
				user,
				session,
				loading,
				signOut,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };

// Hook pour utiliser le contexte d'authentification
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
