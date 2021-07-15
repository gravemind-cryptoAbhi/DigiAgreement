import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { url } from '../url/Url';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { css } from '@emotion/react';
import { message } from 'antd';

const Forgot = () => {
	const [email, setEmail] = useState('');
	const [processing, setProcessing] = useState(false);
	const [disabled, setDisabled] = useState(!true);
	const override = css`
		display: block;
		margin: 1px auto;
		border-color: red;
		opacity: 0.9;
	`;

	const handleSubmit = (e) => {
		e.preventDefault();
		setProcessing(true);
		setDisabled(true);
		var bodyFormData = new FormData();
		bodyFormData.append('email', email);
		fetch(`${url}/admin_git/digitalsignature/public/api/password/email`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					message.error(res.error.message);
				} else {
					message.success(res.message);
				}
				setProcessing(false);
				setDisabled(true);
			})
			.catch((error) => {
				message.error('Something Went Wrong');
				setProcessing(false);
				setDisabled(!true);
			});
	};
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
							<h3>Forgot Password</h3>
							<form onSubmit={handleSubmit}>
								<div className='form-group'>
									<input
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										name='email'
										className='form-control'
										aria-describedby='emailHelp'
										placeholder='Enter email'
										required
									/>
								</div>

								<button
									type='submit'
									className='btn btn-primary'
									disabled={disabled}
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
								Or go Back to{' '}
								<Link to='/login' style={{ color: '#05c6ff' }}>
									Login
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
								<Link to='#'>Read More</Link>
							</div>
							<div className='right-bar-content'>
								<h4>Grab 20+ Contract Templates</h4>
								<p>
									We teamed up with HubSpot to create a guide that contains 20+
									sales templates tested by our own teams.
								</p>
								<Link to='#'>Download Now</Link>
							</div>
							<div className='right-bar-content'>
								<h4>Govt Approved Aadhaar based Digital Signature</h4>
								<p>
									Per IT Act 1900 Aadhar based Digital Signature are considered
									as good as hand Signature
								</p>
								<Link to='#'>Read More</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Forgot;
