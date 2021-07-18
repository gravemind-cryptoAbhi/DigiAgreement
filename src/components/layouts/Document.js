import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../url/Url';
import store from 'store';
import HeadSide from './Utils/Head_Side';
import { useHistory } from 'react-router-dom';
import BarLoader from 'react-spinners/BarLoader';
import { css } from '@emotion/react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from '@material-ui/core';
import { Circle } from 'better-react-spinkit';
import {
	Button,
	Checkbox,
	Col,
	Empty,
	message,
	Modal,
	notification,
	Row,
	Space,
	Tag,
} from 'antd';
import html2PDF from 'jspdf-html2canvas';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import './drawer.css';
import moment from 'moment';
const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));
const Document = () => {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	const [documents, setDocuments] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [globalStatus, setGlobalStatus] = useState('all');
	const [status, setStatus] = useState('all');
	const user = store.get('digi_user')['plansubscription'];
	const remainingDays = moment(user['expiry_date']).diff(moment(), 'days');

	const history = useHistory();
	const override = css`
		display: block;
		background-color: #05c6ff;
	`;
	useEffect(() => {
		getData();
		// setInterval(async () => {
		// 	const response = await axios.get(
		// 		`${url}/admin_git/digitalsignature/public/api/templates`,
		// 		{
		// 			params: {
		// 				token: store.get('digi_token'),
		// 				type: 'document',
		// 			},
		// 		},
		// 	);
		// 	const transformData = response.data.data.map((data, index) => ({
		// 		file_name: data.file_name,
		// 		row_id: index + 1,
		// 		id: data.id,
		// 		template_name: data.template_name,
		// 		template_path: data.template_path,
		// 		updated_at: data.updated_at,
		// 		status: data.status,
		// 	}));
		// 	setDocuments(transformData);
		// }, 10000);
	}, []);

	function getData() {
		setProcessing(true);
		axios
			.get(
				`${url}/admin_git/digitalsignature/public/api/document/list?token=${store.get(
					'digi_token',
				)}&type=document&all=all`,
			)
			.then((res) => {
				const transformData = [
					...res.data.data.self.map((data, index) => ({
						file_name: data.file_name,
						row_id: index + 1,
						id: data.id,
						template_name: data.template_name || 'Random Document',
						template_path: data.template_path,
						updated_at: data.updated_at.split(' ')[0],
						status: data.status,
						author: `Md`,
					})),
					...res.data.data.shared.map((data, index) => ({
						file_name: data.template.file_name,
						row_id: index + 1,
						id: data.template.id,
						template_name: data.template.template_name || 'Random Document',
						template_path: data.template.template_path,
						updated_at: data.template.updated_at.split(' ')[0],
						status: data.template.status,
						author: `${data.template.author.first_name} ${data.template.author.last_name}`,
					})),
				];
				transformData.sort(
					(a, b) =>
						new Date(...b.updated_at.split('-')) -
						new Date(...a.updated_at.split('-')),
				);
				setDocuments(transformData);
				setProcessing(false);
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
	}

	const fetchDocument = (id) => {
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
					store.set('fileInfo', res.data.data[0]);
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
		}
	};

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const emptyRows =
		rowsPerPage - Math.min(rowsPerPage, documents.length - page * rowsPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const [id, setId] = useState('');
	const defaultState = {
		can_review: false,
		can_edit: false,
		can_fill: false,
		can_sign: false,
	};
	const defaultValues = {
		first_name: '',
		last_name: '',
		mobile: '',
		email: '',
	};
	const [state, setState] = useState(defaultState);
	const [values, setValues] = useState(defaultValues);
	const handleChange = (event) => {
		setState({ ...state, [event.target.name]: event.target.checked });
	};
	const handleValuesChange = (e) => {
		setValues({ ...values, [e.target.name]: e.target.value });
	};
	const handleSubmit = () => {
		if (values.email === '' && values.mobile === '') {
			message.error('Email or Mobile Field is required');
		} else {
			setBdOpen(true);
			var bodyFormData = new FormData();
			bodyFormData.append('token', store.get('digi_token'));
			bodyFormData.append('email', values.email);
			bodyFormData.append('first_name', values.first_name);
			bodyFormData.append('last_name', values.last_name);
			bodyFormData.append('mobile', values.mobile);
			bodyFormData.append('template_id', id);
			bodyFormData.append('type', 'document');
			bodyFormData.append('can_edit', state.can_edit ? 'yes' : '');
			bodyFormData.append('can_fill', state.can_fill ? 'yes' : '');
			bodyFormData.append('can_review', state.can_review ? 'yes' : '');
			bodyFormData.append('can_sign', state.can_sign ? 'yes' : '');
			fetch(`${url}/admin_git/digitalsignature/public/api/templateshare`, {
				method: 'POST',
				body: bodyFormData,
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						setBdOpen(false);
						message.success(res.message);
						fetch(
							`${url}/admin_git/digitalsignature/public/api/templates/${id}`,
							{
								method: 'GET',
							},
						)
							.then((res) => res.json())
							.then((res) => {
								if (res.data[0].status === 'pending_update') {
									fetch(
										`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=pending_update&guest_user_id=${
											store.get('digi_user')['id']
										}&token=${store.get('digi_token')}`,
										{
											method: 'POST',
										},
									)
										.then((res) => res.json())
										.then((res) => {
											if (globalStatus === 'created_by_me') {
												handleStatusChange('created_by_me');
											} else if (globalStatus === 'expiry_soon') {
												handleStatusChange('expiry_soon');
											} else if (globalStatus === 'all') {
												handleStatusChange('all');
											} else {
												handleStatusChange('pending_update');
											}
										})
										.catch((error) => console.log(error));
								}
								if (res.data[0].status === 'approved') {
									fetch(
										`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=approved&guest_user_id=${
											store.get('digi_user')['id']
										}&token=${store.get('digi_token')}`,
										{
											method: 'POST',
										},
									)
										.then((res) => res.json())
										.then((res) => {
											if (globalStatus === 'created_by_me') {
												handleStatusChange('created_by_me');
											} else if (globalStatus === 'expiry_soon') {
												handleStatusChange('expiry_soon');
											} else if (globalStatus === 'all') {
												handleStatusChange('all');
											} else {
												handleStatusChange('approved');
											}
										})
										.catch((error) => console.log(error));
								}
								if (res.data[0].status === 'in_progress') {
									fetch(
										`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_progress&guest_user_id=${
											store.get('digi_user')['id']
										}&token=${store.get('digi_token')}`,
										{
											method: 'POST',
										},
									)
										.then((res) => res.json())
										.then((res) => {
											if (globalStatus === 'created_by_me') {
												handleStatusChange('created_by_me');
											} else if (globalStatus === 'expiry_soon') {
												handleStatusChange('expiry_soon');
											} else if (globalStatus === 'all') {
												handleStatusChange('all');
											} else {
												handleStatusChange('in_progress');
											}
										})
										.catch((error) => console.log(error));
								}
								if (res.data[0].status === 'in_review') {
									fetch(
										`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
											store.get('digi_user')['id']
										}&token=${store.get('digi_token')}`,
										{
											method: 'POST',
										},
									)
										.then((res) => res.json())
										.then(() => {
											if (globalStatus === 'created_by_me') {
												handleStatusChange('created_by_me');
											} else if (globalStatus === 'expiry_soon') {
												handleStatusChange('expiry_soon');
											} else if (globalStatus === 'all') {
												handleStatusChange('all');
											} else {
												handleStatusChange('in_review');
											}
										})
										.catch((error) => console.log(error));
								}
								if (res.data[0].status === 'draft') {
									fetch(
										`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
											store.get('digi_user')['id']
										}&token=${store.get('digi_token')}`,
										{
											method: 'POST',
										},
									)
										.then((res) => res.json())
										.then((res) => {
											if (globalStatus === 'created_by_me') {
												handleStatusChange('created_by_me');
											} else if (globalStatus === 'expiry_soon') {
												handleStatusChange('expiry_soon');
											} else if (globalStatus === 'all') {
												handleStatusChange('all');
											} else {
												handleStatusChange('draft');
											}
										})
										.catch((error) => console.log(error));
								}
							});
					} else {
						message.error(res.message);
					}
					setState(defaultState);
					setValues(defaultValues);
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

	const handleDownload = (id) => {
		setBdOpen(true);
		axios
			.get(`${url}/admin_git/digitalsignature/public/api/templates/${id}`, {
				params: {
					token: store.get('digi_token'),
				},
			})
			.then((res) => {
				document.getElementById('pdf').style.display = 'block';
				document.getElementById('pdf').innerHTML = res.data.data[0].text;
				const input = document.getElementById('pdf');
				html2PDF(input, {
					//margin: 1,
					// html2canvas: { scale: 2 },
					jsPDF: { unit: 'in', format: 'a4' },
					imageType: 'image/png',
					imageQuality: 1,

					margin: {
						top: 0.4,
						right: 0.7,
						left: 0.7,
						bottom: 0.4,
					},

					output: `${res.data.data[0].template_name}.pdf`,
				});
				document.getElementById('pdf').style.display = 'none';
				setBdOpen(false);
				message.info('Wait a moment, PDF is being created for your download');
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

	const handleStatusChange = (status) => {
		setStatus(status);
		setGlobalStatus(status);

		setProcessing(true);
		if (status === 'all') {
			axios
				.get(
					`${url}/admin_git/digitalsignature/public/api/document/list?token=${store.get(
						'digi_token',
					)}&type=document&all=all`,
				)
				.then((res) => {
					const transformData = [
						...res.data.data.self.map((data, index) => ({
							file_name: data.file_name,
							row_id: index + 1,
							id: data.id,
							template_name: data.template_name || 'Random Document',
							template_path: data.template_path,
							updated_at: data.updated_at.split(' ')[0],
							status: data.status,
							author: `${data.author?.first_name} ${data.author?.last_name}`,
						})),
						...res.data.data.shared.map((data, index) => ({
							file_name: data.template.file_name,
							row_id: index + 1,
							id: data.template.id,
							template_name: data.template.template_name || 'Random Document',
							template_path: data.template.template_path,
							updated_at: data.template.updated_at.split(' ')[0],
							status: data.template.status,
							author: `${data.template.author?.first_name} ${data.template.author?.last_name}`,
						})),
					];
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setDocuments(transformData);
					setProcessing(false);
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
		} else if (status === 'expiry_soon') {
			axios
				.get(
					`${url}/admin_git/digitalsignature/public/api/document/list?token=${store.get(
						'digi_token',
					)}&type=document&expiry_soon=true`,
				)
				.then((res) => {
					const transformData = [
						...res.data.data.self.map((data, index) => ({
							file_name: data.file_name,
							row_id: index + 1,
							id: data.id,
							template_name: data.template_name || 'Random Document',
							template_path: data.template_path,
							updated_at: data.updated_at.split(' ')[0],
							status: data.status,
							author: `${data.author?.first_name} ${data.author?.last_name}`,
						})),
						...res.data.data.shared.map((data, index) => ({
							file_name: data.template.file_name,
							row_id: index + 1,
							id: data.template.id,
							template_name: data.template.template_name || 'Random Document',
							template_path: data.template.template_path,
							updated_at: data.template.updated_at.split(' ')[0],
							status: data.template.status,
							author: `${data.template.author?.first_name} ${data.template.author?.last_name}`,
						})),
					];
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setDocuments(transformData);
					setProcessing(false);
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
		} else if (status === 'created_by_me') {
			axios
				.get(
					`${url}/admin_git/digitalsignature/public/api/document/list?token=${store.get(
						'digi_token',
					)}&type=document&all=all`,
				)
				.then((res) => {
					const transformData = res.data.data.self.map((data, index) => ({
						file_name: data.file_name,
						row_id: index + 1,
						id: data.id,
						template_name: data.template_name || 'Random Document',
						template_path: data.template_path,
						updated_at: data.updated_at.split(' ')[0],
						status: data.status,
						author: `${data.author?.first_name} ${data.author?.last_name}`,
					}));
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setDocuments(transformData);
					setProcessing(false);
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
		} else {
			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/document/status?token=${store.get(
						'digi_token',
					)}&type=document&status=${status}`,
				)
				.then((res) => {
					const transformData = [
						...res.data.data.self.map((data, index) => ({
							file_name: data.file_name,
							row_id: index + 1,
							id: data.id,
							template_name: data.template_name || 'Random Document',
							template_path: data.template_path,
							updated_at: data.updated_at.split(' ')[0],
							status: data.status,
							author: `${data.author?.first_name} ${data.author?.last_name}`,
						})),
						...res.data.data.shared.map((data, index) => ({
							file_name: data.template.file_name,
							row_id: index + 1,
							id: data.template.id,
							template_name: data.template.template_name || 'Random Document',
							template_path: data.template.template_path,
							updated_at: data.template.updated_at.split(' ')[0],
							status: data.template.status,
							author: `${data.template.author?.first_name} ${data.template.author?.last_name}`,
						})),
					];
					transformData.sort(
						(a, b) =>
							new Date(...b.updated_at.split('-')) -
							new Date(...a.updated_at.split('-')),
					);
					setDocuments(transformData);
					setProcessing(false);
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
		}
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
					setBdOpen(false);
					message.success(res.message);
					setMemberVisible(false);
					fetch(
						`${url}/admin_git/digitalsignature/public/api/templates/${id}`,
						{
							method: 'GET',
						},
					)
						.then((res) => res.json())
						.then((res) => {
							if (res.data[0].status === 'pending_update') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=pending_update&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then((res) => res.json())
									.then((res) => {
										if (globalStatus === 'created_by_me') {
											handleStatusChange('created_by_me');
										} else if (globalStatus === 'expiry_soon') {
											handleStatusChange('expiry_soon');
										} else if (globalStatus === 'all') {
											handleStatusChange('all');
										} else {
											handleStatusChange('pending_update');
										}
									})
									.catch((error) => console.log(error));
							}
							if (res.data[0].status === 'approved') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=approved&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then((res) => res.json())
									.then((res) => {
										if (globalStatus === 'created_by_me') {
											handleStatusChange('created_by_me');
										} else if (globalStatus === 'expiry_soon') {
											handleStatusChange('expiry_soon');
										} else if (globalStatus === 'all') {
											handleStatusChange('all');
										} else {
											handleStatusChange('approved');
										}
									})
									.catch((error) => console.log(error));
							}
							if (res.data[0].status === 'in_progress') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_progress&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then((res) => res.json())
									.then((res) => {
										if (globalStatus === 'created_by_me') {
											handleStatusChange('created_by_me');
										} else if (globalStatus === 'expiry_soon') {
											handleStatusChange('expiry_soon');
										} else if (globalStatus === 'all') {
											handleStatusChange('all');
										} else {
											handleStatusChange('in_progress');
										}
									})
									.catch((error) => console.log(error));
							}
							if (res.data[0].status === 'in_review') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then((res) => res.json())
									.then(() => {
										if (globalStatus === 'created_by_me') {
											handleStatusChange('created_by_me');
										} else if (globalStatus === 'expiry_soon') {
											handleStatusChange('expiry_soon');
										} else if (globalStatus === 'all') {
											handleStatusChange('all');
										} else {
											handleStatusChange('in_review');
										}
									})
									.catch((error) => console.log(error));
							}
							if (res.data[0].status === 'draft') {
								fetch(
									`${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
										store.get('digi_user')['id']
									}&token=${store.get('digi_token')}`,
									{
										method: 'POST',
									},
								)
									.then((res) => res.json())
									.then((res) => {
										if (globalStatus === 'created_by_me') {
											handleStatusChange('created_by_me');
										} else if (globalStatus === 'expiry_soon') {
											handleStatusChange('expiry_soon');
										} else if (globalStatus === 'all') {
											handleStatusChange('all');
										} else {
											handleStatusChange('draft');
										}
									})
									.catch((error) => console.log(error));
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
						data-toggle='modal'
						data-target='.pop-share'
						type='primary'
					>
						Back
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
															<Checkbox value={`can_fill`}>Fill</Checkbox>
															<Checkbox value={`can_sign`}>Sign</Checkbox>
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
			<div
				className='modal fade pop-share'
				tabIndex={-1}
				role='dialog'
				aria-labelledby='mySmallModalLabel'
				aria-hidden='true'
			>
				<div className='modal-dialog modal-md'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title mt-0' id='mySmallModalLabel'>
								Share Document
							</h5>
						</div>
						<div className='modal-body'>
							<div className='share-content'>
								<p>
									<span>Recipients</span>
									<Button
										type='primary'
										icon={<TeamOutlined style={{ fontSize: '20px' }} />}
										style={{ backgroundColor: '#05C6FF' }}
										onClick={() => {
											getTeams();
											setTeamVisible(true);
										}}
										data-dismiss='modal'
									>
										Share with Team
									</Button>
								</p>
							</div>
							<div className='fisr-last-name'>
								<div className='form-group'>
									<input
										type='email'
										className='form-control'
										placeholder='Email'
										value={values.email}
										onChange={handleValuesChange}
										name='email'
									/>
								</div>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										placeholder='Mobile Number'
										value={values.mobile}
										onChange={handleValuesChange}
										name='mobile'
									/>
								</div>
							</div>
							<div className='fisr-last-name'>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										placeholder='First name'
										value={values.first_name}
										onChange={handleValuesChange}
										name='first_name'
										required
									/>
								</div>
								<div className='form-group'>
									<input
										type='text'
										className='form-control'
										placeholder='Last name'
										value={values.last_name}
										onChange={handleValuesChange}
										name='last_name'
										required
									/>
								</div>
							</div>
							<div className='actions-check'>
								<p>Action</p>
								<br></br>
								<input
									type='checkbox'
									checked={state.can_review}
									onChange={handleChange}
									name='can_review'
									id='can_review'
								/>{' '}
								<span>Review</span>
								<input
									type='checkbox'
									checked={state.can_edit}
									onChange={handleChange}
									name='can_edit'
									id='can_edit'
								/>{' '}
								<span>Edit</span>
								<input
									type='checkbox'
									checked={state.can_fill}
									onChange={handleChange}
									name='can_fill'
									id='can_fill'
								/>{' '}
								<span>Fill</span>
								<input
									type='checkbox'
									checked={state.can_sign}
									onChange={handleChange}
									name='can_sign'
									id='can_sign'
								/>{' '}
								<span>Sign</span>
							</div>
							<br></br>
							<button
								type='submit'
								className='btn btn-primary save-share'
								onClick={handleSubmit}
								data-dismiss='modal'
							>
								Save
							</button>
							<br></br>
						</div>
					</div>
					{/* /.modal-content */}
				</div>
				{/* /.modal-dialog */}
			</div>
			<div id='layout-wrapper'>
				<HeadSide page='document' />
				<div className='main-content second-sidebar-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row second-sidebar'>
								<div className='col-sm-2'>
									<h4>Document</h4>
									<h5
										onClick={() => handleStatusChange('all')}
										style={
											status === 'all'
												? { color: '#05c6ff', cursor: 'pointer' }
												: { color: 'black', cursor: 'pointer' }
										}
									>
										<i className='ti-file'></i> All
									</h5>
									<span>Filters</span>
									<ul className='iconic-list'>
										<li>
											<a
												style={
													status === 'created_by_me'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('created_by_me')}
											>
												<i className='fas fa-user'></i> Created by me
											</a>
										</li>
										<li>
											<a
												style={
													status === 'expiry_soon'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('expiry_soon')}
											>
												<i className='fas fa-stopwatch'></i> Expiring soon
											</a>
										</li>
									</ul>
									<span>Status</span>
									<ul className='doted-list'>
										<li id='draft'>
											<a
												style={
													status === 'draft'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('draft')}
											>
												Draft
											</a>
										</li>
										<li id='in_review'>
											<a
												style={
													status === 'in_review'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('in_review')}
											>
												In Review
											</a>
										</li>
										<li id='pending_update'>
											<a
												style={
													status === 'pending_update'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('pending_update')}
											>
												Pending for Update
											</a>
										</li>
										<li id='approved'>
											<a
												style={
													status === 'approved'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('approved')}
											>
												Approved
											</a>
										</li>
										<li id='in_progress'>
											<a
												style={
													status === 'in_progress'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('in_progress')}
											>
												In Progress
											</a>
										</li>
										<li id='completed'>
											<a
												style={
													status === 'completed'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('completed')}
											>
												Completed
											</a>
										</li>
										<li id='expired'>
											<a
												style={
													status === 'expired'
														? { color: '#05c6ff' }
														: { color: '#7a7a7a' }
												}
												onClick={() => handleStatusChange('expired')}
											>
												Expired
											</a>
										</li>
									</ul>
								</div>
								<div className='col-sm-10'>
									{processing ? (
										<>
											<BarLoader
												color='#ffffff'
												loading={processing}
												css={override}
												size={150}
												height={5}
												width={1100}
											/>
										</>
									) : documents.length === 0 ? (
										<Empty />
									) : (
										<div className='card'>
											<div className='card-body'>
												<table
													id='datatable'
													className='table dt-responsive nowrap'
													style={{
														borderCollapse: 'collapse',
														borderSpacing: '0',
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
																colSpan={6}
																tabIndex={-1}
																count={documents.length}
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
															<th>Document ID</th>
															<th>Title</th>
															<th>Author</th>
															<th>Status</th>
															<th>Last Modified</th>
															<th>Action</th>
														</tr>
													</thead>

													<tbody>
														{(rowsPerPage > 0
															? documents.slice(
																	page * rowsPerPage,
																	page * rowsPerPage + rowsPerPage,
															  )
															: documents
														).map((data, index) => (
															<tr key={index} className='table__row'>
																<td>{data?.id}</td>
																<td
																	onClick={() => fetchDocument(data.id)}
																	style={{ cursor: 'pointer' }}
																>
																	<Space size='small'>
																		<FileTextOutlined
																			style={{
																				fontSize: '19px',
																			}}
																		/>

																		<b className='table__title'>
																			{data?.template_name}
																		</b>
																	</Space>
																</td>
																<td>{data?.author}</td>
																<td>
																	{data.status === 'draft' ? (
																		<Tag>Draft</Tag>
																	) : data.status === 'in_review' ? (
																		<Tag color='blue'>In Review</Tag>
																	) : data.status === 'pending_update' ? (
																		<Tag color='gold'>Pending For Update</Tag>
																	) : data.status === 'approved' ? (
																		<Tag color='lime'>Approved</Tag>
																	) : data.status === 'completed' ? (
																		<Tag color='green'>Completed</Tag>
																	) : data.status === 'in_progress' ? (
																		<Tag color='purple'>In Progress</Tag>
																	) : (
																		data.status === 'expired' && (
																			<Tag color='red'>Expired</Tag>
																		)
																	)}
																</td>
																<td>{data?.updated_at}</td>
																<td>
																	<a
																		data-dismiss='modal'
																		data-toggle='modal'
																		data-target='.pop-share'
																		onClick={() => setId(data.id)}
																	>
																		<img
																			src={
																				process.env.PUBLIC_URL +
																				'/assets/images/share.png'
																			}
																			alt='share'
																		/>
																	</a>{' '}
																	<a>
																		<img
																			onClick={() => handleDownload(data.id)}
																			src={
																				process.env.PUBLIC_URL +
																				'/assets/images/download.png'
																			}
																			alt='download'
																		/>
																	</a>
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
																colSpan={6}
																tabIndex={-1}
																count={documents.length}
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
													</tbody>
												</table>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id='pdf' style={{ fontSize: '30px' }}></div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</>
	);
};

export default Document;
