import React from 'react';
import { Route } from 'react-router-dom';
import { isTokenValid, logout } from '../layouts/Utils/TokenExpire';
import store from 'store';

export const PrivateRoute = ({ component: Component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={(props) => {
				if (!isTokenValid || !store.get('digi_token')) {
					logout();
				} else {
					return <Component {...props} />;
				}
			}}
		/>
	);
};
