import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import store from 'store';
import axios from 'axios';
import HeadSide from './Utils/Head_Side';
import {
	Avatar,
	Button,
	Input,
	Form,
	Modal,
	Space,
	Tag,
	notification,
} from 'antd';
import BarLoader from 'react-spinners/BarLoader';
import { css } from '@emotion/react';
import { url } from '../url/Url';
import { Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { TablePagination, Tooltip } from '@material-ui/core';
import { Empty, message } from 'antd';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import './drawer.css';
import { isTokenValid, logout } from './Utils/TokenExpire';
import moment from 'moment';
const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));
const Members = () => {
	const [activeId, setActiveId] = useState(0);
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	const history = useHistory();
	const [teams, setTeams] = useState([]);
	const [members, setMembers] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [id1, setId1] = useState(activeId);
	const user = store.get('digi_user')['plansubscription'];
	const remainingDays = moment(user['expiry_date']).diff(moment(), 'days');

	const override = css`
		display: block;
		background-color: #05c6ff;
	`;
	const defaultValues = {
		firstName: '',
		lastName: '',
		email: '',
		mobile: '',
	};
	const [values, setValues] = useState(defaultValues);
	const handleChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		setValues({ ...values, [name]: value });
	};

	useEffect(() => {
		getTeams();
	}, []);
	function getTeams() {
		setBdOpen(true);
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/teams`, {
				params: {
					token: store.get('digi_token'),
				},
			})
			.then((res) => {
				const teamsTransformData = res.data.data.data.map((data) => ({
					id: data.id,
					title: data.title,
				}));
				teamsTransformData.sort(function (a, b) {
					if (a.title < b.title) {
						return -1;
					}
					if (a.title > b.title) {
						return 1;
					}
					return 0;
				});
				if (teamsTransformData.length !== 0) {
					getData1(teamsTransformData[0]['id']);
				}
				setTeams(teamsTransformData);
				setBdOpen(!true);
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
	function getTeams1(id) {
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/teams`, {
				params: {
					token: store.get('digi_token'),
				},
			})
			.then((res) => {
				const teamsTransformData = res.data.data.data.map((data) => ({
					id: data.id,
					title: data.title,
				}));
				teamsTransformData.sort(function (a, b) {
					if (a.title < b.title) {
						return -1;
					}
					if (a.title > b.title) {
						return 1;
					}
					return 0;
				});
				getData1(id);
				setTeams(teamsTransformData);
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

	const getData1 = (id) => {
		setProcessing(true);
		setId1(id);
		setActiveId(id);
		axios
			.get(
				`${url}/admin_git/digitalsignature/public/api/teams/listmember/${id}`,
				{
					params: {
						token: store.get('digi_token'),
					},
				},
			)
			.then((res) => {
				const transformData = res.data.data[0].teammember.map((data) => ({
					email: data.email,
					id: data.id,
					first_name: data.first_name,
					last_name: data.last_name,
					status: data.status,
					mobile: data.mobile,
				}));
				setMembers(transformData);
				setProcessing(!true);
			})
			.catch((err) => {
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

	const handleSubmit = () => {
		if (remainingDays < 0) {
			notification['info']({
				message: 'Plan Expired',
				description:
					'Your Plan has been Expired, kindly Subscribe Now to Continue.',
				onClick: function () {
					window.location.href = '/pricing';
				},
				style: { cursor: 'pointer' },
			});
		} else {
			setBdOpen(true);
			var bodyFormData = new FormData();
			bodyFormData.append('token', store.get('digi_token'));
			bodyFormData.append('teams_id', id1);
			bodyFormData.append('first_name', values.firstName);
			bodyFormData.append('last_name', values.lastName);
			bodyFormData.append('email', values.email);
			bodyFormData.append('mobile', values.mobile);
			fetch(`${url}/admin_git/digitalsignature/public/api/addteamsmember`, {
				method: 'POST',
				body: bodyFormData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						setBdOpen(!true);
						message.error(res.error.message);
					} else {
						setBdOpen(!true);
						message.success(res.message);
						getData1(parseInt(res.data.teams_id));
						setValues(defaultValues);
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
		}
	};

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const emptyRows =
		rowsPerPage - Math.min(rowsPerPage, members.length - page * rowsPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const [title, setTitle] = useState('');

	const handleAddTeam = (e) => {
		e.preventDefault();
		setBdOpen(true);
		if (remainingDays < 0) {
			notification['info']({
				message: 'Plan Expired',
				description:
					'Your Plan has been Expired, kindly Subscribe Now to Continue.',
				onClick: function () {
					window.location.href = '/pricing';
				},
				style: { cursor: 'pointer' },
			});
		} else {
			var bodyFormdata = new FormData();
			bodyFormdata.append('token', store.get('digi_token'));
			bodyFormdata.append('title', title);
			fetch(`${url}/admin_git/digitalsignature/public/api/teams/create`, {
				method: 'POST',
				body: bodyFormdata,
			})
				.then((res) => res.json())
				.then((res) => {
					if (!res.success) {
						console.log(res);
						message.error(res.error.message);
					} else {
						const data = store.get('digi_user');
						var bodyFormData1 = new FormData();
						bodyFormData1.append('token', store.get('digi_token'));
						bodyFormData1.append('teams_id', res.data.id);
						bodyFormData1.append('first_name', data['first_name'] || '');
						bodyFormData1.append('last_name', data['last_name'] || '');
						bodyFormData1.append('email', data['email'] || '');
						bodyFormData1.append('mobile', data['contact_no'] || '');
						fetch(
							`${url}/admin_git/digitalsignature/public/api/addteamsmember`,
							{
								method: 'POST',
								body: bodyFormData1,
							},
						)
							.then((res) => res.json())
							.then((res) => {
								if (res.error) {
									setBdOpen(!true);
									message.error(res.error.message);
								} else {
									setBdOpen(!true);
									message.success(res.message);
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
					}
					getTeams1(res.data.id);
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
	};
	const [visible, setVisible] = useState(false);
	const [memberId, setMemberId] = useState(0);
	const handleMemberModal = (firstName, lastName, email, mobile, id) => {
		setValues({
			firstName,
			lastName,
			email,
			mobile,
		});
		setMemberId(id);
		setVisible(true);
	};
	const handleMemberEdit = (e) => {
		e.preventDefault();
		if (!values.firstName) {
			message.error('First Name is Required');
		} else if (!values.lastName) {
			message.error('Last Name is Required');
		} else if (!values.email) {
			message.error('Email is Required');
		} else if (!values.mobile) {
			message.error('Mobile Number is Required');
		} else {
			setVisible(false);

			setBdOpen(true);
			var bodyFormData = new FormData();
			bodyFormData.append('token', store.get('digi_token'));
			bodyFormData.append('teams_id', id1);
			bodyFormData.append('id', memberId);
			bodyFormData.append('first_name', values.firstName);
			bodyFormData.append('last_name', values.lastName);
			bodyFormData.append('email', values.email);
			bodyFormData.append('mobile', values.mobile);
			fetch(`${url}/admin_git/digitalsignature/public/api/editteamsmember`, {
				method: 'POST',
				body: bodyFormData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.error) {
						setBdOpen(!true);
						message.error(res.error.message);
					} else {
						setBdOpen(!true);
						message.success(res.message);
						getData1(parseInt(res.data[0].teams_id));
						setValues(defaultValues);
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
		}
	};

	const handleStatus = (status, id) => {
		setBdOpen(true);
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/member/changestatus`, {
				params: {
					token: store.get('digi_token'),
					teams_id: id1,
					member_id: id,
					status: status === 'active' ? 'deactive' : 'active',
				},
			})
			.then((res) => {
				setBdOpen(!true);
				message.success(res.data.message);
				getData1(id1);
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
	};

	const layout = {
		labelCol: { span: 6 },
		wrapperCol: { span: 16 },
	};
	const getEditedTeams = () => {
		setBdOpen(true);
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/teams`, {
				params: {
					token: store.get('digi_token'),
				},
			})
			.then((res) => {
				const teamsTransformData = res.data.data.data.map((data) => ({
					id: data.id,
					title: data.title,
				}));
				teamsTransformData.sort(function (a, b) {
					if (a.title < b.title) {
						return -1;
					}
					if (a.title > b.title) {
						return 1;
					}
					return 0;
				});
				setTeams(teamsTransformData);
				setBdOpen(!true);
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
	};
	const [teamVisible, setTeamVisible] = useState(false);
	const [teamId, setTeamId] = useState(false);
	const handleTeamModal = (title, id) => {
		setTitle(title);
		setTeamId(id);
		setTeamVisible(true);
	};
	const handleTeamEdit = () => {
		setTeamVisible(false);
		setBdOpen(true);
		var bodyFormData = new FormData();
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('id', teamId);
		bodyFormData.append('title', title);
		fetch(`${url}/admin_git/digitalsignature/public/api/teams/edit`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					setBdOpen(!true);
					message.error(res.error.message);
				} else {
					setBdOpen(!true);
					message.success(res.message);
					getEditedTeams();
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
	};

	return (
		<>
			<Modal
				title='Edit Member'
				visible={visible}
				onOk={(e) => handleMemberEdit()}
				onCancel={() => {
					setValues(defaultValues);
					setVisible(false);
				}}
				footer={[
					<Button
						key='back'
						onClick={() => {
							setValues(defaultValues);
							setVisible(false);
						}}
					>
						Cancel
					</Button>,
					<Button
						key='submit'
						type='primary'
						style={{ backgroundColor: '#05C6FF', color: '#fff' }}
						onClick={handleMemberEdit}
					>
						Submit
					</Button>,
				]}
			>
				<Form name='userForm' {...layout}>
					<Form.Item label='First Name' rules={[{ required: true }]}>
						<Input
							onChange={handleChange}
							value={values.firstName}
							name='firstName'
						/>
					</Form.Item>
					<Form.Item label='Last Name' rules={[{ required: true }]}>
						<Input
							onChange={handleChange}
							value={values.lastName}
							name='lastName'
						/>
					</Form.Item>
					<Form.Item label='Email' rules={[{ required: true }]}>
						<Input onChange={handleChange} value={values.email} name='email' />
					</Form.Item>
					<Form.Item label='Mobile No.'>
						<Input
							onChange={handleChange}
							value={values.mobile}
							maxLength={10}
							name='mobile'
						/>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Edit Team'
				visible={teamVisible}
				onOk={(e) => handleTeamEdit()}
				onCancel={() => {
					setTitle('');
					setTeamVisible(false);
				}}
				footer={[
					<Button
						key='back'
						onClick={() => {
							setTitle('');
							setTeamVisible(false);
						}}
					>
						Cancel
					</Button>,
					<Button
						key='submit'
						type='primary'
						style={{ backgroundColor: '#05C6FF', color: '#fff' }}
						onClick={handleTeamEdit}
					>
						Submit
					</Button>,
				]}
			>
				<Form name='userForm' {...layout}>
					<Form.Item label='Team Title' rules={[{ required: true }]}>
						<Input
							onChange={(e) => setTitle(e.target.value)}
							value={title}
							name='title'
						/>
					</Form.Item>
				</Form>
			</Modal>
			{/* Begin page */}
			<div id='layout-wrapper'>
				<HeadSide
					type='teams'
					text='Add Member'
					teamData={teams.length}
					page='teams'
				/>
				<div
					className='modal modalTeam fade'
					tabIndex={-1}
					role='dialog'
					aria-labelledby='mySmallModalLabel'
					aria-hidden='true'
				>
					<div className='modal-dialog modal-lg add-team-form'>
						<div className='modal-content'>
							<div className='modal-header'>
								<h5 className='modal-title mt-0' id='mySmallModalLabel'>
									Add New Team
								</h5>
							</div>
							<div className='modal-body'>
								<form onSubmit={handleAddTeam}>
									<div className='anchovy-form-item'>
										<label htmlFor=''>
											<input
												id=''
												className='input-group'
												maxLength={30}
												name='title'
												data-ui-test='first-name-input'
												onChange={(e) => setTitle(e.target.value)}
												placeholder='Team Name'
												type='text'
												required
											/>
										</label>
									</div>
									<div className='popup-add-team-btn'>
										<Button
											data-kit='button'
											type='primary'
											onClick={handleAddTeam}
											data-dismiss='modal'
											className='button-3muNk button_sizeDefault-1Wzb8 design-primary-VgpnF'
											htmlType='submit'
											disabled={!title}
										>
											Add Team
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
				<div
					className='modal fade bs-example-modal-sm'
					tabIndex={-1}
					role='dialog'
					aria-labelledby='mySmallModalLabel'
					aria-hidden='true'
				>
					<div className='modal-dialog modal-lg add-team-form'>
						<div className='modal-content'>
							<div className='modal-header'>
								<h5 className='modal-title mt-0' id='mySmallModalLabel'>
									Add New Member
								</h5>
							</div>
							<div className='modal-body'>
								<form onSubmit={handleSubmit}>
									<div className='anchovy-form-item'>
										<label htmlFor='ui-test-first-name'>
											First name
											<input
												id='ui-test-first-name'
												className='input-group'
												maxLength={30}
												value={values.firstName}
												name='firstName'
												data-ui-test='first-name-input'
												onChange={handleChange}
												type='text'
												required
											/>
										</label>
									</div>
									<div className='anchovy-form-item'>
										<label htmlFor='ui-test-last-name'>
											Last name
											<input
												id='ui-test-last-name'
												className='input-group'
												maxLength={30}
												value={values.lastName}
												name='lastName'
												data-ui-test='last-name-input'
												onChange={handleChange}
												type='text'
												required
											/>
										</label>
									</div>
									<div className='anchovy-form-item'>
										<label htmlFor='email-input' className='validated-input'>
											Email
											<input
												id='email-input'
												className='input-group'
												value={values.email}
												name='email'
												data-ui-test='email-input'
												onChange={handleChange}
												type='email'
												required
											/>
										</label>
									</div>
									<div className='anchovy-form-item'>
										<label htmlFor='email-input' className='validated-input'>
											Phone
											<input
												id='phone-input'
												className='input-group'
												name='mobile'
												maxLength='10'
												data-ui-test='email-input'
												value={values.mobile}
												onChange={handleChange}
												type='text'
												required
											/>
										</label>
									</div>
									<div className='popup-add-team-btn'>
										<Button
											htmlType='submit'
											data-kit='button'
											className='button-3muNk button_sizeDefault-1Wzb8 design-primary-VgpnF'
											onClick={handleSubmit}
											data-dismiss='modal'
											disabled={
												!values.email ||
												!values.firstName ||
												!values.lastName ||
												!values.mobile
											}
											//loading={!true}
										>
											Add Member
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>

				<div className='main-content second-sidebar-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row second-sidebar'>
								<div className='col-sm-2 tab1'>
									<h4
										style={{ cursor: 'pointer' }}
										onClick={() => history.push('/teams')}
									>
										My Teams
									</h4>

									{teams.map((data, index) => (
										<div key={index} className='team__name'>
											<h5
												onClick={(e) => getData1(data.id)}
												style={
													activeId === data.id
														? { cursor: 'pointer', color: '#05C6FF' }
														: { cursor: 'pointer', color: 'black' }
												}
												id={data.id}
											>
												{data.title}
											</h5>
											<Tooltip title='Edit'>
												<EditIcon
													onClick={() => handleTeamModal(data.title, data.id)}
													className='team__edit'
													style={{ fontSize: '24px' }}
												/>
											</Tooltip>
										</div>
									))}
								</div>
								<div className='col-sm-10'>
									{processing ? (
										<BarLoader
											color='#ffffff'
											loading={processing}
											css={override}
											size={150}
											height={5}
											width={1100}
										/>
									) : members.length === 0 ? (
										<Empty />
									) : (
										<div className='card team-table'>
											<div className='card-body'>
												<table
													id='datatable'
													className='table dt-responsive nowrap'
													style={{
														borderCollapse: 'collapse',
														borderSpacing: 0,
														width: '100%',
													}}
												>
													<thead>
														<tr>
															<TablePagination
																rowsPerPageOptions={[
																	5,
																	10,
																	15,
																	{ label: 'All', value: -1 },
																]}
																colSpan={5}
																tabIndex={-1}
																count={members.length}
																rowsPerPage={rowsPerPage}
																page={page}
																SelectProps={{
																	inputProps: {
																		'aria-label': 'rows per page',
																	},
																	native: true,
																}}
																onChangePage={handleChangePage}
																onChangeRowsPerPage={handleChangeRowsPerPage}
																// ActionsComponent={TablePaginationActions}
															/>
														</tr>
														<tr>
															<th>Name</th>
															<th>Email</th>
															<th>Mobile</th>
															<th>Status</th>
														</tr>
													</thead>
													<tbody>
														{(rowsPerPage > 0
															? members.slice(
																	page * rowsPerPage,
																	page * rowsPerPage + rowsPerPage,
															  )
															: members
														).map((data, index) => (
															<tr key={index} className='table__row'>
																<td>
																	<Avatar
																		style={{
																			backgroundColor: '#05C6FF',
																			fontWeight: 'lighter',
																		}}
																		size={40}
																	>
																		{data.first_name[0]?.toUpperCase()}
																		{data.last_name[0]?.toUpperCase()}
																	</Avatar>
																	{'  '}
																	{data.first_name} {'  '} {data.last_name}
																</td>
																<td>{data.email}</td>
																<td>{data.mobile}</td>
																<td>
																	{data.status === 'active' ? (
																		<Tag color='green'>ACTIVE</Tag>
																	) : (
																		<Tag color='red'>INACTIVE</Tag>
																	)}
																</td>
																<td>
																	<Dropdown
																		placement='bottomRight'
																		overlay={
																			<Menu>
																				<Menu.Item
																					onClick={() =>
																						handleMemberModal(
																							data.first_name,
																							data.last_name,
																							data.email,
																							data.mobile,
																							data.id,
																						)
																					}
																					icon={
																						<EditIcon
																							style={{
																								fontSize: '18px',
																								opacity: '.5',
																								color: 'Highlight',
																							}}
																						/>
																					}
																				>
																					<Space size={5}>
																						<div></div>
																						<div></div>
																					</Space>
																					<span>Edit</span>
																				</Menu.Item>
																				<Menu.Item
																					onClick={() =>
																						handleStatus(data.status, data.id)
																					}
																					icon={
																						<FiberManualRecordIcon
																							style={
																								data.status === 'active'
																									? {
																											fontSize: '15px',
																											opacity: '.5',
																											color: 'red',
																									  }
																									: {
																											fontSize: '15px',
																											opacity: '.5',
																											color: 'green',
																									  }
																							}
																						/>
																					}
																				>
																					<Space size='small'>
																						<div></div>
																						<div></div>
																					</Space>
																					{data.status === 'active' ? (
																						<span>Make Inactive</span>
																					) : (
																						<span>Make Active</span>
																					)}
																				</Menu.Item>
																			</Menu>
																		}
																	>
																		<Button
																			className='ant-dropdown-link'
																			type='text'
																			icon={
																				<MoreOutlined
																					style={{ fontSize: '25px' }}
																				/>
																			}
																			size='large'
																			onClick={(e) => e.preventDefault()}
																		/>
																	</Dropdown>
																</td>
															</tr>
														))}
														<tr>
															<TablePagination
																rowsPerPageOptions={[
																	5,
																	10,
																	15,
																	{ label: 'All', value: -1 },
																]}
																colSpan={5}
																tabIndex={-1}
																count={members.length}
																rowsPerPage={rowsPerPage}
																page={page}
																SelectProps={{
																	inputProps: {
																		'aria-label': 'rows per page',
																	},
																	native: true,
																}}
																onChangePage={handleChangePage}
																onChangeRowsPerPage={handleChangeRowsPerPage}
															/>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									)}
								</div>
							</div>{' '}
							{/* end row */}
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

export default Members;
