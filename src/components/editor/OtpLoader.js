import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { url } from '../url/Url';
import store from 'store';
import '../accounts/spin.css';
import { message } from 'antd';
import queryString from 'query-string';
import '../accounts/spin.css';

const OtpLoader = () => {
	const location = useLocation();
	const history = useHistory();
	const value = queryString.parse(location.search);
	const email = value.email;
	const template = value.template;
	const mobiles = value.mobile;

	useEffect(() => {
		const bodyFormdata = new FormData();
		if (mobiles === undefined) {
			bodyFormdata.append('email', email);
			bodyFormdata.append('template', template);
			fetch(`${url}/admin_git/digitalsignature/public/api/sendtemplateotp`, {
				method: 'POST',
				body: bodyFormdata,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						store.set('template', template);
						store.set('email', email);
						history.push('/editorotp');
						message.success(res.message);
					}
				})
				.catch((error) => console.log(error));
		} else {
			bodyFormdata.append('mobile', mobiles);
			bodyFormdata.append('template', template);
			fetch(`${url}/admin_git/digitalsignature/public/api/sendtemplateotp`, {
				method: 'POST',
				body: bodyFormdata,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						store.set('template', template);
						store.set('mobiles', mobiles);
						history.push('/editorotp');
						message.success(res.message);
					}
				})
				.catch((error) => console.log(error));
		}
	});

	return (
		<>
			<div id='loader'></div>
		</>
	);
};

export default OtpLoader;
