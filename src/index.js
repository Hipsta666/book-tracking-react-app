import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {} from 'react-router';

ReactDOM.render(
	<React.StrictMode>
		<Router>
			<Routes>
				<Route path='/*' element={<App />} />
			</Routes>
		</Router>
	</React.StrictMode>,
	document.getElementById('root')
);

reportWebVitals();
