import { message } from 'antd';
import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { css } from '@emotion/react';
import { url } from '../url/Url';

const Contact = () => {
	const [values, setValues] = useState({
		email: '',
		name: '',
		mobile: '',
		text: '',
	});
	const [processing, setProcessing] = useState(false);
	const history = useHistory();
	const handleChange = (e) => {
		setValues({ ...values, [e.target.name]: e.target.value });
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!values.name) {
			message.error('Name Field is Required');
		} else if (!values.email) {
			message.error('Email Field is Required');
		} else if (!values.text || values.text.length < 10) {
			message.error('Description should be more than 10 words');
		} else {
			setProcessing(true);
			axios
				.post(`${url}/admin_git/digitalsignature/public/api/contact/send`, {
					params: {
						name: values.name,
						email: values.email,
						mobile: values.mobile,
						description: values.text,
					},
				})
				.then((res) => {
					if (res.data.success) {
						setProcessing(!true);
						message.success(res.data.message);
						history.push('/');
					} else {
						setProcessing(!true);
						message.error(res.data.message);
					}
				})
				.catch(() => {
					setProcessing(!true);
					message.error('Something Went Wrong!!');
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
		<div>
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
							<h3>Connect with us</h3>
							<form onSubmit={handleSubmit}>
								<div className='form-group'>
									<input
										type='email'
										className='form-control'
										name='email'
										value={values.email}
										onChange={handleChange}
										aria-describedby='emailHelp'
										placeholder='Enter email'
									/>
								</div>
								<div className='form-group'>
									<input
										type='name'
										className='form-control'
										name='name'
										value={values.name}
										onChange={handleChange}
										aria-describedby='emailHelp'
										placeholder='Enter name'
									/>
								</div>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										name='mobile'
										value={values.mobile}
										onChange={handleChange}
										aria-describedby='emailHelp'
										placeholder='Enter mobile'
									/>
								</div>
								<div className='form-group'>
									<textarea
										className='enter-txt'
										placeholder='Enter text'
										name='text'
										value={values.text}
										onChange={handleChange}
									/>
								</div>
								<button type='submit' className='btn btn-primary'>
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
		</div>
	);
};

export default Contact;
