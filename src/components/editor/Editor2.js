import React, { useEffect, useState } from 'react';
import 'froala-editor/js/froala_editor.pkgd.min.js';
import 'froala-editor/js/plugins.pkgd.min.js';
import 'froala-editor/css/froala_editor.min.css';
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/plugins/quick_insert.min.css';
import 'froala-editor/css/plugins/char_counter.min.css';
import 'froala-editor/css/plugins/code_view.min.css';
import 'froala-editor/css/plugins/colors.min.css';
import 'froala-editor/css/plugins/draggable.min.css';
import 'froala-editor/css/plugins/emoticons.min.css';
import 'froala-editor/css/plugins/file.min.css';
import 'froala-editor/css/plugins/fullscreen.min.css';
import 'froala-editor/css/plugins/help.min.css';
import 'froala-editor/css/plugins/image_manager.min.css';
import 'froala-editor/css/plugins/image.min.css';
import 'froala-editor/css/plugins/line_breaker.min.css';
import 'froala-editor/css/plugins/quick_insert.min.css';
import 'froala-editor/css/plugins/special_characters.min.css';
import 'froala-editor/css/plugins/table.min.css';
import 'froala-editor/css/plugins/video.min.css';
import 'froala-editor/css/themes/gray.min.css';
import FroalaEditor from 'react-froala-wysiwyg';
import Froalaeditor from 'froala-editor';
import store from 'store';
import './edit.css';
import { url } from '../url/Url';
import {
	Button,
	Comment,
	message,
	notification,
	Popconfirm,
	Space,
	Tooltip,
} from 'antd';
import disableBrowserBackButton from 'disable-browser-back-navigation';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import { ToggleButton } from '@material-ui/lab';
import html2PDF from 'jspdf-html2canvas';
import { CloseOutlined, CommentOutlined } from '@material-ui/icons';
import styled from 'styled-components';

const { confirm } = Modal;

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
}));
const Editor2 = () => {
	const classes = useStyles();
	const [bdOpen, setBdOpen] = useState(!true);

	useEffect(() => {
		disableBrowserBackButton();
	}, []);

	let template_data = store.get('template_data');
	const permissions = {
		can_edit: template_data['can_edit'] || false,
		can_fill: template_data['can_fill'] || false,
		can_review: template_data['can_review'] || false,
		can_sign: template_data['can_sign'] || false,
	};
	const [commentOpen, setCommentOpen] = useState(false);
	useEffect(() => {
		if (
			permissions.can_edit &&
			store.get('file_data')['status'] === 'pending_update'
		) {
			setCommentOpen(false);
		} else {
			setCommentOpen(!false);
		}
	}, [permissions.can_edit]);
	const [notAllowed, setNotAllowed] = useState(false);
	useEffect(() => {
		//Base Permissions start
		if (
			(store.get('file_data')['status'] === 'in_review' &&
				permissions.can_review) ||
			(store.get('file_data')['status'] === 'pending_update' &&
				permissions.can_edit) ||
			(store.get('file_data')['status'] === 'approved' &&
				permissions.can_fill) ||
			(store.get('file_data')['status'] === 'in_progress' &&
				permissions.can_sign)
		) {
			setNotAllowed(!true);
			document.getElementById('layout-wrapper').style.pointerEvents = 'all';
		}
		//Base Permissions ends

		//Not Allowed Conditions Starts
		else if (
			(store.get('file_data')['status'] === 'in_review' &&
				permissions.can_edit) ||
			(store.get('file_data')['status'] === 'pending_update' &&
				permissions.can_review) ||
			(store.get('file_data')['status'] === 'approved' &&
				permissions.can_review) ||
			(store.get('file_data')['status'] === 'in_progress' &&
				permissions.can_review)
		) {
			document.getElementById('layout-wrapper').style.pointerEvents = 'none';
			setNotAllowed(true);
		} else if (
			(store.get('file_data')['status'] === 'approved' &&
				permissions.can_edit) ||
			(store.get('file_data')['status'] === 'in_progress' &&
				permissions.can_edit)
		) {
			document.getElementById('layout-wrapper').style.pointerEvents = 'none';
			setNotAllowed(true);
		} else if (
			(store.get('file_data')['status'] === 'in_review' ||
				store.get('file_data')['status'] === 'pending_update' ||
				store.get('file_data')['status'] === 'in_progress') &&
			permissions.can_fill
		) {
			document.getElementById('layout-wrapper').style.pointerEvents = 'none';
			setNotAllowed(true);
		}

		//Not Allowed Conditions Ends
	}, [
		permissions.can_edit,
		permissions.can_fill,
		permissions.can_review,
		permissions.can_sign,
	]);
	const [comment, setComment] = useState('');
	const [allComments, setAllComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [signOpen, setSignOpen] = useState(false);

	const handleComment = (e) => {
		e.preventDefault();
		setLoading(true);
		var bodyFormData = new FormData();
		bodyFormData.append(
			'template_id',
			store.get('template_data')['template_id'],
		);
		bodyFormData.append('comment', comment);
		bodyFormData.append('token', store.get('digi_guest_token'));
		fetch(`${url}/admin_git/digitalsignature/public/api/commenttemplate`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				setComment('');
				message.success(res.message);
				setLoading(!true);
				getComments();
			})
			.catch((error) => console.log(error));
	};
	useEffect(() => {
		getComments();
	}, []);
	const getComments = async () => {
		var bodyFormData = new FormData();
		bodyFormData.append(
			'template_id',
			store.get('template_data')['template_id'],
		);
		const response = await fetch(
			`${url}/admin_git/digitalsignature/public/api/comments`,
			{
				method: 'POST',
				body: bodyFormData,
			},
		).then((res) => res.json());
		const transformData = response.data.map((data) => ({
			comment: data.comment,
			created_at: data.created_at,
			avatar: data.user[0].profile_pic,
			email: data.user[0].email,
		}));
		setAllComments(transformData);
	};
	const handleReviewStatus = (status) => {
		setBdOpen(true);
		var bodyFormData = new FormData();
		bodyFormData.append('id', store.get('template_data')['template_id']);
		bodyFormData.append('guest_user_id', store.get('template_data')['user_id']);
		bodyFormData.append('status', status);
		bodyFormData.append('token', store.get('digi_guest_token'));
		fetch(`${url}/admin_git/digitalsignature/public/api/statuschange`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				fetch(
					`${url}/admin_git/digitalsignature/public/api/templates/${
						store.get('template_data')['template_id']
					}`,
					{
						method: 'GET',
					},
				)
					.then((res) => res.json())
					.then((res) => {
						store.set('file_data', res.data[0]);
						window.location.reload();
						setBdOpen(!true);
					})
					.catch((error) => console.log(error));
				message.success(res.message);
			})
			.catch((error) => console.log(error));
	};

	const handleEditSave = () => {
		setBdOpen(true);
		var bodyFormData1 = new FormData();
		bodyFormData1.append('token', store.get('digi_guest_user'));
		bodyFormData1.append('id', store.get('template_data')['template_id']);
		bodyFormData1.append(
			'template_name',
			store.get('file_data')['template_name'],
		);
		bodyFormData1.append('type', store.get('file_data')['type']);
		bodyFormData1.append('doctype', store.get('file_data')['doctype']);
		bodyFormData1.append('text', store.get('htmlContent'));
		bodyFormData1.append('start_date', store.get('file_data')['start_date']);
		bodyFormData1.append('end_date', store.get('file_data')['end_date']);

		fetch(`${url}/admin_git/digitalsignature/public/api/templates/update`, {
			method: 'POST',
			body: bodyFormData1,
		});
		var bodyFormData = new FormData();
		bodyFormData.append('id', store.get('template_data')['template_id']);
		bodyFormData.append('guest_user_id', store.get('template_data')['user_id']);
		bodyFormData.append('status', 'in_review');
		bodyFormData.append('token', store.get('digi_guest_token'));
		fetch(`${url}/admin_git/digitalsignature/public/api/statuschange`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				fetch(
					`${url}/admin_git/digitalsignature/public/api/templates/${
						store.get('template_data')['template_id']
					}`,
					{
						method: 'GET',
					},
				)
					.then((res) => res.json())
					.then((res) => {
						store.set('file_data', res.data[0]);
						setBdOpen(!true);
						window.location.reload();
					})
					.catch((error) => console.log(error));
				message.success(res.message);
			})
			.catch((error) => console.log(error));
	};

	const handleFillSave = () => {
		setBdOpen(true);
		var bodyFormData1 = new FormData();
		bodyFormData1.append('token', store.get('digi_guest_user'));
		bodyFormData1.append('id', store.get('template_data')['template_id']);
		bodyFormData1.append(
			'template_name',
			store.get('file_data')['template_name'],
		);
		bodyFormData1.append('type', store.get('file_data')['type']);
		bodyFormData1.append('doctype', store.get('file_data')['doctype']);
		bodyFormData1.append('text', store.get('htmlContent'));
		bodyFormData1.append('start_date', store.get('file_data')['start_date']);
		bodyFormData1.append('end_date', store.get('file_data')['end_date']);

		fetch(`${url}/admin_git/digitalsignature/public/api/templates/update`, {
			method: 'POST',
			body: bodyFormData1,
		});
		var bodyFormData = new FormData();
		bodyFormData.append('id', store.get('template_data')['template_id']);
		bodyFormData.append('guest_user_id', store.get('template_data')['user_id']);
		bodyFormData.append('status', 'in_progress');
		bodyFormData.append('token', store.get('digi_guest_token'));
		fetch(`${url}/admin_git/digitalsignature/public/api/statuschange`, {
			method: 'POST',
			body: bodyFormData,
		})
			.then((res) => res.json())
			.then((res) => {
				fetch(
					`${url}/admin_git/digitalsignature/public/api/templates/${
						store.get('template_data')['template_id']
					}`,
					{
						method: 'GET',
					},
				)
					.then((res) => res.json())
					.then((res) => {
						store.set('file_data', res.data[0]);
						setBdOpen(!true);
						window.location.reload();
					})
					.catch((error) => console.log(error));
				message.success(res.message);
			})
			.catch((error) => console.log(error));
	};

	const handleSignStatus = (status) => {
		setBdOpen(true);
		axios
			.get(
				`${url}/admin_git/digitalsignature/public/api/templates/pdf/${
					store.get('template_data')['template_id']
				}`,
				{
					params: {
						token: store.get('digi_guest_token'),
						pdf_token: 'sdsdsd',
						redirect_url: 'http://localhost:3000/dashboard',
						x_postion: '478',
						y_postion: '813',
						height: '100',
						width: '250',
					},
				},
			)
			.then((res) => {
				setBdOpen(false);
				console.log('data: ', res);
				window.location.href = `https://sign.webmuse.in/sign-pdf?pdfName=${
					res.data.data.fileName
				}&&userName=${store.get('template_data')['first_name']} ${
					store.get('template_data')['first_name']
				}&&location=INDIA&&redirectUrl=https://test.digiagreement.com&&pageNumber=1&&encryptedPWd=123&&xCordinate=80&&yCordinate=80&&height=100&&width=250&&documentPath=/var/digiesign/`;
				// axios
				// 	.post(`https://sign.webmuse.in/sign-pdf`, {
				// 		params: {s
				// 			pdfName: res.data.data.filename,
				// 			documentPath: res.data.data.location,
				// 			userName: store.get('template_data')['first_name'],
				// 			location: 'INDIA',
				// 			redirectUrl: 'http://localhost:3000/editor2',
				// 			pageNumber: 1,
				// 			encryptedPWd: 'ESIGN123',
				// 			xCordinate: '809',
				// 			yCordinate: '472',
				// 			height: '130',
				// 			width: '150',
				// 		},
				// 	})
				// 	.then((res) => console.log(res.data))
				// 	.catch((err) => console.log(err));
			})
			.catch((err) => {
				setBdOpen(false);
				console.log(err);
			});
	};
	const fillConfirm = () => {
		confirm({
			title: 'Do You Want to Submit this Document?',
			icon: <ExclamationCircleOutlined />,
			onOk() {
				handleFillSave();
			},
		});
	};
	function showConfirm() {
		confirm({
			title: 'Do you Want to Save this Changes?',
			icon: <ExclamationCircleOutlined />,
			onOk() {
				handleEditSave();
			},
		});
	}
	function pendingConfirm() {
		//setStatus('pending_update');
		confirm({
			title: 'Are You sure this Document needs Changes?',
			icon: <ExclamationCircleOutlined />,
			onOk() {
				handleReviewStatus('pending_update');
			},
		});
	}
	function approvedConfirm() {
		// setStatus('approved');
		confirm({
			title: 'Do you Want to Approve this Document?',
			icon: <ExclamationCircleOutlined />,
			onOk() {
				handleReviewStatus('approved');
			},
		});
	}
	const history = useHistory();
	function signConfirm() {
		// setStatus('approved');
		// confirm({
		// 	title: 'Do you Want to Sign this Document?',
		// 	icon: <ExclamationCircleOutlined />,
		// 	autoFocusButton: null,
		// 	okText: 'Sign with DSC',
		// 	cancelText: 'Sign with NSDL(Adhaar)',
		// 	okType: 'default',
		// 	closable: true,
		// 	maskClosable: true,
		// 	//closeIcon: <ExclamationCircleOutlined />,
		// 	onCancel() {
		// 		alert('hello');
		// 	},
		// 	onOk() {
		// 		return (
		// 			<Popconfirm
		// 				placement='bottom'
		// 				title='Are you sure'
		// 				//onConfirm={confirm}
		// 				okText='Yes'
		// 				cancelText='No'
		// 			>
		// 				<Button>Bottom</Button>
		// 			</Popconfirm>
		// 		);
		// 		// handleSignStatus('completed');
		// 	},
		// });
		if (signValue === 'nsdl') {
			handleSignStatus('completed');
		} else {
			setBdOpen(true);
			axios
				.get(
					`${url}/admin_git/digitalsignature/public/api/templates/${
						store.get('template_data')['template_id']
					}`,
					{
						params: {
							token: store.get('digi_guest_token'),
						},
					},
				)
				.then(async (res) => {
					document.getElementById('pdf').style.display = 'block';
					document.getElementById('pdf').innerHTML = res.data.data[0].text;
					const input = document.getElementById('pdf');
					const result = await html2PDF(input, {
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
					if (result) {
						document.getElementById('pdf').style.display = 'none';
						setBdOpen(false);
						history.push('/signed');
					} else {
						document.getElementById('pdf').style.display = 'none';
						setBdOpen(false);
						message.error('Something Went Wrong');
					}
				})
				.catch((error) => {
					console.log(error);
					setBdOpen(false);
					message.error('Something Went Wrong');
				});
		}
	}

	useEffect(() => {
		(function getDate() {
			var dragCallback = function (e) {
				e.dataTransfer.setData('Text', this.id);
			};
			document
				.querySelector('#input')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#dropdown')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#check')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#sign')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#party')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#textarea')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#date')
				.addEventListener('dragstart', dragCallback);
			document
				.querySelector('#header')
				.addEventListener('dragstart', dragCallback);
		})();
	}, []);

	const [open, setOpen] = useState(false);
	const [id1, setId1] = useState('');
	const [inputOpen, setInputOpen] = useState(false);
	const [checkOpen, setCheckOpen] = useState(false);
	const [partyOpen, setPartyOpen] = useState(false);
	const [textareaOpen, setTextareaOpen] = useState(false);
	const [dateOpen, setDateOpen] = useState(false);
	const [headerOpen, setHeaderOpen] = useState(false);

	const handleOption = () => {
		let x = document.getElementById(id1);
		var option = document.createElement('option');
		option.text = document.getElementById('input1').value;
		x.add(option);

		var li = document.createElement('li');
		var t = document.createTextNode(option.text);
		li.appendChild(t);

		li.style.padding = '10px';
		li.style.borderBottom = '1px solid #eee';
		li.style.display = 'flex';
		li.style.justifyContent = 'space-between';
		li.style.alignItems = 'center';
		document.getElementById('opt').appendChild(li);
		document.getElementById('input1').value = '';

		var span = document.createElement('SPAN');
		var txt = document.createElement('button');
		txt.innerHTML = '&#9587';
		span.className = 'remove';
		span.appendChild(txt);
		li.appendChild(span);
		txt.style.background = 'white';
		txt.style.border = 'none';
		txt.style.color = '#e34e48';
		txt.style.fontSize = '15px';
		txt.style.fontWeight = '700';

		var close = document.getElementsByClassName('remove');
		for (var j = 0; j < close.length; j++) {
			close[j].onclick = function () {
				var div = this.parentElement;
				handleRemove(div.firstChild.nodeValue, id1);
				div.style.display = 'none';
			};
		}
	};

	const goCheck = (id) => {
		let x = document.getElementById(id);

		if (!document.getElementById('opt').firstChild) {
			for (var i = 0; i < x.length; i++) {
				var t = document.createTextNode(x.options[i].value);
				var li = document.createElement('li');
				li.appendChild(t);
				li.style.padding = '10px';
				li.style.borderBottom = '1px solid #eee';
				li.style.display = 'flex';
				li.style.justifyContent = 'space-between';
				li.style.alignItems = 'center';

				document.getElementById('opt').appendChild(li);
				var span = document.createElement('SPAN');
				var txt = document.createElement('button');
				txt.innerHTML = '&#9587';
				span.className = 'remove';
				span.appendChild(txt);
				li.appendChild(span);
				txt.style.background = 'white';
				txt.style.border = 'none';
				txt.style.color = '#e34e48';
				txt.style.fontSize = '15px';
				txt.style.fontWeight = '700';

				var close = document.getElementsByClassName('remove');
				for (var j = 0; j < close.length; j++) {
					close[j].onclick = function () {
						var div = this.parentElement;
						handleRemove(div.firstChild.nodeValue, id);
						div.style.display = 'none';
					};
				}
			}
		}
	};

	const handleSelected = (e) => {
		var selected = e.currentTarget.options.selectedIndex;
		for (var i = 0; i < e.currentTarget.options.length; i++) {
			if (selected === i) {
				e.currentTarget.options[i].setAttribute('selected', true);
			} else {
				e.currentTarget.options[i].removeAttribute('selected');
			}
		}
	};

	const handleRemove = (option, id) => {
		let x = document.getElementById(id);
		for (var i = 0; i < x.length; i++) {
			if (x.options[i].value === option) x.remove(i);
		}
	};

	const handleRequired = (e) => {
		if (e.target.checked) {
			document.getElementById(id1).required = true;
		} else {
			document.getElementById(id1).required = false;
		}
	};

	const checkRequired = (e) => {
		if (e.currentTarget.attributes.required !== undefined) {
			document.getElementById('dropdownRequired').setAttribute('checked', true);
		} else {
			document.getElementById('dropdownRequired').removeAttribute('checked');
		}
	};

	let inputID;
	function myFunction() {
		let el = document.getElementById(inputID);
		let val = el.value;
		el.setAttribute('value', val);
		document.getElementById(inputID).setAttribute('value', el.value);
	}
	function dragElement(elmnt, id) {
		//let elmnt = document.getElementById(id);
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		if (document.getElementById(id)) {
			/* if present, the header is where you move the DIV from:*/
			document.getElementById(id).onmousedown = dragMouseDown;
		} else {
			/* otherwise, move the DIV from anywhere inside the DIV:*/
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
			elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
		}

		function closeDragElement() {
			/* stop moving when mouse button is released:*/
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}

	const editorConfig = {
		documentReady: true,
		formEditButtons: [],
		formStyles: {},
		toolbarSticky: false,
		toolbarButtons:
			(permissions.can_fill &&
				store.get('file_data')['status'] === 'approved') ||
			(permissions.can_review &&
				store.get('file_data')['status'] === 'in_review' &&
				{}),
		attribution: false,
		imageUpload: true,
		imageUploadURL: `${url}/admin_git/digitalsignature/public/api/templates/images`,
		imageUploadParam: 'img',
		imageUploadParams: {
			token: store.get('digi_guest_token'),
		},
		imageMove: true,
		events: {
			click: function (e) {
				var editor = this;
				if (e.currentTarget.id[0] === 'd') {
					setInputOpen(false);
					setOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setOpen(true);
						goCheck(e.currentTarget.id);
						checkRequired(e);
					}
					setCheckOpen(false);
					setTextareaOpen(false);
					setPartyOpen(false);
					setDateOpen(false);
					setHeaderOpen(false);
					setId1(e.currentTarget.id);
					handleSelected(e);
				} else {
					setOpen(false);
					store.set('htmlContent', editor.html.get());
				}
				if (e.currentTarget.id[0] === 'i') {
					setOpen(false);
					setInputOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setInputOpen(true);
						checkRequired(e);
					}
					setCheckOpen(false);
					setTextareaOpen(false);
					setPartyOpen(false);
					setHeaderOpen(false);
					setDateOpen(false);
					setId1(e.currentTarget.id);
				} else {
					setInputOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.currentTarget.id[0] === 'c') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setCheckOpen(true);
						checkRequired(e);
					}

					setTextareaOpen(false);
					setPartyOpen(false);
					setDateOpen(false);
					setHeaderOpen(false);
					setId1(e.currentTarget.id);
				} else {
					setCheckOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.currentTarget.id[0] === 'p') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					setTextareaOpen(false);
					setPartyOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setPartyOpen(true);
						checkRequired(e);
					}
					setHeaderOpen(false);
					setDateOpen(false);
					setId1(e.currentTarget.id);
					checkRequired(e);
				} else {
					setPartyOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.currentTarget.id[0] === 't') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					setTextareaOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setTextareaOpen(true);
						checkRequired(e);
					}
					setPartyOpen(false);
					setHeaderOpen(false);
					setDateOpen(false);
					setId1(e.currentTarget.id);
					checkRequired(e);
				} else {
					setTextareaOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}

				if (e.currentTarget.id[0] === 'z') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					setTextareaOpen(false);
					setPartyOpen(false);
					setDateOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setDateOpen(true);
						checkRequired(e);
					}

					setHeaderOpen(false);
					setId1(e.currentTarget.id);
				} else {
					setDateOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.currentTarget.id[0] === 'h') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					setTextareaOpen(false);
					setPartyOpen(false);
					setDateOpen(false);
					setHeaderOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setHeaderOpen(true);
					}
					setId1(e.currentTarget.id);
				} else {
					setHeaderOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.currentTarget.id[0] === 's') {
					setInputOpen(false);
					setOpen(false);
					setCheckOpen(false);
					setSignOpen(false);
					if (
						permissions.can_edit &&
						store.get('file_data')['status'] === 'pending_update'
					) {
						setSignOpen(true);
					}
					setTextareaOpen(false);
					setPartyOpen(false);
					setDateOpen(false);
					setHeaderOpen(false);
					setId1(e.currentTarget.id);
					dragElement(
						document.getElementById(e.currentTarget.parentElement.id),
						e.currentTarget.id,
					);
				} else {
					setSignOpen(false);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (e.target.localName === 'input') {
					inputID = e.target.id;
					document
						.getElementById(inputID)
						.addEventListener('change', myFunction);
				}
			},
			contentChanged: function (e) {
				var editor = this;
				store.set('htmlContent', editor.html.get());
				//handleAutoSave();
			},
			keyup: function (e) {
				if (e.currentTarget.id[0] === 'i') {
					document
						.getElementById(e.currentTarget.id)
						.setAttribute('value', e.currentTarget.value);
				}
				if (e.currentTarget.id[0] === 'p') {
					document
						.getElementById(e.currentTarget.id)
						.setAttribute('value', e.currentTarget.value);
				}
				if (e.currentTarget.id[0] === 't') {
					document
						.getElementById(e.currentTarget.id)
						.setAttribute('value', e.currentTarget.value);
				}
			},

			initialized: function () {
				var editor = this;
				if (
					permissions.can_review &&
					store.get('file_data')['status'] === 'in_review'
				) {
					editor.edit.off();
				} else {
					editor.edit.on();
				}

				if (store.get('file_data')) {
					editor.html.set(store.get('file_data')['text']);
					store.set('htmlContent', editor.html.get());
					//handleAutoSave();
				}
				if (store.get('htmlContent')) {
					editor.html.set(store.get('htmlContent'));
				}
				editor.events.on(
					'drop',
					function (dropEvent) {
						editor.markers.insertAtPoint(dropEvent.originalEvent);
						var $marker = editor.$el.find('.fr-marker');
						$marker.replaceWith(Froalaeditor.MARKERS);
						editor.selection.restore();
						if (!editor.undo.canDo()) editor.undo.saveStep();
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'input'
						) {
							editor.html.insert(
								`
                  <input type="text" id="i${Math.random()}" class="inp">
                `,
							);
						}

						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') ===
							'dropdown'
						) {
							editor.html.insert(`
                
                    <select id="d${Math.random()}" class="select">
                    </select>
                    
                    `);
						}

						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'check'
						) {
							editor.html.insert(
								`<input id="c${Math.random()}" type="checkbox">`,
							);
						}
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'sign'
						) {
							const val = `s${Math.random()}`;
							editor.html.insert(
								`
                  <div id="${val}" style="position: absolute;z-index: 9;text-align: center;border: 1px solid black;">
										<canvas id="${val}header" style="cursor: move;"></canvas>
									</div>
                `,
							);
						}
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'party'
						) {
							editor.html.insert(`
								<form class="">
									<input type="text" id="pfname${Math.random()}" class="inp" placeholder='First Name'>
									<input type="text" id="pmname${Math.random()}" class="inp" placeholder='Middle Name'>
									<input type="text" id="plname${Math.random()}" class="inp" placeholder='Last Name'>
									<input type="date" id="pdob${Math.random()}" class="inp" placeholder='Date of Birth'>
									<input type="number" id="pnumber${Math.random()}" class="inp" placeholder='Mobile Number'>
									<input type="email" id="pmail${Math.random()}" class="inp" placeholder='Email Address'>
									<input type="text" id="psdw${Math.random()}" class="inp" placeholder='S/O,D/O,W/O'>
								</form>
							`);
						}
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') ===
							'textarea'
						) {
							editor.html.insert(`
								<input type="textarea" id="t${Math.random()}">
							`);
						}
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'date'
						) {
							editor.html.insert(`
								<input type="date" id="z${Math.random()}" class="inp">
							`);
						}
						if (
							dropEvent.originalEvent.dataTransfer.getData('Text') === 'header'
						) {
							editor.html.insert(`
								<div>
									<h1 id="h${Math.random()}"></h1>
								</div>
							`);
						}
						editor.undo.saveStep();
						dropEvent.preventDefault();
						dropEvent.stopPropagation();
						if (editor.core.hasFocus() && editor.browser.mozilla) {
							editor.events.disableBlur();
							setTimeout(function () {
								editor.$el.blur().focus();
								editor.events.enableBlur();
							}, 0);
						}

						return false;
					},
					true,
				);
			},
		},
	};

	const handleDelete = () => {
		if (id1[0] === 's') {
			setSignOpen(false);
			document.getElementById(id1).parentElement.remove();
		} else {
			document.getElementById(id1).remove();
			if (id1[0] === 'd') {
				setOpen(false);
			}
			if (id1[0] === 'i') {
				setInputOpen(false);
			}
			if (id1[0] === 'c') {
				setInputOpen(false);
			}
			if (id1[0] === 'p') {
				setPartyOpen(false);
			}
			if (id1[0] === 'z') {
				setDateOpen(false);
			}
			if (id1[0] === 't') {
				setTextareaOpen(false);
			}
			if (id1[0] === 'h') {
				setHeaderOpen(false);
			}
		}
	};

	const handleSave = () => {
		setOpen(false);
		setInputOpen(false);
		setCheckOpen(false);
	};

	useEffect(() => {
		if (notAllowed) {
			notification['error']({
				message: 'Not Allowed',
				description: "Sorry!! You Don't have Permission to Make Any Changes.",
			});
		}
	}, [notAllowed]);
	const [signVisible, setSignVisible] = useState(false);
	const [signValue, setSignValue] = useState('');

	return (
		<>
			<Modal
				title='Select Signature Type'
				visible={signVisible}
				onCancel={() => {
					setSignVisible(false);
					setSignValue('');
				}}
				footer={[
					<Button
						key='back'
						onClick={() => {
							setSignVisible(false);
							setSignValue('');
						}}
					>
						Back
					</Button>,
					<Button
						key='submit'
						onClick={() => {
							setSignVisible(false);
							signConfirm();
						}}
						type='primary'
						disabled={!signValue}
					>
						Submit
					</Button>,
				]}
			>
				<center>
					<Space size='large'>
						<ToggleButton
							value='check'
							selected={signValue === 'nsdl'}
							onChange={() => {
								setSignValue('nsdl');
							}}
						>
							<strong>
								<img
									style={{
										height: '45px',
										width: '45px',
										filter: 'grayscale(100%)',
									}}
									src={process.env.PUBLIC_URL + '/assets/images/aadhaar.png'}
									alt='usb'
								/>
								<br />
								Signature with <br />
								NSDL
							</strong>
						</ToggleButton>
						<ToggleButton
							value='check'
							selected={signValue === 'dsc'}
							onChange={() => {
								setSignValue('dsc');
							}}
						>
							<strong>
								<img
									style={{
										marginBottom: '15px',
										top: '8px',
										position: 'relative',
										height: '30px',
										width: '30px',
									}}
									src={process.env.PUBLIC_URL + '/assets/images/usb.png'}
									alt='usb'
								/>
								<br />
								Signature with <br />
								DSC
							</strong>
						</ToggleButton>
					</Space>
				</center>
			</Modal>
			<div id='layout-wrapper'>
				<header id='page-topbar'>
					<div className='navbar-header'>
						<div className='d-flex'>
							<Space size='middle'>
								<div className='navbar-brand-box'>
									<Link to='/editor2' className='logo logo-dark'>
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
													process.env.PUBLIC_URL +
													'/assets/images/logo-dark.png'
												}
												alt=''
												height='17'
											/>
										</span>
									</Link>

									<Link to='/editor2' className='logo logo-light'>
										<span className='logo-sm'>
											<img
												src={
													process.env.PUBLIC_URL + '/assets/images/logo-sm.png'
												}
												alt=''
												height='22'
											/>
										</span>
										<span className='logo-lg'>
											<img
												src={
													process.env.PUBLIC_URL +
													'/assets/images/logo-light.png'
												}
												alt=''
												height=''
											/>
										</span>
									</Link>
								</div>

								<div className='d-none d-sm-block'>
									<h4 className='font-size-18' style={{ marginTop: '19px' }}>
										{store.get('file_data') &&
											store.get('file_data')['template_name']}
									</h4>
								</div>
							</Space>
						</div>

						<div className='d-flex'>
							<div className='dropdown d-inline-block'>
								<span>{TextTrackList}</span>
								{(store.get('file_data')['status'] === 'pending_update' &&
									permissions.can_edit) ||
								(store.get('file_data')['status'] === 'approved' &&
									permissions.can_fill) ? (
									<button
										className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
										type='button'
										onClick={
											store.get('file_data')['status'] === 'pending_update' &&
											permissions.can_edit
												? showConfirm
												: store.get('file_data')['status'] === 'approved' &&
												  permissions.can_fill
												? fillConfirm
												: handleSave
										}
									>
										Save
									</button>
								) : undefined}
								{store.get('file_data')['status'] === 'in_review' &&
									permissions.can_review && (
										<>
											<button
												className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
												type='button'
												onClick={(e) => pendingConfirm()}
											>
												Pending Update
											</button>
											<button
												className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
												type='button'
												onClick={(e) => approvedConfirm()}
											>
												Approve
											</button>
										</>
									)}
								{store.get('file_data')['status'] === 'in_progress' &&
									permissions.can_sign && (
										<>
											<button
												className='btn create-new btn-primary dropdown-toggle waves-effect waves-light'
												type='button'
												onClick={(e) => setSignVisible(true)}
											>
												Sign
											</button>
										</>
									)}
							</div>

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
							</div>
						</div>
					</div>
				</header>

				<div className='main-content' style={{ marginLeft: '0px' }}>
					<div className='page-content editor-page'>
						<div className='container-fluid'>
							<div className='row'>
								<div
									className='col-sm-9'
									style={{
										position: 'fixed',
										height: '100%',
										background: '#efedec',
										overflowX: 'scroll',
										paddingLeft: '58px',
										paddingTop: '20px',
									}}
								>
									<div className='blank-layout'>
										<div className='form-group'>
											<FroalaEditor config={editorConfig} />
											<div></div>
										</div>
									</div>
								</div>
								{commentOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: 0 /* display: 'flex', */,
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '1',
										}}
									>
										<CommentHeader>
											<h5 className='cnt-hd'>Comments</h5>
											{store.get('file_data')['status'] === 'pending_update' &&
												permissions.can_edit && (
													<CloseOutlined
														onClick={() => setCommentOpen(false)}
														style={{ cursor: 'pointer' }}
													/>
												)}
										</CommentHeader>
										<div className='element-setting'>
											<form>
												<div className='form-group'>
													<textarea
														className='comment-box-form-grp'
														value={comment}
														onChange={(e) => setComment(e.target.value)}
													/>
													<Button
														type='primary'
														onClick={handleComment}
														//className='btn btn-primary'
														style={{ background: '#05C6FF', color: 'white' }}
														disabled={!comment}
														loading={loading}
													>
														Post
													</Button>
												</div>
											</form>
											<h5 className='cnt-hd'>Recent Comment</h5>
											{allComments.map((data, index) => (
												<Space>
													<Comment
														key={index}
														author={data.email}
														avatar={data.avatar}
														content={data.comment}
														datetime={
															<Tooltip
																title={moment(data.created_at).format(
																	'YYYY-MM-DD HH:mm:ss',
																)}
															>
																<span style={{ cursor: 'pointer' }}>
																	{moment(data.created_at).fromNow()}
																</span>
															</Tooltip>
														}
													/>
												</Space>
											))}
										</div>
									</div>
								)}
								``
								{open && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: 0,
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '99999999',
										}}
									>
										<h5 className='cnt-hd'>
											Dropdown{' '}
											<span>
												<CloseOutlined
													onClick={() => setOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label htmlFor='dropdownRequired' className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>
												</p>
											</div>
											<div className='form-group dropdown-add'>
												<label>Dropdown Items</label>
												<input
													type='text'
													className='form-control'
													id='input1'
													placeholder='Item add'
												/>
												<Link
													onClick={handleOption}
													style={{ cursor: 'pointer' }}
													className='add-item'
												>
													Add
												</Link>

												<span id='opt'></span>
											</div>

											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{inputOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setInputOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>{' '}
												</p>
											</div>

											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{partyOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setPartyOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>{' '}
												</p>
											</div>

											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{textareaOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setTextareaOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>{' '}
												</p>
											</div>

											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{dateOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setDateOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>{' '}
												</p>
											</div>

											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{headerOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setHeaderOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								{signOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setSignOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<a className='btn btn-primary delete-fld'>
													Delete Field
												</a>
											</Popconfirm>
										</div>
									</div>
								)}
								{checkOpen && (
									<div
										className='col-sm-3'
										style={{
											position: 'fixed',
											right: '0',
											height: '100%',
											background: '#fff',
											overflowX: 'scroll',
											zIndex: '9999',
										}}
									>
										<h5 className='cnt-hd'>
											Settings{' '}
											<span>
												<CloseOutlined
													onClick={() => setCheckOpen(false)}
													style={{ cursor: 'pointer' }}
												/>
											</span>
										</h5>
										<div className='element-setting'>
											<div className='form-group'>
												<label>Required</label>
												<p>
													This field is required{' '}
													<label className='switch'>
														<input
															type='checkbox'
															id='dropdownRequired'
															name='dropdownRequired'
															onClick={handleRequired}
														/>
														<span className='slider round'></span>
													</label>{' '}
												</p>
											</div>
											<Popconfirm
												title='Do you Want to Delete this Field?'
												onConfirm={handleDelete}
												okText='Yes'
												cancelText='No'
												placement='left'
											>
												<Link className='btn btn-primary delete-fld'>
													Delete Field
												</Link>
											</Popconfirm>
										</div>
									</div>
								)}
								<div
									className='col-sm-3'
									style={{
										position: 'fixed',
										right: 0,
										height: '100%',
										background: '#fff',
										overflowX: 'scroll',
									}}
								>
									<h5 className='cnt-hd'>
										Content{' '}
										{store.get('file_data')['status'] === 'pending_update' &&
											permissions.can_edit && (
												<Link
													style={{ float: 'right', fontSize: '15px' }}
													onClick={() => setCommentOpen(true)}
												>
													Comments <CommentOutlined />
												</Link>
											)}
									</h5>
									<p className='sb-cn fld-span'>FIELDS</p>
									<div className='editor-blocks'>
										<ul>
											<li
												draggable='true'
												id='input'
												style={{ cursor: 'move' }}
											>
												Text Field{' '}
												<span>
													<i className='fas fa-text-width' />
													<span />
												</span>
											</li>
											<li
												draggable='true'
												id='header'
												style={{ cursor: 'move' }}
											>
												Header{' '}
												<span>
													<i className='fas fa-file-image' />
													<span />
												</span>
											</li>
											<li
												draggable='true'
												id='dropdown'
												style={{ cursor: 'move' }}
											>
												Dropdown{' '}
												<span id='dropdown'>
													<i className='fas fa-table' />
													<span />
												</span>
											</li>
											<li draggable='true' id='sign' style={{ cursor: 'move' }}>
												Signature{' '}
												<span>
													<i className='fas fa-file-image' />
													<span />
												</span>
											</li>
											<li
												draggable='true'
												id='check'
												style={{ cursor: 'move' }}
											>
												Checkbox{' '}
												<span>
													<i className='fas fa-table' />
													<span />
												</span>
											</li>
											<li
												draggable='true'
												id='party'
												style={{ cursor: 'move' }}
											>
												1<sup>st</sup> Party{' '}
												<span>
													<i className='fas fa-file-image' />
													<span />
												</span>
											</li>
											<li
												draggable='true'
												id='textarea'
												style={{ cursor: 'move' }}
											>
												Textarea{' '}
												<span>
													<i className='fas fa-file-image' />
													<span />
												</span>
											</li>
											<li draggable='true' id='date' style={{ cursor: 'move' }}>
												Date{' '}
												<span>
													<i className='fas fa-file-image' />
													<span />
												</span>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='rightbar-overlay' />
			<div id='pdf'></div>
			<Backdrop className={classes.backdrop} open={bdOpen}>
				<CircularProgress color='inherit' />
			</Backdrop>
		</>
	);
};

export default Editor2;

const CommentHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;
