import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Login from './components/accounts/Login';
import SignUp from './components/accounts/SignUp';
import Home from './components/layouts/Home';
import { LinkedInPopUp } from 'react-linkedin-login-oauth2';
import Dashboard from './components/layouts/Dashboard';
import Template from './components/layouts/Template';
import Document from './components/layouts/Document';
import Plans from './components/layouts/Plans';
import { PrivateRoute } from './components/common/PrivateRoute';
import Teams from './components/layouts/Teams';
import Profile from './components/layouts/Profile';
import Editor from './components/editor/Editor';
import Members from './components/layouts/Members';
import Loader from './components/accounts/Loader';
import Forgot from './components/accounts/Forgot';
import EditorOtp from './components/editor/EditorOtp';
import 'antd/dist/antd.css';
import OtpLoader from './components/editor/OtpLoader';
import Editor2 from './components/editor/Editor2';
import Error404 from './components/common/Error404';
import { WebSocketDemo } from './components/layouts/WebSocketDemo';
import PricingHome from './components/layouts/PricingHome';
import Billing from './components/layouts/Billing';
import Contact from './components/layouts/Contact';
import Signed from './components/editor/Signed';

const App = () => {
	return (
		<>
			<Router>
				<Switch>
					<Route path='/' exact component={Home} />
					<Route path='/login' exact component={Login} />
					<Route path='/signup' exact component={SignUp} />
					<PrivateRoute path='/dashboard' component={Dashboard} />
					<PrivateRoute path='/document' component={Document} />
					<PrivateRoute path='/template' component={Template} />
					<Route path='/plans' component={Plans} />
					<Route path='/a' component={Loader} />
					<Route path='/forgot' component={Forgot} />
					<Route exact path='/linkedin' component={LinkedInPopUp} />
					<PrivateRoute path='/teams' component={Teams} />
					<PrivateRoute path='/members/:id' component={Members} />
					<PrivateRoute path='/members' component={Members} />
					<PrivateRoute path='/profile' component={Profile} />
					<PrivateRoute path='/editor' component={Editor} />
					<PrivateRoute path='/pricing' component={PricingHome} />
					<Route path='/editorotp' component={EditorOtp} />
					<Route path='/otpsent' component={OtpLoader} />
					<Route path='/editor2' component={Editor2} />
					<Route path='/signed' component={Signed} />
					<Route path='/websocket' component={WebSocketDemo} />
					<Route path='/contact' component={Contact} />
					<PrivateRoute path='/billing' component={Billing} />
					<Route path='*' component={Error404} />
				</Switch>
			</Router>
		</>
	);
};

export default App;
