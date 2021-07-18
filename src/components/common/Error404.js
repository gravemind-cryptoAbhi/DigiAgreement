import { Button, Result } from 'antd';
import React from 'react';
import { useHistory } from 'react-router-dom';
import store from 'store';

const Error404 = () => {
	const history = useHistory();
	return (
		<Result
			status='404'
			title='404'
			subTitle='Sorry, the page you visited does not exist.'
			extra={
				<Button
					type='primary'
					onClick={() =>
						store.get('digi_user')
							? history.push('/dashboard')
							: history.push('/')
					}
				>
					Back Home
				</Button>
			}
		/>
	);
};

export default Error404;
