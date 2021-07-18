/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { url } from '../url/Url';
import store from 'store';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { css } from '@emotion/react';
import { message } from 'antd';

function SignUp() {
	const [person, setPerson] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
	});
	const [succeeded, setSucceeded] = useState(false);
	const [processing, setProcessing] = useState('');
	let disabled = !true;
	const history = useHistory();

	const handleChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		setPerson({ ...person, [name]: value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!person.first_name) {
			message.warn('First Name is Required');
		} else if (!person.last_name) {
			message.warn('Last Name is Required');
		} else if (!person.email) {
			message.warn('Email is Required');
		} else if (!person.password) {
			message.warn('Password is Required');
		} else {
			setProcessing(true);
			var bodyFormData = new FormData();
			bodyFormData.append('email', person.email);
			bodyFormData.append('password', person.password);
			bodyFormData.append('first_name', person.first_name);
			bodyFormData.append('last_name', person.last_name);
			fetch(`${url}/admin_git/digitalsignature/public/api/register`, {
				method: 'POST',
				body: bodyFormData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						message.error(res.error.message);
						setProcessing(false);
					} else {
						store.set('digi_token', res.data.token);
						store.set('digi_user', res.data.data[0]);
						history.push('/dashboard');
						setProcessing(false);
						setSucceeded(true);
						message.success(res.data.message);
					}
				})
				.catch((err) => {
					setProcessing(false);
					console.log(err);
				});
		}
	};
	const override = css`
		display: block;
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
							<a onClick={() => history.push('/')} title='logo'>
								<img
									src={process.env.PUBLIC_URL + '/img/logo.png'}
									alt='webmuse'
								/>
							</a>
						</div>
						<div className='col-sm-9 right-info'></div>
					</div>
				</div>
			</div>

			<div className='login-section'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-6 login-form'>
							<h3>Start a free 14-day trail</h3>
							<form onSubmit={handleSubmit}>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										name='first_name'
										value={person.first_name}
										onChange={handleChange}
										placeholder='Enter First Name'
									/>
								</div>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										name='last_name'
										value={person.last_name}
										onChange={handleChange}
										placeholder='Enter Last Name'
									/>
								</div>
								<div className='form-group'>
									<input
										type='email'
										value={person.email}
										onChange={handleChange}
										name='email'
										className='form-control'
										aria-describedby='emailHelp'
										placeholder='Enter email'
									/>
								</div>
								<div className='form-group'>
									<input
										type='password'
										className='form-control'
										name='password'
										value={person.password}
										onChange={handleChange}
										placeholder='Enter Password'
									/>
								</div>

								<button
									type='submit'
									className='btn btn-primary'
									disabled={processing || disabled || succeeded}
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
							<p className='text-center signup-text'>
								Already have an account{'  '}
								<a
									onClick={() => history.push('/login')}
									style={{ color: '#05c6ff' }}
								>
									Login
								</a>
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
}

export default SignUp;
