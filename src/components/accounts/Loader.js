import axios from 'axios';
import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { url } from '../url/Url';
import store from 'store';
import './spin.css';
import { message } from 'antd';

const Loader = () => {
	const history = useHistory();
	const location = useLocation();
	useEffect(() => {
		if (store.get('digi_token')) {
			history.push('/dashboard');
		}
	});
	let bodyFormData;
	if (location.state.provider === 'google') {
		bodyFormData = new FormData();
		bodyFormData.append('email', location.state.res.profileObj.email);
		bodyFormData.append('first_name', location.state.res.profileObj.givenName);
		bodyFormData.append('last_name', location.state.res.profileObj.familyName);
		bodyFormData.append('provider', 'google');
		bodyFormData.append('provider_id', location.state.res.profileObj.googleId);
		bodyFormData.append('profile_pic', location.state.res.profileObj.imageUrl);
		axios
			.post(
				`${url}/admin_git/digitalsignature/public/api/socialLogin`,
				bodyFormData,
			)
			.then((res1) => {
				if (!res1.data.success) {
					message.error(res1.data.message);
				} else {
					store.set('digi_token', res1.data.data.token);
					store.set('digi_user', res1.data.data);
					history.push('/dashboard');
					message.success(res1.data.message);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}
	if (location.state.provider === 'facebook') {
		bodyFormData = new FormData();
		bodyFormData.append('email', ' ');
		bodyFormData.append('first_name', location.state.res.name?.split(' ')[0]);
		bodyFormData.append('last_name', location.state.res.name?.split(' ')[1]);
		bodyFormData.append('provider', 'facebook');
		bodyFormData.append('provider_id', location.state.res.id);
		axios
			.post(
				`${url}/admin_git/digitalsignature/public/api/socialLogin`,
				bodyFormData,
			)
			.then((res1) => {
				if (!res1.data.success) {
					message.error(res1.data.message);
				} else {
					store.set('digi_token', res1.data.data.token);
					store.set('digi_user', res1.data.data);
					history.push('/dashboard');
					message.success(res1.data.message);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<>
			{location.state.provider === 'google' ? (
				<div id='loader'></div>
			) : location.state.provider === 'facebook' ? (
				<div id='loader1'></div>
			) : (
				<div id='loader2'></div>
			)}
		</>
	);
};

export default Loader;
