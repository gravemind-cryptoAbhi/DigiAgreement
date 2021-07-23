import React, { useEffect, useState } from 'react';
import store from 'store';
import { Link, useHistory } from 'react-router-dom';
import { gapi } from 'gapi-script';
import axios from 'axios';
import { url } from '../../url/Url';
import mammoth from 'mammoth';
import FadeLoader from 'react-spinners/FadeLoader';
import { css } from '@emotion/react';
import { Button, TablePagination } from '@material-ui/core';
import { Empty, message, notification, Skeleton, Space } from 'antd'; //import CloseIcon from '@material-ui/icons';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import { isTokenValid, logout } from './TokenExpire';
import styled from 'styled-components';

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));

const HeadSide = (props) => {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	let data = store.get('digi_user');
	const [processing, setProcessing] = useState(false);
	const history = useHistory();
	const override = css`
		display: block;
		background-color: #fff;
		margin: 0px auto;
		opacity: 0.7;
	`;

	const signOut = () => {
		if (data['provider'] === 'google') {
			var auth2 = gapi.auth2.getAuthInstance();
			if (auth2 != null) {
				auth2.signOut().then(auth2.disconnect());
			}
			store.clearAll();
			history.push('/login');
		}
		if (data['provider'] === 'facebook') {
			store.clearAll();
			history.push('/login');
			message.success('You Logged Out!!');
		} else {
			store.clearAll();
			history.push('/login');
			message.success('You Logged Out!!');
		}
	};
	const [templates, setTemplates] = useState([]);
	const getTemplates = () => {
		setProcessing(true);
		fetch(
			`${url}/admin_git/digitalsignature/public/api/templates/admin?token=${store.get(
				'digi_token',
			)}&type=template`,
			{
				method: 'POST',
			},
		)
			.then((res) => res.json())
			.then((res) => {
				const transformData = res.data.map((data, index) => ({
					file_name: data.file_name,
					row_id: index + 1,
					id: data.id,
					template_name: data.template_name || 'Random Template',
					template_path: data.template_path,
					view_count: data.view_count || 0,
					user_type: data.user_type,
				}));

				setTemplates(transformData);
				setProcessing(!true);
			})
			.catch((err) => {
				console.log(err);
				if (err.response.status === 401) {
					setProcessing(false);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setProcessing(false);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const fetchTemplate = (id) => {
		setBdOpen(true);
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/templates/${id}`, {
				params: {
					token: store.get('digi_token'),
				},
			})
			.then((res) => {
				const file = res.data.data[0];
				if (file.user_type === 'admin') {
					var bodyFormData = new FormData();
					bodyFormData.append('token', store.get('digi_token'));
					bodyFormData.append('tname', file.template_name);
					bodyFormData.append('type', 'document');
					bodyFormData.append('text', file.text);
					axios
						.post(
							`${url}/admin_git/digitalsignature/public/api/templates/create`,
							bodyFormData,
						)
						.then((res) => {
							store.set('htmlContent', file.text);
							store.set('fileInfo', res.data.data);
							setBdOpen(false);
							history.push('/editor');
						})
						.catch(() => {
							setBdOpen(false);
							message.error('Something Went Wrong!!');
						});
				} else {
					store.set('fileInfo', file);
					store.set('htmlContent', file.text);
					setBdOpen(false);
					history.push('/editor');
				}
				//increaseUsage(id);
			})
			.catch(() => {
				setBdOpen(false);
				message.error('Something Went Wrong!!');
			});
	};

	var fileDoc = '';
	function parseWordDocxFile(e) {
		e.preventDefault();
		if (e.target.files[0]) {
			var file = e.target.files[0];
		}
		if (
			file['type'] ===
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			setBdOpen(true);
			var reader = new FileReader();
			reader.onloadend = function (event) {
				var arrayBuffer = reader.result;
				mammoth
					.convertToHtml({ arrayBuffer: arrayBuffer })
					.then(function (resultObject) {
						fileDoc = resultObject.value;
						var bodyFormData = new FormData();
						bodyFormData.append('token', store.get('digi_token'));
						bodyFormData.append(
							'tname',
							e.target.files[0]['name'].split('.')[0],
						);
						bodyFormData.append('type', 'document');
						bodyFormData.append('start_date', '');
						bodyFormData.append('end_date', '');
						bodyFormData.append('doctype', '');
						bodyFormData.append('text', fileDoc);
						axios
							.post(
								`${url}/admin_git/digitalsignature/public/api/templates/create`,
								bodyFormData,
							)
							.then((res) => {
								//console.log(res);
								setBdOpen(!true);
								store.set('htmlContent', fileDoc);
								store.set('fileInfo', res.data.data);
								history.push('/editor');
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
					})
					.catch((error) => {
						setBdOpen(!true);
						message.error(error.message);
					});
			};
			reader.readAsArrayBuffer(file);
		} else {
			setBdOpen(!true);
			message.error('Only .docx file is acceptable');
		}
	}

	const handleScratch = (e) => {
		setBdOpen(true);
		e.preventDefault();
		var bodyFormData = new FormData();
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('tname', 'New Document');
		bodyFormData.append('type', 'document');
		bodyFormData.append('start_date', '');
		bodyFormData.append('end_date', '');
		bodyFormData.append('doctype', '');
		bodyFormData.append('text', '<p></p>');
		fetch(`${url}/admin_git/digitalsignature/public/api/templates/create`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res) {
					store.set('htmlContent', res.data.text);
					store.set('fileInfo', res.data);
					setBdOpen(!true);
					history.push('/editor');
				} else {
					setBdOpen(!true);
					history.push('/dashboard');
					message.error('Something went wrong');
				}
			})
			.catch((error) => {
				setBdOpen(!true);
				message.error('Something went wrong');
			});
	};

	//state for menu drawer

	const [showMenu, setShowMenu] = useState(false);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const emptyRows =
		rowsPerPage - Math.min(rowsPerPage, templates.length - page * rowsPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const [open, setOpen] = useState(false);
	var end_date = {};
	var start_date = {};
	const [leftDays, setLeftDays] = useState(0);
	let remainingDays = moment(
		store.get('digi_user')['plansubscription']['expiry_date'],
	)?.diff(moment(), 'days');
	//const [leftDays, setLeftDays] = useState(0);

	const handleNotification = () => {
		document.getElementById('a').style.display = 'none';
		store.set('notification', 'no');
	};

	useEffect(() => {
		if (store.get('digi_user')['plansubscription']) {
			setTimeout(() => {
				end_date = moment();
				start_date = moment(
					store.get('digi_user')['plansubscription']['expiry_date'],
				);
				setLeftDays(start_date.diff(end_date, 'days'));
				if (remainingDays <= 7) {
					if (!store.get('notification')) {
						store.set('notification', 'yes');
					}
				} else {
					if (document.getElementById('a')) {
						document.getElementById('a').style.display = 'none';
						store.set('notification', 'no');
					}
				}
			}, 1000);
		}
	}, []);

	return (
		<>
			{store.get('notification') === 'yes' && (
				<div className='red-alert' id='a'>
					{remainingDays < 0
						? `Your plan has been expired`
						: remainingDays === 1
							? `Your plan is about to expire, ${remainingDays} day is left.`
							: `Your plan is about to expire, ${remainingDays} days left.`}
					{'  '}
					<Link to='/pricing' style={{ color: 'white' }}>
						<u>Subscribe Now</u>
					</Link>
					<span>
						<i
							className='fas fa-times'
							style={{ cursor: 'pointer' }}
							onClick={() => handleNotification()}
						></i>
					</span>
				</div>
			)}
			<header id='page-topbar'>
				{/* <Collapse in={open}>
					<Alert
						color='warning'
						action={
							<IconButton
								aria-label='close'
								color='inherit'
								size='small'
								onClick={() => {
									setOpen(false);
								}}
							>
								Close
							</IconButton>
						}
					>
						Close me!
					</Alert>
				</Collapse> */}
				<div className='navbar-header'>
					<div className='d-flex'>
						<div className='navbar-brand-box'>
							<a
								href=''
								onClick={() => history.push('/dashboard')}
								className='logo logo-dark'
							>
								<span className='logo-sm'>
									<img
										src={process.env.PUBLIC_URL + '/assets/images/logo.svg'}
										alt=''
										height='22'
									/>
								</span>
								<span className='logo-lg'>
									<img
										src={
											process.env.PUBLIC_URL + '/assets/images/logo-dark.png'
										}
										alt=''
										height='17'
									/>
								</span>
							</a>

							<Link to='/dashboard' className='logo logo-light'>
								<span className='logo-sm'>
									<img
										src={process.env.PUBLIC_URL + '/assets/images/logo-sm.png'}
										alt=''
										height='22'
									/>
								</span>
								<span className='logo-lg'>
									<img
										src={
											process.env.PUBLIC_URL + '/assets/images/logo-light.png'
										}
										alt=''
										height=''
									/>
								</span>
							</Link>
						</div>

						<button
							type='button'
							class='btn btn-sm px-3 font-size-24 header-item waves-effect'
							id='vertical-navmenu-btn'
							onClick={() => {
								setShowMenu(!showMenu)
							}}
						>
							<i class='mdi mdi-menu'></i>

						</button>

						<div className='d-none d-sm-block'>
							<h4 className='font-size-18' style={{  marginTop: '19px' }}>
								{props.heading}
							</h4>
						</div>
					</div>

					<div className='d-flex'>
						{props.type === 'teams' ? (
							<div className='dropdown d-inline-block'>
								<span>{TextTrackList}</span>
								<button
									className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
									type='button'
									data-toggle='modal'
									data-target='.modalTeam'
								>
									Create New
								</button>
								{props.teamData !== 0 && (
									<button
										className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
										type='button'
										data-toggle='modal'
										data-target='.bs-example-modal-sm'
									>
										{props.text}
									</button>
								)}
							</div>
						) : (
							<div className='dropdown d-inline-block'>
								{remainingDays < 0 ? (
									<button
										className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
										type='button'
										onClick={() =>
											notification['info']({
												message: 'Plan Expired',
												description:
													'Your Plan has been Expired, kindly Subscribe Now to Continue.',
												onClick: function () {
													window.location.href = '/pricing';
												},
												style: { cursor: 'pointer' },
											})
										}
									>
										Create New
									</button>
								) : (
									<button
										className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
										type='button'
										data-toggle='modal'
										data-target='.bs-example-modal-sm'
									>
										Create New
									</button>
								)}
								<div
									className='modal fade bs-example-modal-sm'
									tabIndex='-1'
									role='dialog'
									aria-labelledby='mySmallModalLabel'
									aria-hidden='true'
								>
									<div className='modal-dialog modal-sm'>
										<div className='modal-content'>
											<div className='modal-header'>
												<h5 className='modal-title mt-0' id='mySmallModalLabel'>
													Create New
												</h5>
											</div>
											<div className='modal-body'>
												<ButtonContainer
													variant='outlined'
													size='large'
													component='div'
													data-toggle='modal'
													data-target='.bs-example-modal-lg'
													onClick={getTemplates}
												>
													Choose a template
												</ButtonContainer>
												<div
													className='modal fade bs-example-modal-lg'
													tabIndex='-1'
													role='dialog'
													aria-labelledby='myLargeModalLabel'
													aria-hidden='true'
												>
													<div className='modal-dialog modal-lg'>
														<div className='modal-content'>
															<div className='modal-header'>
																<h5
																	className='modal-title mt-0'
																	id='myLargeModalLabel'
																>
																	Choose Template
																</h5>
																<button
																	type='button'
																	className='close'
																	data-dismiss='modal'
																	aria-hidden='true'
																>
																	×
																</button>
															</div>
															<div className='modal-body'>
																{processing ? (
																	<FadeLoader
																		color='black'
																		loading={processing}
																		css={override}
																		size={50}
																	/>
																) : (
																	<table
																		id='datatable'
																		className='table dt-responsive nowrap'
																		style={{
																			borderCollapse: 'collapse',
																			borderSpacing: '0',
																			width: '100%',
																			textAlign: 'center',
																		}}
																	>
																		{templates.length === 0 ? (
																			<tr>
																				<td colSpan={4} align='center'>
																					<Empty />
																				</td>
																			</tr>
																		) : (
																			<>
																				<thead>
																					<tr>
																						<TablePagination
																							rowsPerPageOptions={[
																								5,
																								10,
																								15,
																								{ label: 'All', value: -1 },
																							]}
																							tabIndex={-1}
																							count={templates.length}
																							rowsPerPage={rowsPerPage}
																							page={page}
																							SelectProps={{
																								inputProps: {
																									'aria-label': 'rows per page',
																								},
																								native: true,
																							}}
																							onChangePage={handleChangePage}
																							onChangeRowsPerPage={
																								handleChangeRowsPerPage
																							}
																						/>
																					</tr>
																					<tr>
																						<th>Template Id</th>
																						<th>Title</th>
																						<th>Author</th>
																						<th>Rating | Usage | Comments</th>
																					</tr>
																				</thead>
																				<tbody>
																					{(rowsPerPage > 0
																						? templates.slice(
																							page * rowsPerPage,
																							page * rowsPerPage +
																							rowsPerPage,
																						)
																						: templates
																					).map((data, index) => (
																						<tr key={index}>
																							<td>{data.id}</td>
																							<td
																								onClick={() =>
																									fetchTemplate(data.id)
																								}
																								data-dismiss='modal'
																								style={{
																									cursor: 'pointer',
																								}}
																							>
																								<i className='ti-file'></i>{' '}
																								{data.template_name}
																							</td>
																							<td>{data.user_type}</td>
																							<td>
																								<Space size={2}>
																									<span className='icons-table'>
																										<i className='fas fa-star'></i>{' '}
																										4.3
																									</span>
																									<span className='icons-table'>
																										<i className='fas fa-check-circle'></i>{' '}
																										{data.view_count}
																									</span>
																									<span className='icons-table'>
																										<i
																											className='fas fa-comment-dots
  '
																										></i>{' '}
																										3
																									</span>
																								</Space>
																							</td>
																						</tr>
																					))}
																				</tbody>
																			</>
																		)}
																	</table>
																)}
															</div>
														</div>
													</div>
												</div>
												{/* <a
													href='javascript(0);'
													htmlFor='upload'
													data-dismiss='modal'
												>
													Upload Existing Document
												</a> */}
												<input
													//className={classes.input}
													id='contained-button-file'
													onChange={parseWordDocxFile}
													accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
													type='file'
													style={{ display: 'none' }}
												/>

												<ButtonContainer
													variant='outlined'
													size='large'
													fullWidth={true}
													htmlFor='contained-button-file'
													component='label'
												>
													Upload Existing Document
												</ButtonContainer>
												<ButtonContainer
													variant='outlined'
													size='large'
													fullWidth={true}
													component='div'
													onClick={handleScratch}
													data-dismiss='modal'
												>
													Create from Scratch
												</ButtonContainer>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						<div className='dropdown d-inline-block'>
							<div className='dropdown d-inline-block'>
								<button
									type='button'
									className='btn header-item noti-icon waves-effect'
								>
									<img
										src={process.env.PUBLIC_URL + '/assets/images/qmark.png'}
										alt=''
									/>
								</button>
							</div>
							<button
								type='button'
								className='btn header-item waves-effect'
								id='page-header-user-dropdown'
								data-toggle='dropdown'
							// data-target='#d'
							// aria-expanded='true'
							// aria-controls='d'
							>
								{data['profile_pic'] ? (
									<img
										className='rounded-circle header-profile-user'
										src={data['profile_pic']}
										alt='Header Avatar'
									/>
								) : (
									<Skeleton.Avatar
										active={true}
										size='default'
										shape='circle'
									/>
									// <div>hello</div>
								)}
							</button>

							<div className='dropdown-menu dropdown-menu-right' id='d'>
								<a
									className='dropdown-item'
									href=''
									onClick={() => history.push('/profile')}
								>
									{/* <i className='mdi mdi-account-circle font-size-17 align-middle mr-1'></i> */}
									<AccountCircleOutlinedIcon fontSize='small' />
									{'  '}
									Profile
								</a>
								<a
									className='dropdown-item d-block'
									onClick={() => history.push('/billing')}
								>
									{/* <i className='mdi mdi-settings font-size-17 align-middle mr-1'></i> */}
									<AccountBalanceWalletOutlinedIcon fontSize='small' />
									{'  '}
									Billing
								</a>
								<div className='dropdown-divider'></div>
								<button
									className='dropdown-item text-danger'
									onClick={signOut}
									style={{ cursor: 'pointer' }}
								>
									<i className='bx bx-power-off font-size-17 align-middle mr-1 text-danger'></i>
									Logout
								</button>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className='vertical-menubar' style={{ display: showMenu ? "block" : "none" ,position:"fixed" }}>
				<div data-simplebar className='h-100'>
					<div id='sidebar-navbar-menu'>
						<ul className='metismenu list-unstyled' id='side-menu'>
							<li
								className={props.page === 'dashboard' ? 'mm-active' : undefined}
							>
								<Link
									//href=''
									to='/dashboard'
									//onClick={() => history.push('/dashboard')}
									className={
										props.page === 'dashboard'
											? 'waves-effect active'
											: 'waves-effect'
									}
								>
									<i className='fas fa-home'></i>
									<span>Dashboard</span>
								</Link>


							</li>
							<li
								className={props.page === 'document' ? 'mm-active' : undefined}
							>
								<Link
									//href=''
									to='/document'
									//onClick={() => history.push('/document')}
									className={
										props.page === 'document'
											? 'waves-effect active'
											: 'waves-effect'
									}
								>
									<i className='far fa-file-alt'></i>
									<span>Documents</span>
								</Link>
							</li>
							<li
								className={props.page === 'template' ? 'mm-active' : undefined}
							>
								<Link
									//href=''
									to='/template'
									//onClick={() => history.push('/template')}
									className={
										props.page === 'template'
											? 'waves-effect active'
											: 'waves-effect'
									}
								>
									<i className='fas fa-list-alt'></i>
									<span>Template</span>
								</Link>
							</li>
							<li className={props.page === 'teams' ? 'mm-active' : undefined}>
								<Link
									//href=''
									to='/members'
									//onClick={() => history.push('/teams')}
									className={
										props.page === 'teams'
											? 'waves-effect active'
											: 'waves-effect'
									}
								>
									<i className='fas fa-users'></i>
									<span>Teams</span>
								</Link>
							</li>
							<li>
								<Link
									to='/websocket'
									className='waves-effect'
								//onClick={() => history.push('/websocket')}
								//rel='noreferrer'
								>
									<i className='fas fa-folder-plus'></i>
									<span>Library</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</>
	);
};

export default HeadSide;

const ButtonContainer = styled(Button)`
	width: 100%;
	padding: 20px;
	margin-bottom: 20px;
`;
