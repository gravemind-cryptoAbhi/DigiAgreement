import React, { useEffect, useState } from 'react';
import HeadSide from './Utils/Head_Side';
import store from 'store';
import moment from 'moment';
import axios from 'axios';
import { url } from '../url/Url';
import { TablePagination } from '@material-ui/core';
import { Link } from 'react-router-dom';
import FadeLoader from 'react-spinners/FadeLoader';
import { css } from '@emotion/react';

const Billing = () => {
	const [history, setHistory] = useState([]);
	const user = store.get('digi_user')['plansubscription'];
	const remainingDays = moment(user['expiry_date']).diff(moment(), 'days');
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		getHistory();
	}, []);
	const getHistory = async () => {
		setLoading(true);
		const response = await axios.post(
			`${url}/admin_git/digitalsignature/public/api/userplanhistory?token=${store.get(
				'digi_token',
			)}`,
		);
		const transformData = response.data.data.map((data, index) => ({
			created_at: data.created_at.split(' ')[0],
			expiry_date: data.expiry_date,
			id: data.id,
			plan_id: data.plan_id,
			plan_name: data.plan.plan_name,
			price: data.plan.price,
			row_id: index + 1,
		}));
		transformData.sort(
			(a, b) =>
				new Date(...b.created_at.split('-')) -
				new Date(...a.created_at.split('-')),
		);
		setHistory(transformData);
		setLoading(false);
	};
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const emptyRows =
		rowsPerPage - Math.min(rowsPerPage, history.length - page * rowsPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};
	const override = css`
		display: block;
		margin: 0px auto;
	`;
	return (
		<>
			<div id='layout-wrapper'>
				<HeadSide heading='Billing' />
				{/* Left Sidebar End */}
				{/* ============================================================== */}
				{/* Start right Content here */}
				{/* ============================================================== */}
				<div className='main-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row'>
								<div className='col-sm-12'>
									<div className='billing-section'>
										<div>
											<h4>Current plan</h4>
											<h3>
												Business Monthly{' '}
												<Link to='/pricing'>Reactivate Subscription</Link>
											</h3>
										</div>
										<div className='billing-desc'>
											<div className='desc-left'>Payment</div>
											<div className='desc-right'>
												{user['plan']['price'] === 0 ? (
													<>
														<b>Free</b> Plan{' '}
													</>
												) : (
													<>
														<b>₹{user['plan']['price']}</b> per month{' '}
													</>
												)}
											</div>
										</div>
										<div className='billing-desc'>
											<div
												className='desc-left'
												style={{ visibility: 'hidden' }}
											>
												Next payment
											</div>
											<div className='desc-right'>
												<span style={{ color: 'red' }}>
													{remainingDays < 0
														? `Your Plan has been Expired`
														: `${remainingDays} days are left to expire your plan`}
												</span>
											</div>
										</div>
									</div>
									<div className='billing-section'>
										<div>
											<h4>Plan History</h4>
											<h3 />
										</div>
										{loading ? (
											<FadeLoader
												color='#05c6ff'
												loading={loading}
												css={override}
												size={150}
												// height={5}
												// width={1100}
											/>
										) : (
											<table
												id='datatable'
												className='table table-bordered dt-responsive nowrap'
												style={{
													borderCollapse: 'collapse',
													borderSpacing: '0',
													width: '100%',
												}}
											>
												<thead>
													<tr>
														<th>Plan Name</th>
														<th>Price</th>
														<th>Start Date</th>
														<th>Expiry Date</th>
													</tr>
												</thead>

												<tbody>
													{(rowsPerPage > 0
														? history.slice(
																page * rowsPerPage,
																page * rowsPerPage + rowsPerPage,
														  )
														: history
													).map((data) => (
														<tr key={data.row_id}>
															<td>{data.plan_name}</td>
															<td>{data.price}</td>
															<td>{data.created_at}</td>
															<td>{data.expiry_date}</td>
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
															count={history.length}
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
										)}
									</div>
								</div>
							</div>
						</div>{' '}
						{/* container-fluid */}
					</div>
					{/* End Page-content */}
				</div>
				{/* end main content*/}
			</div>
			<div className='rightbar-overlay' />
			{/* JAVASCRIPT */}
			{/* Peity chart*/}
			{/* Plugin Js*/}
		</>
	);
};

export default Billing;
