import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
	return (
		<div role='alert'>
			<p>Something went wrong:</p>
			<pre>{error.message}</pre>
			<button onClick={resetErrorBoundary}>Try again</button>
		</div>
	);
};

const Index = () => {
	return (
		<>
			<ErrorBoundary FallbackComponent={ErrorFallback}>
				<App />
			</ErrorBoundary>
		</>
	);
};
ReactDOM.render(<Index />, document.getElementById('root123'));
