/* eslint-disable jsx-a11y/anchor-is-valid */
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import ListView from './ListView';
import ThumbnailView from './ThumbnailView';
import HeadSide from './Utils/Head_Side';
import { AppstoreFilled, UnorderedListOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
const Template = () => {
	const [view, setView] = useState('list');
	const [designs, setDesigns] = useState('all');
	const [alignment, setAlignment] = React.useState('left');

	const handleAlignment = (event, newAlignment) => {
		setAlignment(newAlignment);
	};
	return (
		<>
			<HeadSide heading='All' page='template' />
			<div id='layout-wrapper'>
				<div className='main-content second-sidebar-content'>
					<div className='page-content'>
						<div className='container-fluid'>
							<div className='row second-sidebar'>
								<div className='col-sm-2'>
									<h4>
										<strong>Templates</strong>
									</h4>
									<h5
										onClick={() => setDesigns('all')}
										style={
											designs === 'all'
												? { color: '#05C6FF', cursor: 'pointer' }
												: { color: 'black', cursor: 'pointer' }
										}
									>
										<i className='ti-file'></i> Global
									</h5>
									<h5
										onClick={() => setDesigns('my_design')}
										style={
											designs === 'my_design'
												? { color: '#05C6FF', cursor: 'pointer' }
												: { color: 'black', cursor: 'pointer' }
										}
									>
										<i className='ti-file'></i> My Templates
									</h5>
								</div>

								<div className='col-sm-10'>
									<center>
										<ToggleButtonGroup
											value={alignment}
											exclusive
											onChange={handleAlignment}
											size='small'
											style={{
												textAlign: 'center',
												marginTop: '10px',
												marginBottom: '10px',
											}}
										>
											<Tooltip title='List View' placement='left'>
												<ToggleButton
													onClick={() => setView('list')}
													value='left'
													style={
														view === 'list'
															? {
																	backgroundColor: '#05C6FF',
																	color: 'white',
																	cursor: 'pointer',
															  }
															: {
																	backgroundColor: '#fff',
																	color: 'gray',
																	cursor: 'pointer',
															  }
													}
												>
													<UnorderedListOutlined style={{ fontSize: '23px' }} />
												</ToggleButton>
											</Tooltip>
											<Tooltip title='Thumbnail View' placement='right'>
												<ToggleButton
													onClick={() => setView('thumbnail')}
													value='right'
													style={
														view === 'thumbnail'
															? {
																	backgroundColor: '#05C6FF',
																	color: 'white',
																	cursor: 'pointer',
															  }
															: {
																	backgroundColor: '#fff',
																	color: 'gray',
																	cursor: 'pointer',
															  }
													}
												>
													<AppstoreFilled style={{ fontSize: '23px' }} />
												</ToggleButton>
											</Tooltip>
										</ToggleButtonGroup>
									</center>
									{designs === 'my_design' ? (
										view === 'list' ? (
											<ListView designs='my_design' />
										) : (
											<ThumbnailView designs='my_design' />
										)
									) : view === 'list' ? (
										<ListView designs='all' />
									) : (
										<ThumbnailView designs='all' />
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='rightbar-overlay'></div>
		</>
	);
};

export default Template;
