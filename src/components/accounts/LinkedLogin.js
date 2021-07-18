/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { LinkedIn } from 'react-linkedin-login-oauth2';
import axios from 'axios';

const LinkedLogin = () => {
	const handleSuccess = (code) => {
		var bodyFormData = new URLSearchParams();
		bodyFormData.append('grant_type', 'authorization_code');
		bodyFormData.append('code', code.code);
		bodyFormData.append('redirect_uri', 'http://localhost:3000/linkedin');
		bodyFormData.append('client_id', '7890j08289twtw');
		bodyFormData.append('client_secret', 'Yb3yq6husajy6cQ6');
		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		};
		axios
			.post(
				`http://www.linkedin.com/oauth/v2/accessToken`,
				bodyFormData,
				config,
			)
			.then((res) => {
				console.log(res);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleFailure = (error) => {
		console.log(error);
	};

	return (
		<>
			<LinkedIn
				clientId='7890j08289twtw'
				onFailure={handleFailure}
				onSuccess={handleSuccess}
				redirectUri='http://localhost:3000/linkedin'
				scope='r_liteprofile'
				renderElement={(renderProps) => (
					<img
						onClick={renderProps.onClick}
						src={process.env.PUBLIC_URL + '/img/linked.png'}
						alt='facebook'
						style={{ cursor: 'pointer' }}
					/>
				)}
			/>
		</>
	);
};

export default LinkedLogin;
