/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useHistory } from 'react-router-dom';

function FbLogin() {
	const history = useHistory();
	const responseFacebook = (response) => {
		history.push('/a', {
			provider: 'facebook',
			res: response,
		});
	};
	const onFailure = (res) => {
		console.log(res);
	};

	return (
		<>
			<FacebookLogin
				appId='448337909627987'
				textButton=''
				callback={responseFacebook}
				onFailure={onFailure}
				fields='name,email,picture'
				scope='public_profile'
				render={(renderProps) => (
					<img
						onClick={renderProps.onClick}
						src={process.env.PUBLIC_URL + '/img/fb.png'}
						alt='facebook'
						style={{ cursor: 'pointer' }}
					/>
				)}
				disableMobileRedirect={true}
				isMobile={true}
				cookie={false}
			/>
		</>
	);
}

export default FbLogin;
