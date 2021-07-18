/* eslint-disable jsx-a11y/anchor-is-valid */
import { notification } from 'antd';
import React from 'react';
import { useGoogleLogin } from 'react-google-login';
import { useHistory } from 'react-router-dom';

const clientId =
	'106267470829-t02dhnpood48sg6220hifnouj87spetm.apps.googleusercontent.com';

function GoogleLogin() {
	const history = useHistory();
	const onSuccess = (res) => {
		history.push('/a', {
			provider: 'google',
			res: res,
		});
	};

	const onFailure = (res) => {
		if (res.error !== 'popup_closed_by_user') {
			notification['error']({
				message: 'Unable to Login',
				description: "Kindly allow all 3rd party cookies in browser's settings",
				duration: 0,
			});
		}
	};

	const { signIn } = useGoogleLogin({
		onSuccess,
		onFailure,
		clientId,
		cookiePolicy: 'single_host_origin',
		uxMode: 'redirect',
	});

	return (
		<>
			<img
				src={process.env.PUBLIC_URL + '/img/g-plus.png'}
				alt='google'
				onClick={() => signIn()}
				style={{ cursor: 'pointer' }}
			/>
		</>
	);
}

export default GoogleLogin;
