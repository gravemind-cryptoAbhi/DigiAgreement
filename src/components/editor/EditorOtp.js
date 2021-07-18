import React, { useEffect, useState } from 'react';
import ResendOTP from './ResendOTP';
import disableBrowserBackButton from 'disable-browser-back-navigation';
import store from 'store';
import { url } from '../url/Url';
import axios from 'axios';
import { Button, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 99999,
		color: '#fff',
	},
}));
const EditorOtp = () => {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	useEffect(() => {
		disableBrowserBackButton();
	}, []);

	const [loading, setLoading] = useState(false);
	const history = useHistory();
	const [otp, setOtp] = useState('');
	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		let otp_url = ``;
		let token_url;
		if (store.get('email')) {
			otp_url = `${url}/admin_git/digitalsignature/public/api/templateotpverifcation?email=${store.get(
				'email',
			)}&otp=${otp}&template=${store.get('template')}`;

			token_url = `${url}/admin_git/digitalsignature/public/api/registerguest?email=${store.get(
				'email',
			)}`;
		} else {
			otp_url = `${url}/admin_git/digitalsignature/public/api/templateotpverifcation?mobile=${store.get(
				'mobiles',
			)}&otp=${otp}&template=${store.get('template')}`;

			token_url = `${url}/admin_git/digitalsignature/public/api/registerguest?mobile=${store.get(
				'mobiles',
			)}`;
		}
		axios
			.get(otp_url)
			.then((res) => {
				if (res.data.data) {
					store.set('template_data', res.data.data);
					store.remove('template');
					store.remove('email');
					store.remove('mobiles');
					message.success(res.data.message);
					axios
						.post(token_url)
						.then((res) => store.set('digi_guest_token', res.data.data.token))
						.catch((error) => console.log(error));
					axios
						.get(
							`${url}/admin_git/digitalsignature/public/api/templates/${
								store.get('template_data')['template_id']
							}`,
						)
						.then((res1) => {
							store.set('file_data', res1.data.data[0]);
							history.push('/editor2');
							setLoading(false);
						})
						.catch((error) => {
							console.log(error);
						});
				} else {
					message.error(res.data.message);
					setLoading(false);
				}
			})
			.catch((error) => console.log(error));
	};

	useEffect(() => {
		document.getElementById('myBtn').addEventListener('click', function () {
			setBdOpen(true);
			let bodyFormData = new FormData();
			if (store.get('email')) {
				bodyFormData.append('template', store.get('template'));
				bodyFormData.append('email', store.get('email'));
			} else {
				bodyFormData.append('template', store.get('template'));
				bodyFormData.append('mobile', store.get('mobiles'));
			}
			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/resendtemplateotp`,
					bodyFormData,
				)
				.then((res) => {
					if (res.data.success) {
						setBdOpen(false);
						message.success(res.data.message);
					} else {
						setBdOpen(false);
						message.error('Something Went Wrong!!');
					}
				})
				.catch(() => {
					setBdOpen(false);
					message.error('Something Went Wrong!!');
				});
		});
	}, []);
	return (
		<>
			{/* Modal */}
			<div className='modal-dialog modal-sm' style={{ marginTop: '10%' }}>
				{/* Modal content*/}
				<div
					className='modal-content'
					style={{
						borderRadius: '10px',
					}}
				>
					<div
						className='modal-header'
						style={{
							borderRadius: '10px',
							borderBottomLeftRadius: '0px',
							borderBottomRightRadius: '0px',
						}}
					>
						<h4
							className='modal-title'
							style={{
								textAlign: 'center',
								color: 'white',
								marginRight: 'auto',
								marginLeft: 'auto',
							}}
						>
							OTP Verification
						</h4>
					</div>

					<div className='modal-title'>
						<form onSubmit={handleSubmit}>
							<div className='form-group'>
								<label htmlFor='usr' />
								<h6 style={{ textAlign: 'center' }}>
									Enter the OTP sent on your{' '}
									{store.get('email') ? <>email</> : <>mobile number</>}{' '}
								</h6>
								<input
									type='text'
									className='form-control'
									id='usr'
									placeholder='OTP'
									style={{
										textAlign: 'center',
										margin: 'auto',
										width: '150px',
									}}
									maxLength='6'
									onChange={(e) => setOtp(e.target.value)}
									value={otp}
									required
								/>
							</div>
						</form>
					</div>
					<Button
						type='primary'
						style={{
							backgroundColor: '#05C6FF',
							marginLeft: '50px',
							marginBottom: '10px',
							margin: 'auto',
							width: '150px',
							color: 'white',
						}}
						loading={loading}
						disabled={!otp}
						onClick={handleSubmit}
					>
						Submit
					</Button>
					<h6
						style={{
							fontSize: '10px',
							margin: 'auto',
							paddingTop: '5px',
							paddingBottom: '20px',
						}}
					>
						Didn't receive?
						<ResendOTP
							renderTime={() => React.Fragment}
							renderButton={(buttonProps) => {
								return (
									<button
										{...buttonProps}
										style={{
											background: 'none',
											border: 'none',
											color: '#11CDE0',
										}}
										id='myBtn'
										//onClick={handleResend}
									>
										{buttonProps.remainingTime !== 0
											? `${buttonProps.remainingTime} sec`
											: 'Resend'}
									</button>
								);
							}}
						/>
					</h6>
				</div>
			</div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
			{/* </div> */}
		</>
	);
};

export default EditorOtp;
