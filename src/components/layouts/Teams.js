import axios from 'axios';
import React, { useEffect, useState } from 'react';
import store from 'store';
import { useHistory } from 'react-router-dom';
import HeadSide from './Utils/Head_Side';
import { TablePagination } from '@material-ui/core';
import BarLoader from 'react-spinners/BarLoader';
import { css } from '@emotion/react';
import { Button, Empty, message } from 'antd';
import { url } from '../url/Url';

const Teams = () => {
	const [teams, setTeams] = useState([]);
	const [title, setTitle] = useState('');
	const [processing, setProcessing] = useState(false);
	const history = useHistory();
	const override = css`
		display: block;
		background-color: #05c6ff;
	`;

	useEffect(() => {
		(async function getTeams() {
			setProcessing(true);
			const response = await axios.get(
				'https://admin.webmuse.in/admin_git/digitalsignature/public/api/teams',
				{
					params: {
						token: store.get('digi_token'),
					},
				},
			);

			const transformData = response.data.data.data.map((data, index) => ({
				row_id: index + 1,
				created_at: data.created_at,
				id: data.id,
				teammember: data.teammember,
				title: data.title,
			}));
			setTeams(transformData);
			setProcessing(false);
		})();
	}, []);

	const getData = async () => {
		setProcessing(true);
		const response = await axios.get(
			`${url}/admin_git/digitalsignature/public/api/teams`,
			{
				params: {
					token: store.get('digi_token'),
				},
			},
		);

		const transformData = response.data.data.data.map((data, index) => ({
			row_id: index + 1,
			created_at: data.created_at,
			id: data.id,
			teammember: data.teammember,
			title: data.title,
		}));

		setTeams(transformData);
		setProcessing(false);
	};

	const handleAdd = (e) => {
		e.preventDefault();
		var bodyFormdata = new FormData();
		bodyFormdata.append('token', store.get('digi_token'));
		bodyFormdata.append('title', title);
		fetch(`${url}/admin_git/digitalsignature/public/api/teams/create`, {
			method: 'POST',
			body: bodyFormdata,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.error) {
					message.error(res.error.message);
				} else {
					message.success(res.message);
				}
				getData();
			})
			.catch((err) => {
				console.log(err);
			});
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

	return (
		<>
			<div id='layout-wrapper'>
				<HeadSide
					heading='My Teams'
					text='Add New Team'
					type='teams'
					page='teams'
				/>
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
									Add New Team
								</h5>
							</div>
							<div className='modal-body'>
								<form onSubmit={handleAdd}>
									<div className='anchovy-form-item'>
										<label htmlFor='ui-test-first-name'>
											Team Name
											<input
												id='ui-test-first-name'
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
									<br></br>
									<div className='popup-add-team-btn'>
										<Button
											data-kit='button'
											type='primary'
											onClick={handleAdd}
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
				<div className='main-content second-sidebar-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row second-sidebar'>
								<div className='col-sm-2'>
									<h4>My Teams</h4>
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
									) : teams.length === 0 ? (
										<Empty />
									) : (
										<div className='card team-table'>
											<div className='card-body'>
												<table
													id='datatable'
													className='table table-bordered dt-responsive nowrap'
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
																colSpan={4}
																tabIndex={-1}
																count={teams.length}
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
															<th>#</th>
															<th>Name</th>
															<th>Created At</th>
															<th>Action</th>
														</tr>
													</thead>
													<tbody>
														{(rowsPerPage > 0
															? teams.slice(
																	page * rowsPerPage,
																	page * rowsPerPage + rowsPerPage,
															  )
															: teams
														).map((data, index) => (
															<tr
																key={index}
																onClick={() =>
																	history.push(`/members/${data.id}`)
																}
																style={{ cursor: 'pointer' }}
															>
																<td>{data.row_id}</td>
																<td>{data.title}</td>
																<td>{data.created_at.split(' ')[0]}</td>
																<td>
																	<i className='fas fa-trash-alt'></i>
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
																colSpan={4}
																tabIndex={-1}
																count={teams.length}
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
						</div>{' '}
					</div>
				</div>
			</div>
			<div className='rightbar-overlay' />
		</>
	);
};

export default Teams;
