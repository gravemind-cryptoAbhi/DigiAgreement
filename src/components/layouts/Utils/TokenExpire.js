import store from 'store';
import { message } from 'antd';
import { url } from '../../url/Url';
import axios from 'axios';

export const token_request = `${url}/admin_git/digitalsignature/public/api/refresh?token=${store.get(
	'digi_token',
)}`;

export const isTokenValid = async () => {
	const response = await axios.post(
		`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${store.get(
			'digi_token',
		)}`,
	);
	if (response.data.error === 'TOKEN_EXPIRED.') {
		return false;
	} else {
		return true;
	}
	// .then((res) => {
	// 	if (res.data.error === 'TOKEN_EXPIRED.') {
	// 		result = res.data.error;
	// 	} else {
	// 		result = '';
	// 	}
	// });
	// if (result === 'TOKEN_EXPIRED.') {
	// 	return false;
	// } else {
	// 	return true;
	// }
};

export const logout = () => {
	store.clearAll();
	window.location.href = '/login';
};
