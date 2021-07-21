/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import GoogleLogin from '../accounts/GoogleLogin';
import FbLogin from '../accounts/FbLogin';
import { url } from '../url/Url';
import store from 'store';
import LinkedLogin from './LinkedLogin';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { css } from '@emotion/react';
import { message, Space } from 'antd';
import './login.css'

const Login = () => {
	useEffect(() => {
		if (store.get('digi_token')) {
			history.push('/dashboard');
		}
	});
	const history = useHistory();
	const [person, setPerson] = useState({
		email: '',
		password: '',
	});
	const [processing, setProcessing] = useState(false);
	const [disabled, setDisabled] = useState(!true);

	const handleChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		setPerson({ ...person, [name]: value });
		if (person.email !== '' && person.password !== '') {
			setDisabled(false);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!person.email) {
			message.error('Email is Required');
		} else if (!person.password) {
			message.error('Password is Required');
		} else {
			setProcessing(true);
			var bodyFormData = new FormData();
			bodyFormData.append('email', person.email);
			bodyFormData.append('password', person.password);

			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/login`,
					bodyFormData,
				)
				.then((res) => {
					if (!res.data.success) {
						message.error(res.data.message);
						setProcessing(false);
						setDisabled(false);
					} else {
						store.set('digi_token', res.data.token);
						axios
							.post(
								`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${res.data.token}`,
							)
							.then((res) => {
								store.set('digi_user', res.data.data[0]);
								history.push('/dashboard');
								setProcessing(false);
							})
							.catch((error) => console.log(error));
						message.success(res.data.message);
					}
				})
				.catch((err) => {
					setProcessing(false);
					message.error('Something Went Wrong!!');
					console.log(err);
				});
		}
	};

	const override = css`
		display: none;
		margin: 1px auto;
		border-color: red;
		opacity: 0.9;
	`;

	return (
		<>
			<div className='header'>
				<div className='container-fluid'>
					<div className='row'>
						<div className='col-sm-3 logo'>
							<Link to='/' title='logo'>
								<img
									src={process.env.PUBLIC_URL + '/img/logo.png'}
									alt='webmuse'
								/>
							</Link>
						</div>
						<div className='col-sm-9 right-info'></div>
					</div>
				</div>
			</div>

			<div className='login-section'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-6 login-form'>
							<h3>Login to DigiAgreement</h3>
							<form onSubmit={handleSubmit}>
								<div className='form-group'>
									<input
										type='email'
										className='form-control'
										id='exampleInputEmail1'
										aria-describedby='emailHelp'
										placeholder='Enter email'
										name='email'
										value={person.email}
										onChange={handleChange}
									/>
								</div>
								<div className='form-group'>
									<input
										type='password'
										className='form-control'
										id='exampleInputPassword1'
										name='password'
										value={person.password}
										onChange={handleChange}
										placeholder='Password'
									/>
								</div>
								<div className='form-group form-check'>
									<input
										type='checkbox'
										className='form-check-input'
										id='exampleCheck1'
									/>

									<label className='form-check-label' htmlFor='exampleCheck1'>
										<span style={{ float: 'left' }}>Remember me</span>{' '}
										<span className='forgot'>
											<a onClick={() => history.push('/forgot')}>
												Forgot Password?
											</a>
										</span>
									</label>
								</div>

								<button
									type='submit'
									className='btn btn-primary'
									disabled={processing || disabled}
								>
									<span id='button-text'>
										{processing ? (
											<ScaleLoader
												color='#ffffff'
												loading={processing}
												css={override}
												size={150}
											/>
										) : (
											'Submit'
										)}
									</span>
								</button>
							</form>
							<p className='text-center'>
								<div style={{ color: '#666' }}>
									or log in with other account
								</div>
							</p>
							<p className='text-center social-btn'>
								<Space size={30}>
									<GoogleLogin />
									<FbLogin />
									<LinkedLogin />
								</Space>
							</p>
							<p className='text-center signup-text'>
								Don't have a DigiAgreement account yet?{'  '}
								<Link to='/signup' style={{ color: '#05c6ff' }}>
									Sign Up
								</Link>
							</p>
						</div>
						<div className='col-sm-6 right-bar-login'>
							<div className='right-bar-content'>
								<h4>Contracts as Easy as 1-2-3</h4>
								<p>
									Simplified Document Creation. Easy Sharing, Collaboration for
									review ab=nd editing. Digital Signature.
								</p>
								<a href=''>Read More</a>
							</div>
							<div className='right-bar-content'>
								<h4>Grab 20+ Contract Templates</h4>
								<p>
									We teamed up with HubSpot to create a guide that contains 20+
									sales templates tested by our own teams.
								</p>
								<a href=''>Download Now</a>
							</div>
							<div className='right-bar-content'>
								<h4>Govt Approved Aadhaar based Digital Signature</h4>
								<p>
									Per IT Act 1900 Aadhar based Digital Signature are considered
									as good as hand Signature
								</p>
								<a href=''>Read More</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
