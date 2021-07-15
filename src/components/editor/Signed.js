import React, { useEffect, useState } from 'react';
import { Button, Collapse, Input, message } from 'antd';
import styled from 'styled-components';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DropzoneArea } from 'material-ui-dropzone';
import { instructions } from './instructions';
import { ListItem, ListItemText, List } from '@material-ui/core';
import disableBrowserBackButton from 'disable-browser-back-navigation';
const { Panel } = Collapse;
const useStyles = makeStyles((theme) =>
	createStyles({
		previewChip: {
			minWidth: 160,
			maxWidth: 210,
		},
	}),
);
const Signed = () => {
	useEffect(() => {
		disableBrowserBackButton();
	}, []);
	const classes = useStyles();
	const [uploadedFile, setUploadedFile] = useState([]);
	const [password, setPassword] = useState('');
	const handleChange = (file) => {
		setUploadedFile(file);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		message.success('pdf submit successfully');
		setUploadedFile([]);
		setPassword('');
	};
	return (
		<Container>
			<Collapse defaultActiveKey='2' accordion>
				<Panel header='Read the Instructions' key='1'>
					<div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
						<List dense={true}>
							{instructions.map((data) => (
								<ListItem key={data.key}>
									<ListItemText primary={data.value} />
								</ListItem>
							))}
						</List>
					</div>
				</Panel>
				<Panel header='Upload Signed File' key='2'>
					<DropzoneArea
						showPreviews={uploadedFile.length !== 0}
						filesLimit={1}
						dropzoneText='Drag and drop a file with Signature here or click'
						maxFileSize={3000000000}
						acceptedFiles={['application/pdf']}
						showPreviewsInDropzone={false}
						useChipsForPreview
						onChange={handleChange}
						previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
						previewChipProps={{ classes: { root: classes.previewChip } }}
						previewText='Uploaded File'
					/>
					<br />
					<Input.Password
						style={{ width: '20rem' }}
						placeholder='Enter Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<center>
						<ButtonContainer
							type='primary'
							htmlType='button'
							disabled={uploadedFile.length === 0}
							onClick={handleSubmit}
						>
							Upload
						</ButtonContainer>
					</center>
				</Panel>
			</Collapse>
		</Container>
	);
};

export default Signed;

const Container = styled.div`
	position: relative;
	width: 50%;
	margin: 0 auto;
	top: 50px;
`;

const ButtonContainer = styled(Button)`
	margin-top: 15px;
	width: 10rem;
`;
