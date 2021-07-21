/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import HeadSide from './Utils/Head_Side';
import store from 'store';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { css } from '@emotion/react';
import axios from 'axios';
import { url } from '../url/Url';
import NewPass from './NewPass';
import { message, Space } from 'antd';
import { Backdrop, CircularProgress, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));
const Profile = () => {
	const history = useHistory();
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	const data = store.get('digi_user');
	const [processing, setProcessing] = useState(false);
	const [disabled, setDisabled] = useState(true);
	const [photo, setPhoto] = useState(null);
	const [values, setValues] = useState({
		first_name: data['first_name'],
		last_name: data['last_name'],
		email: data['email'],
		contact: data['contact_no'] === 'undefined' ? '' : data['contact_no'],
		id: data['id'],
		address: data['address'] || '',
		city: data['city'] || '',
		country: data['country'] || '',
		pincode: data['pincode'] || '',
		state: data['state'] || '',
	});

	const handleChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		setValues({ ...values, [name]: value });
		if (value === values.first_name || value === values.last_name)
			setDisabled(true);
		else setDisabled(!true);
	};

	const onDrop = (e) => {
		setPhoto();
		//console.log(e.target.files[0]);
		if (e.target.files[0]['size'] > 3000000) {
			message.warn('Image cannot be more than 3mb');
		}
		if (
			e.target.files[0]['type'] === 'image/jpeg' ||
			e.target.files[0]['type'] === 'image/jpg' ||
			e.target.files[0]['type'] === 'image/png'
		) {
			setBdOpen(true);
			var bodyFormData = new FormData();
			bodyFormData.append('id', values.id);
			bodyFormData.append('token', store.get('digi_token'));
			bodyFormData.append('first_name', values.first_name);
			bodyFormData.append('last_name', values.last_name);
			bodyFormData.append('email', values.email);
			bodyFormData.append('contact', values.contact);
			bodyFormData.append('address', values.address);
			bodyFormData.append('city', values.city);
			bodyFormData.append('state', values.state);
			bodyFormData.append('pincode', values.pincode);
			bodyFormData.append('country', values.country);
			bodyFormData.append('profile_pic', e.target.files[0]);

			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/profileupdate`,
					bodyFormData,
				)
				.then((res) => {
					if (res) {
						setBdOpen(!true);
						message.success(res.data.message);
						axios
							.post(
								`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${store.get(
									'digi_token',
								)}`,
							)
							.then((res) => {
								//console.log(res.data.data);
								store.set('digi_user', res.data.data[0]);
								window.location.reload();
							})
							.catch((err) => {
								if (err.response.status === 401) {
									setBdOpen(false);
									message.error('Session Timed Out..Kindly Login Again!!');
									store.clearAll();
									history.push('/login');
								} else {
									setBdOpen(false);
									message.error('Something Went Wrong');
									console.log(err);
								}
							});
					}
				})
				.catch((err) => {
					if (err.response.status === 401) {
						setBdOpen(false);
						message.error('Session Timed Out..Kindly Login Again!!');
						store.clearAll();
						history.push('/login');
					} else {
						setBdOpen(false);
						message.error('Something Went Wrong');
						console.log(err);
					}
				});
		} else {
			message.warn('Image Should be .jpg/.jpeg/.png');
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setDisabled(true);
		setProcessing(true);
		var bodyFormData = new FormData();
		bodyFormData.append('id', values.id);
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('first_name', values.first_name);
		bodyFormData.append('last_name', values.last_name);
		bodyFormData.append('email', values.email);
		bodyFormData.append('contact', values.contact);
		bodyFormData.append('address', values.address);
		bodyFormData.append('city', values.city);
		bodyFormData.append('state', values.state);
		bodyFormData.append('pincode', values.pincode);
		bodyFormData.append('country', values.country);
		//bodyFormData.append('Photo', values.photo);
		axios
			.post(
				`${url}/admin_git/digitalsignature/public/api/profileupdate`,
				bodyFormData,
			)
			.then((res) => {
				if (res.data.success) {
					message.success(res.data.message);
					axios
						.post(
							`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${store.get(
								'digi_token',
							)}`,
						)
						.then((res) => {
							//console.log(res.data.data);
							store.set('digi_user', res.data.data[0]);
							//window.location.reload();
						})
						.catch((err) => {
							if (err.response.status === 401) {
								message.error('Session Timed Out..Kindly Login Again!!');
								store.clearAll();
								history.push('/login');
							} else {
								message.error('Something Went Wrong');
								console.log(err);
							}
						});
					setProcessing(false);
					setDisabled(false);
				}
			})
			.catch((err) => {
				if (err.response.status === 401) {
					setProcessing(false);
					setDisabled(false);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setProcessing(false);
					setDisabled(false);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const handleResend = () => {
		setBdOpen(true);
		axios
			.get(
				`${url}/admin_git/digitalsignature/public/api/resendconfrmationmail?email=${
					store.get('digi_user')['email']
				}&token=${store.get('digi_token')}`,
			)
			.then((res) => {
				setBdOpen(!true);
				message.success(res.data.data.message);
			})
			.catch((err) => {
				if (err.response.status === 401) {
					setBdOpen(!true);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setBdOpen(!true);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const override = css`
		display: block;
		margin: 3px auto;
		border-color: red;
		opacity: 0.7;
	`;

	return (
		<>
			{/* Begin page */}
			<div id='layout-wrapper'>
				<HeadSide heading='Profile' />
				<div className='main-content'>
					<div className='page-content'>
						<div className='container'>
							<div className='row'>
								<div className='col-sm-8'>
									<div className='profile-form'>
										<h4>Personal information</h4>
										<form onSubmit={handleSubmit}>
											<Space direction='vertical' size='large' className="ant-spaace">
												{/* <div className="ant-space"> */}
												<Space size='large' className="space-item">
													<InputField
														label='First Name'
														name='first_name'
														onChange={handleChange}
														value={values?.first_name}
													/>
													<InputField
														label='Last Name'
														name='last_name'
														onChange={handleChange}
														value={values?.last_name}
													/>
												</Space>
												<Space size='large' className="space-item">
													<InputField
														label='Email'
														name='email'
														onChange={handleChange}
														value={values?.email}
														disabled
													/>
													<InputField
														id='c'
														label='Contact Number'
														name='contact'
														onChange={handleChange}
														value={values?.contact}
													/>
												</Space>
												<Space size='large' className="space-item">
													<InputField
														label='Address'
														name='address'
														onChange={handleChange}
														value={values?.address}
													/>
													<InputField
														label='Pincode'
														name='pincode'
														onChange={handleChange}
														value={values?.pincode}
													/>
												</Space>
												<Space size='large' className="space-item">
													<InputField
														label='City'
														name='city'
														onChange={handleChange}
														value={values?.city}
													/>
													<InputField
														label='State'
														name='state'
														onChange={handleChange}
														value={values?.state}
													/>
												</Space>
												<InputField
													label='Country'
													name='country'
													onChange={handleChange}
													value={values?.country}
												/>
												{/* </div> */}
											</Space>

											<div
												className='reset-btn-email'
												style={{ marginTop: '2rem' }}
											>
												{!store.get('digi_user')['email_verified'] && (
													<Link onClick={handleResend}>
														Resend verification email
													</Link>
												)}
											</div>
											<div className='save-setting'>
												<button
													data-kit='button'
													className='button-3muNk button_sizeDefault-1Wzb8 design-primary-VgpnF'
													disabled={processing || disabled}
												>
													{processing ? (
														<ScaleLoader
															color='#ffffff'
															loading={processing}
															css={override}
															size={150}
															height={25}
														/>
													) : (
														'Save'
													)}
												</button>
											</div>
										</form>
										{data['provider'] === '' && (
											<>
												<hr />
												<NewPass />
											</>
										)}
										<hr />
										<div className='upld-sign'>
											<h4>Signature</h4>
											<div className='signature-placeholder signature-placeholder--block'>
												No signature
											</div>
											<div className='reset-btn-email'>
												<a href='#'>Setup Signature</a>
											</div>
										</div>
									</div>
								</div>
								<div className='col-sm-4 pull-right'>
									<div className='profile-image-pro'>
										<img src={data['profile_pic']} alt='profile image' />
										<br />
										<div className='reset-btn-email upload-img-pro'>
											{/* <Upload>
												<Button>
													<UploadOutlined /> Click to Upload
												</Button>
											</Upload> */}
											<input
												//className={classes.input}
												id='contained-button-image'
												onChange={onDrop}
												accept='image/*'
												type='file'
												style={{ display: 'none' }}
											/>
											<label htmlFor='contained-button-image'>
												<a>
													<i class='fa fa-plus'></i> Upload Photo
												</a>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>{' '}
						{/* container-fluid */}
					</div>
					{/* End Page-content */}
				</div>
				{/* end main content*/}
			</div>
			<div className='rightbar-overlay' />
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</>
	);
};

export default Profile;

const InputField = styled(TextField)`
	width: 22rem;
	margin-right: 0;
`;
