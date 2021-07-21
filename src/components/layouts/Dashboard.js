/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import HeadSide from './Utils/Head_Side';
import disableBrowserBackButton from 'disable-browser-back-navigation';
import { loadStripe } from '@stripe/stripe-js';
import store from 'store';
import {
	Menu,
	Dropdown,
	Empty,
	message,
	Button,
	Skeleton,
	Space,
	Row,
	Col,
	Modal,
	Checkbox,
	Tag,
	Tabs,
	notification,
} from 'antd';
import { url } from '../url/Url';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import html2PDF from 'jspdf-html2canvas';
import {
	Backdrop,
	CircularProgress,
	Drawer,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
} from '@material-ui/core';
import { Circle } from 'better-react-spinkit';
import { makeStyles } from '@material-ui/core/styles';
import './drawer.css';
import { FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { token_request } from './Utils/TokenExpire';
import './Dashboard.css'
const { TabPane } = Tabs;

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 99999,
		color: '#fff',
	},
}));
function Dashboard() {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);
	let remainingDays =
		moment(store.get('digi_user')['plansubscription']['expiry_date'])?.diff(
			moment(),
			'days',
		) < 0
			? 0
			: 1;

	useEffect(() => {
		setTimeout(() => {
			disableBrowserBackButton();
		}, 3000);
	}, []);

	// useEffect(() => {
	// 	(async function isValid() {
	// 		const num = await isTokenValid();
	// 		if (!num) {
	// 			logout();
	// 		}
	// 	})();
	// }, []);

	const history = useHistory();
	useEffect(() => {
		const query = new URLSearchParams(window.location.search);
		if (query.get('session_id')) {
			if (store.get('plan_page')) {
				store.remove('plan_page');
			}
		} else {
			if (
				moment(store.get('digi_user')['plansubscription']['expiry_date'])?.diff(
					moment(),
					'days',
				) < 7
			) {
				if (!store.get('plan_page') || store.get('plan_page') !== 'no') {
					store.set('plan_page', 'yes');
					window.location.href = '/pricing';
				}
			}
		}
	}, [history]);
	let stripePromise = null;

	useEffect(() => {
		(async function stripePayment() {
			if (store.get('plan_id')) {
				setBdOpen(true);
				stripePromise = loadStripe(
					'pk_test_51IAs8hG1l2A7NrhSZNkBDc5ewd5WJjTft0Qjz3U86qmFqt2FPgqhwkfpmpOY4CMnlLupYgCJD61N1BdpHpBzjrww00teSpbjWe',
				);
				const stripe = await stripePromise;
				const response = await fetch(
					`${url}/admin_git/digitalsignature/public/api/stripsession?plan_id=${store.get(
						'plan_id',
					)}&token=${store.get('digi_token')}`,
					{
						method: 'POST',
					},
				);
				const session = await response.json();
				if (session) {
					store.remove('plan_id');
				}
				const result = await stripe.redirectToCheckout({
					sessionId: session.id,
				});
				setBdOpen(false);
				if (result.error) {
					message.error(result.error.message);
				}
			}
		})();
	}, [stripePromise]);

	useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);

		if (query.get('session_id')) {
			setBdOpen(true);
			if (store.get('notification')) {
				store.remove('notification');
				if (store.get('plan_page')) {
					store.remove('plan_page');
				}
				axios
					.get(`${url}/admin_git/digitalsignature/public/api/stripsucess`, {
						params: {
							token: store.get('digi_token'),
							session_id: query.get('session_id'),
						},
					})
					.then(() => {
						axios
							.post(
								`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${store.get(
									'digi_token',
								)}`,
							)
							.then((res) => {
								store.set('digi_user', res.data.data[0]);
								setBdOpen(false);
								message.success('Plan Added!!');
								history.push('/dashboard');
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
			}
		}

		if (query.get('canceled')) {
			message.error({
				content: 'Payment Unsuccessfull',
				className: 'custom-class',
				style: {
					zIndex: '99999',
				},
			});
			history.push('/dashboard');
		}
	}, [history]);

	// useEffect(() => {
	// 	if (!isTokenValid) {
	// 		logout();
	// 	} else {
	// 		axios
	// 			.post(
	// 				`${url}/admin_git/digitalsignature/public/api/usersdetail?token=${store.get(
	// 					'digi_token',
	// 				)}`,
	// 			)
	// 			.then((res) => {
	// 				//console.log(res.data.data);
	// 				store.set('digi_user', res.data.data[0]);
	// 			})
	// 			.catch((error) => console.log(error));
	// 	}
	// }, []);

	const [teamMembers, setTeamMembers] = useState([]);
	useEffect(() => {
		(function getTeamMembers() {
			axios
				.get(`${url}/admin_git/digitalsignature/public/api/teamsmember`, {
					params: { token: store.get('digi_token') },
				})
				.then((res) => {
					const transformData = res.data.data.map((data) => ({
						first_name: data.first_name,
						email: data.email,
						id: data.id,
						last_name: data.last_name,
					}));
					setTeamMembers(transformData);
				})
				.catch((err) => {
					if (err.response.status === 401) {
						setLoading(false);
						message.error('Session Timed Out..Kindly Login Again!!');
						store.clearAll();
						history.push('/login');
					} else {
						setLoading(false);
						message.error('Something Went Wrong');
						console.log(err);
					}
				});
		})();
	}, []);

	//Card Content Starts
	const [user, setUser] = useState(store.get('digi_user')['email']);
	const [loading, setLoading] = useState(false);
	const [dateType, setDateType] = useState('1week');
	const [templateCounts, setTemplateCounts] = useState(null);
	const t = [];
	const [startDate, setStartDate] = useState(
		moment().subtract(6, 'days').endOf('day').format('YYYY-MM-DD'),
	);
	const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

	const handleUser = (email) => {
		setUser(email);
	};
	const handleDateChange = (dateType) => {
		setDateType(dateType);
		if (dateType === '1week') {
			setStartDate(
				moment().subtract(6, 'days').endOf('day').format('YYYY-MM-DD'),
			);
			setEndDate(moment().format('YYYY-MM-DD'));
		}
		if (dateType === '1month') {
			setStartDate(
				moment().subtract(29, 'days').endOf('day').format('YYYY-MM-DD'),
			);
			setEndDate(moment().format('YYYY-MM-DD'));
		}
		if (dateType === '3month') {
			setStartDate(
				moment().subtract(89, 'days').endOf('day').format('YYYY-MM-DD'),
			);
			setEndDate(moment().format('YYYY-MM-DD'));
		}
		if (dateType === '1year') {
			setStartDate(
				moment().subtract(364, 'days').endOf('day').format('YYYY-MM-DD'),
			);
			setEndDate(moment().format('YYYY-MM-DD'));
		}
	};

	const [count, setCount] = useState(0);

	useEffect(() => {
		(function getCounts() {
			setLoading(true);
			var bodyFormData = new FormData();
			bodyFormData.append('token', store.get('digi_token'));
			bodyFormData.append('type', 'document');
			bodyFormData.append('start_date', startDate);
			bodyFormData.append('end_date', endDate);
			if (user !== store.get('digi_user')['email']) {
				bodyFormData.append('email', user);
			}
			axios
				.post(
					`${url}/admin_git/digitalsignature/public/api/templates/count`,
					bodyFormData,
				)
				.then((res) => {
					const transformData = res.data.data.map((data) => ({
						status: data.status,
						count: data.sts_cnt,
					}));
					transformData.forEach((data) => {
						if (data.status === 'pending_update') {
							t.pending_update = data.count;
						}
						if (data.status === 'approved') {
							t.approved = data.count;
						}
						if (data.status === 'draft') {
							t.draft = data.count;
						}
						if (data.status === 'in_review') {
							t.in_review = data.count;
						}
						if (data.status === 'in_progress') {
							t.in_progress = data.count;
						}
						if (data.status === 'completed') {
							t.completed = data.count;
						}
						if (data.status === 'expired') {
							t.expired = data.count;
						}
					});
					setLoading(false);
					setTemplateCounts(t);
				})
				.catch((err) => {
					if (err.response.status === 401) {
						setLoading(false);
						message.error('Session Timed Out..Kindly Login Again!!');
						store.clearAll();
						history.push('/login');
					} else {
						setLoading(false);
						message.error('Something Went Wrong');
						console.log(err);
					}
				});
		})();
	}, [user, dateType, count]);

	const [username, setUsername] = useState('');
	const menu = (
		<Menu>
			{teamMembers.length === 0 && <Menu.Item>No Data Ababababalable</Menu.Item>}
			{teamMembers.length !== 0 &&
				teamMembers.map((data) => {
					return (
						<Menu.Item
							key={data.id}
							onClick={() => {
								setUsername(`${data?.first_name} ${data?.last_name}`);
								handleUser(data.email);
							}}
						>
							{data?.first_name}
							{'  '}
							{data?.last_name}
							{'  '}
							{store.get('digi_user')['email'] === data.email && `(You)`}
						</Menu.Item>
					);
				})}
		</Menu>
	);
	//Card Content Ends

	const [drawer, setDrawer] = useState(!true);

	const toggleDrawer = (event) => {
		if (
			event.type === 'keydown' &&
			(event.key === 'Tab' || event.key === 'Shift')
		) {
			return;
		}

		setDrawer(false);
	};
	const [documents, setDocuments] = useState([]);

	const getDataWithStatus = async (status) => {
		setBdOpen(true);
		var bodyFormData = new FormData();
		bodyFormData.append('token', store.get('digi_token'));
		bodyFormData.append('type', 'document');
		bodyFormData.append('start_date', startDate);
		bodyFormData.append('end_date', endDate);
		bodyFormData.append('status', status);
		if (user !== store.get('digi_user')['email']) {
			bodyFormData.append('email', user);
		}

		axios
			.post(
				`${url}/admin_git/digitalsignature/public/api/templates/count/detail`,
				bodyFormData,
			)
			.then((res) => {
				const transformData = res.data.data.map((data, index) => ({
					file_name: data.file_name,
					row_id: index + 1,
					id: data.id,
					template_name: data.template_name,
					template_path: data.template_path,
					updated_at: data.updated_at.split(' ')[0],
					status: data.status,
				}));
				transformData.sort(
					(a, b) =>
						new Date(...b.updated_at.split('-')) -
						new Date(...a.updated_at.split('-')),
				);
				setDocuments(transformData);
				setBdOpen(!true);
				setDrawer(true);
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

	const fetchDocument = (id) => {
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
	};
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(3);

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
										.then(() => {
											getDataWithStatus('pending_update');
											setCount(count + 1);
										})
										.catch((error) => {
											console.log(error);
											setBdOpen(false);
											message.error('Something Went Wrong');
										});
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
										.then(() => {
											getDataWithStatus('approved');
											setCount(count + 1);
										})
										.catch((error) => {
											console.log(error);
											setBdOpen(false);
											message.error('Something Went Wrong');
										});
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
											getDataWithStatus('in_review');
											setCount(count + 1);
										})
										.catch((error) => {
											console.log(error);
											setBdOpen(false);
											message.error('Something Went Wrong');
										});
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
										.then(() => {
											getDataWithStatus('draft');
											setCount(count + 1);
										})
										.catch((error) => {
											console.log(error);
											setBdOpen(false);
											message.error('Something Went Wrong');
										});
								}
							});
					} else {
						setBdOpen(false);
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
						setState(defaultState);
						setValues(defaultValues);
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
				setDrawer(false);
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

	const handleTabChange = (newValue) => {
		if (newValue === '1') {
			handleDateChange('1week');
		} else if (newValue === '2') {
			handleDateChange('1month');
		} else if (newValue === '3') {
			handleDateChange('3month');
		} else if (newValue === '4') {
			handleDateChange('1year');
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
									.then(() => {
										getDataWithStatus('pending_update');
										setCount(count + 1);
									})
									.catch((error) => {
										console.log(error);
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
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
									.then(() => {
										getDataWithStatus('approved');
										setCount(count + 1);
									})
									.catch((error) => {
										console.log(error);
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
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
										getDataWithStatus('in_review');
										setCount(count + 1);
									})
									.catch((error) => {
										console.log(error);
										setBdOpen(false);
										message.error('Something Went Wrong');
									});
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
									.then(() => {
										getDataWithStatus('draft');
										setCount(count + 1);
									})
									.catch((error) => {
										console.log(error);
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
				<HeadSide
					heading={`Welcome ${store.get('digi_user')['first_name']}`}
					page='dashboard'
				/>
				<div className='main-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row align-items-center'>
								<div className='col-sm-6'>
									<div className='page-title-box'>
										<div className='dropdown'>
											<Dropdown overlay={menu} trigger={['click']}>
												<a
													style={{ color: 'black' }}
													onClick={(e) => e.preventDefault()}
												>
													{username === '' ? 'All team Members' : username}
													{'  '}
													<i
														className='fas fa-sort-down'
														style={{ position: 'relative', top: '-2px' }}
													></i>
												</a>
											</Dropdown>
										</div>
									</div>
								</div>

								<div className='col-sm-6'>
									<div className='float-right d-none d-md-block week-tabs'>
										<div className='tab'>
											<Tabs defaultActiveKey='1' onChange={handleTabChange}>
												<TabPane tab='1 week' key='1' />
												<TabPane tab='1 month' key='2' />
												<TabPane tab='3 month' key='3' />
												<TabPane tab='1 year' key='4' />
											</Tabs>
										</div>
									</div>
								</div>
							</div>

							<div className='Dash_main_content'>
								
								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('draft')}
									>
										<div className='status-box light-gray'>
											<p class='box-title'>Draft</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.draft
													? templateCounts.draft
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}

								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('in_review')}
									>
										<div className='status-box light-blue'>
											<p class='box-title'>in Review</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.in_review
													? templateCounts.in_review
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}

								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('pending_update')}
									>
										<div className='status-box light-yellow'>
											<p class='box-title'>Pending for Update</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.pending_update
													? templateCounts.pending_update
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}
								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('approved')}
									>
										<div className='status-box light-green'>
											<p class='box-title'>Approved</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.approved
													? templateCounts.approved
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}
								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('in_progress')}
									>
										<div className='status-box dark-blue'>
											<p class='box-title'>In Progress</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.in_progress
													? templateCounts.in_progress
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}
								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => getDataWithStatus('completed')}
									>
										<div className='status-box dark-green'>
											<p class='box-title'>Completed</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.completed
													? templateCounts.completed
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										<Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/>
									</div>
								)}
								{!loading ? (
									<div
										className='col-sm-2'
										onClick={() => {
											getDataWithStatus(true);
										}}
									>
										<div className='status-box dark-red'>
											<p class='box-title'>Expired</p>
											<p className='status-number'>
												{templateCounts === null
													? 0
													: templateCounts.expired
													? templateCounts.expired
													: 0}
											</p>
											<span>document</span>
											<p className='prices'>
												<i className='fas fa-rupee-sign'></i> 0.00
											</p>
										</div>
									</div>
								) : (
									<div className='col-sm-2'>
										{/* <Skeleton.Button
											active={true}
											style={{
												height: '160px',
												width: '213px',
												borderRadius: '5px',
											}}
										/> */}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id='pdf' style={{ fontSize: '30px' }}></div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>

			<Drawer anchor='bottom' open={drawer} onClose={toggleDrawer}>
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
									<td>Document ID</td>
									<td>Title</td>
									<td>Status</td>
									<td>Last Modified</td>
									<td>Action</td>
								</tr>
							</thead>
							<tbody>
								{documents.length === 0 ? (
									<tr>
										<td align='center' colSpan={5}>
											<Empty />
										</td>
									</tr>
								) : (
									(rowsPerPage > 0
										? documents.slice(
												page * rowsPerPage,
												page * rowsPerPage + rowsPerPage,
										  )
										: documents
									).map((data) => (
										<tr key={data.row_id}>
											<td>{data.id}</td>
											<td
												onClick={() => {
													setDrawer(false);
													if (remainingDays === 0) {
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
														console.log(data.id);
														fetchDocument(data.id);
													}
												}}
												style={{ cursor: 'pointer' }}
											>
												<Space size='small'>
													<FileTextOutlined
														style={{
															fontSize: '19px',
														}}
													/>

													<b>{data?.template_name}</b>
												</Space>
											</td>
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
													onClick={() => {
														setDrawer(false);
														setId(data.id);
													}}
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
									))
								)}
								{documents.length !== 0 && (
									<tr>
										<TablePagination
											rowsPerPageOptions={[
												3,
												5,
												7,
												{ label: 'All', value: -1 },
											]}
											//colSpan={3}
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
										/>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</Drawer>
		</>
	);
}

export default Dashboard;
