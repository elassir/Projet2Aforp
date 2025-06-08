import React, { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';

import { NavigationContainer } from '@react-navigation/native';

import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';

export default () => {
	const auth = useContext(AuthContext);
	const { user, loading } = auth;
	return (
		<NavigationContainer>
			{loading && <Loading />}
			{!loading && !user && <Auth />}
			{!loading && user && <Main />}
		</NavigationContainer>
	);
};
