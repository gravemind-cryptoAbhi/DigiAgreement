/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import store from 'store';

function Home() {
	const history = useHistory();
	useEffect(() => {
		store.remove('plan_id');
	});
	return (
		<>
			<div className='header'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-3 logo1'>
							<a href='' title='logo'>
								<img
									src={process.env.PUBLIC_URL + '/img/logo.png'}
									alt='webmuse'
								/>
							</a>
						</div>
						<div className='col-sm-9 right-info'>
							<ul className='menu'>
								<li>
									<a href=''>Why DigiAgreement?</a>
								</li>
								<li>
									<a href=''>Solution</a>
								</li>
								<li>
									<a href='' onClick={() => history.push('/plans')}>
										Pricing
									</a>
								</li>
								<li>
									<a href=''>Resources</a>
								</li>
								{store.get('digi_token') ? (
									<li>
										<Link to='/dashboard'>Go to Dashboard</Link>
									</li>
								) : (
									<>
										<li>
											<Link to='/login'>LOGIN</Link>
										</li>

										<li className='trial'>
											<Link to='/signup'>START 14-DAY TRIAL</Link>
										</li>
									</>
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div class='banner'>
				<div class='container'>
					<div class='row'>
						<div class='col-sm-6'>
							<h1>Draft to Sign, Everything Online</h1>
							<p>
								Create your agreements online and share them through secured
								link.
							</p>
							<Link class='get-start'>GET STARTED</Link>
						</div>
						<div class='col-sm-6 video-iframe'>
							<iframe
								width='100%'
								height='380'
								style={{ borderRadius: '10px' }}
								src='https://www.youtube.com/embed/NB3vhUl-BE8'
								frameborder='0'
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
								allowfullscreen
							></iframe>
						</div>
					</div>
				</div>
			</div>
			<div className='process'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-3'>
							<a href=''>
								<img
									src={process.env.PUBLIC_URL + '/img/proposal.png'}
									alt=''
								/>
							</a>
						</div>
						<div className='col-sm-3'>
							<a href=''>
								<img src={process.env.PUBLIC_URL + '/img/quotes.png'} alt='' />
							</a>
						</div>
						<div className='col-sm-3'>
							<a href=''>
								<img
									src={process.env.PUBLIC_URL + '/img/contracts.png'}
									alt=''
								/>
							</a>
						</div>
						<div className='col-sm-3'>
							<a href=''>
								<img src={process.env.PUBLIC_URL + '/img/payment.png'} alt='' />
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className='brands'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-6'>
							<h2>DigiAgreement + the tools you love</h2>
							<p>
								Say goodbye to manual data entry. Integrate with the tools you
								depend on so your team can get proposals, contracts and quotes
								out the door fast.
							</p>
							<a href=''>See all integrations</a>
						</div>
						<div className='col-sm-6 brand-img'>
							<img src={process.env.PUBLIC_URL + '/img/brands.png'} alt='' />
						</div>
					</div>
				</div>
			</div>

			<div className='team'>
				<div className='container'>
					<div className='row'>
						<div className='col-sm-12 text-center'>
							<h2>Winning team choose DigiAgreement</h2>
						</div>
					</div>
					<div className='row'>
						<div className='col-sm-4'>
							<div className='box1'>
								<h3>CARR</h3>
								<h5>WORKPLACES</h5>
								<p>
									"DigiAgreement have changed our sales process entirely. We are
									now smarter, faster, and proud of what we are able to send to
									our prospects."
								</p>
								<p className='author-name'>Martha Stifter</p>
								<span className='position-post'>
									VP of Sales and Operations
								</span>
							</div>
						</div>
						<div className='col-sm-4'>
							<a href=''>
								<img src={process.env.PUBLIC_URL + '/img/team1.jpg'} alt='' />
							</a>
						</div>
						<div className='col-sm-4'>
							<a href=''>
								<img src={process.env.PUBLIC_URL + '/img/team2.jpg'} alt='' />
							</a>
						</div>
					</div>
					<div className='view-more-team text-center'>
						<a href={window.location}>Read all customer stories</a>
					</div>
				</div>
			</div>
			<div className='clear'></div>
			{!store.get('digi_token') && (
				<div className='get-start-sec'>
					<div className='container'>
						<div className='row'>
							<div className='col-sm-12 text-center'>
								<h2>Get started with DigiAgreement today</h2>
							</div>
						</div>
						<div className='row'>
							<div className='col-sm-12 get-btn text-center'>
								<Link style={{ color: '#fff' }} to='/contact'>
									Get Start
								</Link>
								<Link
									style={{ color: '#fff' }}
									to='/contact'
									className='request-demo'
								>
									Request a demo
								</Link>
								<p>
									<a href=''>No credit card required</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className='footer1'>
				<div className='container'>
					<div className='foot-col'>
						<h3>Product</h3>
						<ul>
							<li>
								<a href=''>Product tour</a>
							</li>
							<li>
								<a href=''>Pricing</a>
							</li>
							<li>
								<a href=''>Security</a>
							</li>
							<li>
								<a href=''>Templates</a>
							</li>
							<li>
								<a href=''>Updates</a>
							</li>
							<li>
								<a href=''>Onboarding Services</a>
							</li>
						</ul>
					</div>
					<div className='foot-col'>
						<h3>Integrations</h3>
						<ul>
							<li>
								<a href=''>HubSpot</a>
							</li>
							<li>
								<a href=''>Salesforce</a>
							</li>
							<li>
								<a href=''>Pipedrive</a>
							</li>
							<li>
								<a href=''>Zoho</a>
							</li>
							<li>
								<a href=''>Copper</a>
							</li>
							<li>
								<a href=''>Other</a>
							</li>
						</ul>
					</div>
					<div className='foot-col'>
						<h3>Solutions</h3>
						<ul>
							<li>
								<a href=''>Proposals</a>
							</li>
							<li>
								<a href=''>Quotes</a>
							</li>
							<li>
								<a href=''>Contracts</a>
							</li>
							<li>
								<a href=''>eSignatures</a>
							</li>
							<li>
								<a href=''>Payments</a>
							</li>
							<li>
								<a href=''>API & SDK</a>
							</li>
						</ul>
					</div>
					<div className='foot-col'>
						<h3>Resources</h3>
						<ul>
							<li>
								<a href=''>Help center</a>
							</li>
							<li>
								<a href=''>Blog</a>
							</li>
							<li>
								<a href=''>Library</a>
							</li>
							<li>
								<a href=''>Case studies</a>
							</li>
							<li>
								<a href=''>Partners</a>
							</li>
							<li>
								<a href=''>System status</a>
							</li>
						</ul>
					</div>
					<div className='foot-col'>
						<h3>Company</h3>
						<ul>
							<li>
								<a href=''>About us</a>
							</li>
							<li>
								<a href=''>Culture</a>
							</li>
							<li>
								<a href=''>Careers</a>
							</li>
							<li>
								<a href=''>Press</a>
							</li>
							<li>
								<a href=''>Contact us</a>
							</li>
							<li>
								<a href=''>Affiliate Program</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
}

export default Home;
