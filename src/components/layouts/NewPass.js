import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { url } from '../url/Url';
import store from 'store';
import { message } from 'antd';
import { isTokenValid, logout } from './Utils/TokenExpire';

const NewPass = () => {
	const [passcode, setPasscode] = useState({
		current: '',
		new_passcode: '',
		con_passcode: '',
	});
	const history = useHistory();

	const handleChange = (e) => {
		setPasscode({ ...passcode, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!isTokenValid) {
			logout();
		} else {
			if (passcode.new_passcode === passcode.con_passcode) {
				var bodyFormdata = new FormData();
				bodyFormdata.append('token', store.get('digi_token'));
				bodyFormdata.append('old_pass', passcode.current);
				bodyFormdata.append('new_pass', passcode.new_passcode);
				bodyFormdata.append('confirmed_pass', passcode.con_passcode);
				fetch(`${url}/admin_git/digitalsignature/public/api/password/reset`, {
					method: 'POST',
					body: bodyFormdata,
				})
					.then((res) => res.json())
					.then((res) => {
						message.info(res.message);
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				message.error('New password and Confirm password should be same');
			}
		}
	};

	return (
		<div>
			<div className='change-pass-pro'>
				<form onSubmit={handleSubmit}>
					<h4>Password</h4>
					<p>Set a unique password to protect your personal account.</p>
					<div className='anchovy-form-item'>
						<label htmlFor='ui-test-first-name'>
							<input
								className='input-group'
								maxLength={30}
								name='current'
								data-ui-test='first-name-input'
								type='password'
								placeholder='Enter current password'
								value={passcode.current}
								onChange={handleChange}
								required
							/>
						</label>
					</div>
					<div className='anchovy-form-item'>
						<label htmlFor='ui-test-last-name'>
							<input
								className='input-group'
								maxLength={30}
								name='new_passcode'
								type='password'
								placeholder='Enter new password'
								value={passcode.new_passcode}
								onChange={handleChange}
								required
							/>
						</label>
					</div>
					<div className='anchovy-form-item'>
						<label htmlFor='email-input' className='validated-input'>
							<input
								className='input-group'
								name='con_passcode'
								data-ui-test='email-input'
								type='password'
								placeholder='Re-enter new password'
								value={passcode.con_passcode}
								onChange={handleChange}
								required
							/>
						</label>
					</div>
					<div className='save-setting save-change-ps'>
						<button
							data-kit='button'
							className='button-3muNk button_sizeDefault-1Wzb8 design-primary-VgpnF'
						>
							Save
						</button>{' '}
						<button
							data-kit='button'
							className='cancel-btn-ps button-3muNk button_sizeDefault-1Wzb8 design-primary-VgpnF'
							onClick={() => history.push('/dashboard')}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default NewPass;
