import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../url/Url';
import {
	TablePagination,
	Backdrop,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@material-ui/core';
import store from 'store';
import { Circle } from 'better-react-spinkit';
import { useHistory } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';
import { css } from '@emotion/react';
import {
	Empty,
	message,
	notification,
	Space,
	Tag,
	Tooltip,
	Button,
	Modal,
	Checkbox,
	Col,
	Row,
} from 'antd';
import { makeStyles } from '@material-ui/core/styles';
import { isTokenValid, logout } from './Utils/TokenExpire';
import moment from 'moment';
import PersonOutlineRoundedIcon from '@material-ui/icons/PersonOutlineRounded';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import './drawer.css';

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 99999,
		color: '#fff',
	},
}));
const ThumbnailView = ({ designs }) => {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	const [templates, setTemplates] = useState([]);
	const [processing, setProcessing] = useState(false);
	const user = store.get('digi_user')['plansubscription'];
	const remainingDays = moment(user['expiry_date']).diff(moment(), 'days');
	const history = useHistory();
	const override = css`
		display: block;
		background-color: #05c6ff;
	`;
	useEffect(() => {
		getData();
	}, [designs]);

	function getData() {
		setBdOpen(true);
		if (designs === 'my_design') {
			axios
				.get(
					`${url}/admin_git/digitalsignature/public/api/list/templates?token=${store.get(
						'digi_token',
					)}&type=template`,
				)
				.then((res) => {
					const transformData1 = res.data.data.self.map((data, index) => ({
						file_name: data.file_name || 'Random Template',
						id: data.id,
						template_name: data.template_name,
						view_count: data.view_count || 0,
						template_path: data.template_path,
						status: data.status,
						updated_at: data.updated_at.split(' ')[0],
						user_type: `${data?.author.first_name} ${data?.author.last_name}`,
					}));
					const transformData2 = res.data.data.shared.map((data, index) => ({
						file_name: data.template.file_name || 'Random Template',
						id: data.template.id,
						view_count: data.view_count || 0,
						status: data.status,
						template_name: data.template.template_name,
						template_path: data.template.template_path,
						updated_at: data.template.updated_at.split(' ')[0],
						user_type: `${data?.template.author.first_name} ${data?.template.author.last_name}`,
					}));
					const transformData = [...transformData1, ...transformData2];
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setTemplates(transformData);
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
		} else {
			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/templates/admin?token=${store.get(
						'digi_token',
					)}&type=template`,
				)
				.then((res) => {
					const transformData = res.data.data.map((data, index) => ({
						file_name: data.file_name,
						id: data.id,
						template_name: data.template_name || 'Random Template',
						view_count: data.view_count || 0,
						template_path: data.template_path,
						updated_at: data.updated_at.split(' ')[0],
					}));
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setTemplates(transformData);
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
	}
	// const increaseUsage = (id) => {
	// 	if (!isTokenValid) {
	// 		logout();
	// 	} else {
	// 		fetch(
	// 			`${url}/admin_git/digitalsignature/public/api/view/template?token=${store.get(
	// 				'digi_token',
	// 			)}&template_id=${id}`,
	// 			{
	// 				method: 'POST',
	// 			},
	// 		)
	// 			.then((res) => res.json())
	// 			.then((res) => {
	// 				console.log(res);
	// 			})
	// 			.catch((err) => console.log(err));
	// 	}
	// };
	const increaseAdminUsage = (id) => {
		if (!isTokenValid) {
			logout();
		} else {
			fetch(
				`${url}/admin_git/digitalsignature/public/api/usage/template?token=${store.get(
					'digi_token',
				)}&template_id=${id}`,
				{
					method: 'POST',
				},
			)
				.then((res) => res.json())
				.then((res) => {
					console.log(res);
				})
				.catch((err) => console.log(err));
		}
	};
	const fetchTemplate = (id) => {
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
								increaseAdminUsage(id);
								store.set('htmlContent', file.text);
								store.set('fileInfo', res.data.data);
								setBdOpen(false);
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
					} else {
						store.set('fileInfo', file);
						store.set('htmlContent', file.text);
						setBdOpen(false);
						history.push('/editor');
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

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const [teamsPage, setTeamsPage] = useState(0);
	const [teamsRowsPerPage, setTeamsRowsPerPage] = useState(5);

	const handleChangeTeamsPage = (event, newPage) => {
		setTeamsPage(newPage);
	};

	const handleChangeTeamsRowsPerPage = (event) => {
		setTeamsRowsPerPage(parseInt(event.target.value, 10));
		setTeamsPage(0);
	};

	const [teamVisible, setTeamVisible] = useState(false);
	const [memberVisible, setMemberVisible] = useState(false);
	const [teamProcessing, setTeamProcessing] = useState(false);
	const [memberProcessing, setMemberProcessing] = useState(false);
	const [teamName, setTeamName] = useState('');
	const [teamId, setTeamId] = useState(0);
	const [teams, setTeams] = useState([]);
	const [members, setMembers] = useState([]);
	const [addVisible, setAddVisible] = useState(false);
	const [addLoading, setAddLoading] = useState(false);
	const [id, setId] = useState(0);
	const defaultMemberState = {
		first_name: '',
		last_name: '',
		email: '',
		mobile: '',
	};
	const [memberState, setMemberState] = useState(defaultMemberState);

	const handleMemberChange = (e) => {
		const name = e.target.name;
		const value = e.target.value;
		setMemberState({ ...memberState, [name]: value });
	};

	const handleMemberSubmit = (e) => {
		e.preventDefault();
		setAddLoading(true);
		var bodyFormData = new FormData();
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('teams_id', teamId);
		bodyFormData.append('first_name', memberState.first_name);
		bodyFormData.append('last_name', memberState.last_name);
		bodyFormData.append('email', memberState.email);
		bodyFormData.append('mobile', memberState.mobile);
		fetch(`${url}/admin_git/digitalsignature/public/api/addteamsmember`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					setAddLoading(!true);
					message.error(res.error.message);
				} else {
					setAddLoading(!true);
					message.success(res.message);
					setMemberState(defaultMemberState);
					setAddVisible(false);
					setMemberVisible(true);
					getMembers(teamId);
				}
			})
			.catch((err) => {
				if (err.response.status === 401) {
					setAddLoading(!true);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setAddLoading(!true);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const getTeams = () => {
		setTeamProcessing(true);
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
					created_at: data.created_at.split(' ')[0],
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
				setTeamProcessing(false);
			})
			.catch((err) => {
				if (err.response.status === 401) {
					setTeamProcessing(false);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setTeamProcessing(false);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const getMembers = (id) => {
		setMemberProcessing(true);
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
				const transformData = res.data.data[0].teammember.filter(
					(data) => data.status === 'active',
				);
				setMembers(transformData);
				setMemberProcessing(!true);
			})
			.catch((err) => {
				if (err.response.status === 401) {
					setMemberProcessing(!true);
					message.error('Session Timed Out..Kindly Login Again!!');
					store.clearAll();
					history.push('/login');
				} else {
					setMemberProcessing(!true);
					message.error('Something Went Wrong');
					console.log(err);
				}
			});
	};

	const [checkStatus, setCheckStatus] = useState([]);
	const handleTeamCheckbox = (
		checkedValues,
		email,
		mobile,
		last_name,
		first_name,
	) => {
		const value = [...checkStatus];
		const obj = value.filter((data) => email === data.email);
		if (obj.length === 0) {
			value.push({ email, mobile, last_name, first_name, checkedValues });
			setCheckStatus(value);
		} else {
			const objIndex = value.findIndex((obj) => email === obj.email);
			value[objIndex].checkedValues = checkedValues;
			setCheckStatus(value);
		}
	};

	const handleTeamShare = (e) => {
		e.preventDefault();
		setBdOpen(true);
		var bodyFormData = new FormData();
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('members', JSON.stringify(checkStatus));
		bodyFormData.append('template_id', id);
		bodyFormData.append('team_id', teamId);
		bodyFormData.append('type', 'document');
		fetch(`${url}/admin_git/digitalsignature/public/api/templateshare/team`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					axios
						.get(`${url}/admin_git/digitalsignature/public/api/templates/${id}`)
						.then((res1) => {
							if (res1.data.data[0].status === 'pending_update') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=pending_update&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then(() => {
										setBdOpen(false);
										setMemberVisible(false);
										getData();
										message.success(res.message);
									})
									.catch(() => {
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
							}
							if (res1.data.data[0].status === 'approved') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=approved&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then(() => {
										setBdOpen(false);
										setMemberVisible(false);
										getData();
										message.success(res.message);
									})
									.catch(() => {
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
							}
							if (res1.data.data[0].status === 'in_review') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then(() => {
										setBdOpen(false);
										setMemberVisible(false);
										getData();
										message.success(res.message);
									})
									.catch(() => {
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
							}
							if (res1.data.data[0].status === 'draft') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then(() => {
										setBdOpen(false);
										setMemberVisible(false);
										getData();
										message.success(res.message);
									})
									.catch(() => {
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
							}
						});
				} else {
					setBdOpen(false);
					message.error(res.message);
				}
				setCheckStatus([]);
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
				title='Select Team'
				visible={teamVisible}
				onCancel={() => {
					setTeamVisible(false);
				}}
				width={800}
				footer={[
					<Button
						key='back'
						style={{ backgroundColor: '#05C6FF' }}
						onClick={() => {
							setTeamVisible(false);
						}}
						type='primary'
					>
						Close
					</Button>,
				]}
			>
				{teamProcessing ? (
					<center>
						<Circle color='black' size={80} />
					</center>
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
						{teams.length === 0 ? (
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
											count={teams.length}
											rowsPerPage={teamsRowsPerPage}
											page={teamsPage}
											SelectProps={{
												inputProps: {
													'aria-label': 'rows per page',
												},
												native: true,
											}}
											onChangePage={handleChangeTeamsPage}
											onChangeRowsPerPage={handleChangeTeamsRowsPerPage}
										/>
									</tr>
									<tr>
										<th>Team Id</th>
										<th>Title</th>
										<th>Created At</th>
									</tr>
								</thead>
								<tbody>
									{(teamsRowsPerPage > 0
										? teams.slice(
												teamsPage * teamsRowsPerPage,
												teamsPage * teamsRowsPerPage + teamsRowsPerPage,
										  )
										: teams
									).map((data) => (
										<tr key={data.id}>
											<td>{data.id}</td>
											<td
												style={{ cursor: 'pointer' }}
												onClick={() => {
													setTeamId(data.id);
													getMembers(data.id);
													setTeamName(data.title);
													setTeamVisible(false);
													setMemberVisible(true);
												}}
											>
												{data.title}
											</td>
											<td>{data.created_at}</td>
										</tr>
									))}
								</tbody>
							</>
						)}
					</table>
				)}
			</Modal>
			<Modal
				title={`Share With ${teamName}`}
				visible={memberVisible}
				onCancel={() => {
					setMemberVisible(false);
					setCheckStatus([]);
				}}
				width={1000}
				footer={[
					<Button
						key='back'
						onClick={() => {
							setMemberVisible(false);
							setTeamVisible(true);
							setCheckStatus([]);
						}}
					>
						Back
					</Button>,
					<Button
						key='submit'
						type='primary'
						style={{ backgroundColor: '#05C6FF' }}
						// disabled={checkStatus === 0}
						onClick={(e) => {
							// setMemberVisible(false);
							// setTeamVisible(true);
							setCheckStatus([]);
							handleTeamShare(e);
						}}
					>
						Share
					</Button>,
				]}
			>
				{memberProcessing ? (
					<center>
						<Circle color='black' size={80} />
					</center>
				) : (
					<>
						<Button
							type='primary'
							onClick={() => {
								setMemberVisible(false);
								setAddVisible(true);
							}}
							style={{
								backgroundColor: '#05C6FF',
								marginRight: '10px',
								marginBottom: '10px',
								float: 'right',
							}}
						>
							Add a Member
						</Button>
						<TableContainer style={{ maxHeight: '330px' }}>
							<Table
								stickyHeader
								style={{
									borderCollapse: 'collapse',
									borderSpacing: '0',
									width: '100%',
									textAlign: 'center',
								}}
							>
								{members.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} align='center'>
											<Empty />
										</TableCell>
									</TableRow>
								) : (
									<>
										<TableHead>
											<TableRow>
												<TableCell align='center'>Member's Id</TableCell>
												<TableCell align='center'>Full Name</TableCell>
												<TableCell align='center'>Email</TableCell>
												<TableCell align='center'>Permissions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{members.map((data) => (
												<TableRow key={data.id}>
													<TableCell align='center'>{data.id}</TableCell>
													<TableCell align='center'>{`${data?.first_name} ${data?.last_name}`}</TableCell>
													<TableCell align='center'>{data?.email}</TableCell>
													<TableCell align='center'>
														<Checkbox.Group
															onChange={(checkedValues) =>
																handleTeamCheckbox(
																	checkedValues,
																	data.email,
																	data.mobile,
																	data.last_name,
																	data.first_name,
																)
															}
														>
															<Checkbox value={`can_review`}>Review</Checkbox>
															<Checkbox value={`can_edit`}>Edit</Checkbox>
														</Checkbox.Group>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</>
								)}
							</Table>
						</TableContainer>
					</>
				)}
			</Modal>
			<Modal
				title={`Add Member to ${teamName}`}
				visible={addVisible}
				onCancel={() => {
					setAddVisible(false);
				}}
				width={800}
				footer={[
					<Button
						key='back'
						onClick={() => {
							setAddVisible(false);
							setMemberVisible(true);
						}}
					>
						Back
					</Button>,
					<Button
						key='submit'
						htmlType='submit'
						disabled={
							!memberState.email ||
							!memberState.first_name ||
							!memberState.last_name ||
							!memberState.mobile
						}
						loading={addLoading}
						//style={{ backgroundColor: '#05C6FF', color: 'white' }}
						onClick={(e) => {
							handleMemberSubmit(e);
						}}
						type='primary'
					>
						Submit
					</Button>,
				]}
			>
				<form onSubmit={handleMemberSubmit}>
					<Row>
						<Col span={12}>
							<div className='anchovy-form-item'>
								<label className='validated-input'>
									First Name
									<input
										className='input-group'
										value={memberState.first_name}
										name='first_name'
										onChange={handleMemberChange}
										type='text'
										required
									/>
								</label>
							</div>
						</Col>
						<Col span={12}>
							<div className='anchovy-form-item'>
								<label className='validated-input'>
									Last Name
									<input
										className='input-group'
										value={memberState.last_name}
										name='last_name'
										onChange={handleMemberChange}
										type='text'
										required
									/>
								</label>
							</div>
						</Col>
					</Row>
					<Row>
						<Col span={12}>
							<div className='anchovy-form-item'>
								<label className='validated-input'>
									Email
									<input
										className='input-group'
										value={memberState.email}
										name='email'
										onChange={handleMemberChange}
										type='email'
										required
									/>
								</label>
							</div>
						</Col>
						<Col span={12}>
							<div className='anchovy-form-item'>
								<label className='validated-input'>
									Mobile Number
									<input
										className='input-group'
										value={memberState.mobile}
										name='mobile'
										onChange={handleMemberChange}
										type='text'
										maxLength='10'
										required
									/>
								</label>
							</div>
						</Col>
					</Row>
				</form>
			</Modal>
			<div className='card'>
				<div className='template-box'>
					{processing ? (
						<BarLoader
							color='#ffffff'
							loading={processing}
							css={override}
							size={150}
							height={5}
							width={1100}
						/>
					) : templates.length === 0 ? (
						<Empty />
					) : (
						(rowsPerPage > 0
							? templates.slice(
									page * rowsPerPage,
									page * rowsPerPage + rowsPerPage,
							  )
							: templates
						).map((data, index) => (
							<div className='box-upper' key={index}>
								<div className='img-boxes' id='thumbnail__image'>
									<img
										src={process.env.PUBLIC_URL + '/assets/images/invoice.png'}
										alt=''
										className={designs === 'my_design' && 'thumb_image'}
										style={
											designs !== 'my_design'
												? { cursor: 'pointer' }
												: { cursor: 'default' }
										}
										onClick={() => {
											if (designs !== 'my_design') {
												fetchTemplate(data.id);
											}
										}}
									/>
									<div className='middle'>
										{designs === 'my_design' && (
											<Space size='large'>
												<Tooltip title='Share' placement='bottom'>
													<div
														onClick={() => {
															setId(data.id);
															getTeams();
															setTeamVisible(true);
														}}
														className='icon1'
													>
														<ShareOutlinedIcon />
													</div>
												</Tooltip>
												<Tooltip title='View' placement='bottom'>
													<div
														// onClick={() => setId(data.id)}
														className='icon2'
														onClick={() => fetchTemplate(data.id)}
													>
														<VisibilityOutlinedIcon />
													</div>
												</Tooltip>
											</Space>
										)}
									</div>
								</div>
								<div className='template-box-template'>
									<p
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
										}}
									>
										<span>{data.template_name}</span>
										<span>
											{data?.status === 'draft' ? (
												<Tag>Draft</Tag>
											) : data.status === 'in_review' ? (
												<Tag color='blue'>In Review</Tag>
											) : data.status === 'pending_update' ? (
												<Tag color='gold'>Pending For Update</Tag>
											) : data.status === 'approved' ? (
												<Tag color='lime'>Approved</Tag>
											) : (
												data.status === 'expired' && (
													<Tag color='red'>Expired</Tag>
												)
											)}
										</span>
									</p>
									{designs === 'my_design' ? (
										<p>
											<Space size='large'>
												<span>
													<PersonOutlineRoundedIcon
														style={{ fontSize: '25px' }}
													/>
													{data?.user_type}
												</span>
											</Space>
										</p>
									) : (
										<p>
											<span className='icons-table'>
												<i className='fas fa-check-circle'></i>{' '}
												{data.view_count}
											</span>{' '}
											<span className='icons-table'>
												<i
													className='fas fa-comment-dots
  '
												></i>{' '}
												3
											</span>{' '}
											<span className='icons-table'>
												<i className='fas fa-star'></i> 4.3
											</span>
										</p>
									)}
								</div>
							</div>
						))
					)}
				</div>
				<TablePagination
					rowsPerPageOptions={[5, 10, 15, { label: 'All', value: -1 }]}
					colSpan={3}
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
					onChangeRowsPerPage={handleChangeRowsPerPage}
				/>
			</div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</>
	);
};

export default ThumbnailView;
