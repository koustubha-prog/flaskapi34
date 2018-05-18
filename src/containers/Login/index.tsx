import * as React from 'react';
import { translate } from 'react-i18next';
import { connect, Dispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
	Button,
	Dropdown,
	DropdownProps,
	Form,
	Grid,
	Image,
	Segment
} from 'semantic-ui-react';

import { AppAction, changeServer, requestLogin } from '../../actions';
import { setPreference } from '../../actions/preferences';
import { handleChange, HandleChangeFunc } from '../../components/Util';
import {
	AppState,
	Lang,
	langArray,
	PreferenceKey,
	Server,
	Theme,
	themesArray
} from '../../types';

const imageUrl = require('../../assets/logo.png');

interface StateProps {
	loggingIn: boolean;
	server?: Server;
	servers: Server[];
	lang: Lang;
	theme: Theme;
	path: string;
	ok: boolean;
}

interface Props extends StateProps, reactI18Next.InjectedTranslateProps {
	changeServer: (server: Server) => AppAction;
	onLoginClick: (username: string, password: string) => AppAction;
	setPref: (key: PreferenceKey, value: any) => AppAction;
}

interface OwnState {
	[key: string]: string;

	username: string;
	password: string;
}

class Login extends React.Component<Props, OwnState> {
	handleChange: HandleChangeFunc;

	constructor(props: Props) {
		super(props);

		this.state = {
			username: '',
			password: ''
		};

		this.handleChangeServer = this.handleChangeServer.bind(this);
		this.handleChange = handleChange.bind(this, this.handleChangeServer);
		this.handleLogin = this.handleLogin.bind(this);
	}

	handleChangeServer(key: string, value: string) {
		if (key === 'server') {
			const server = this.props.servers.find(s => s.apiUrl === value);
			if (server == null) {
				return;
			}
			this.props.changeServer(server);
		} else {
			this.setState({ [key]: value });
		}
	}

	handleLogin(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		this.props.onLoginClick(this.state.username, this.state.password);
	}

	render() {
		if (this.props.ok) {
			return (
				<Redirect to={{ pathname: '/', state: { from: this.props.path } }} />
			);
		}

		const _t = this.props.t;

		return (
			<Grid
				textAlign="center"
				style={{ height: '100vh' }}
				verticalAlign="middle"
			>
				<Grid.Column style={{ maxWidth: 450 }}>
					<Image size="medium" centered src={imageUrl} />

					<Form size="large" loading={this.props.loggingIn}>
						<Segment>
							{this.props.servers.length > 1 ? (
								<Form.Field
									fluid
									selection
									name="server"
									control={Dropdown}
									placeholder={_t('Server')}
									value={
										this.props.server ? this.props.server.apiUrl : undefined
									}
									onChange={this.handleChange}
									options={this.props.servers.map(s => ({
										value: s.apiUrl,
										text: s.name
									}))}
								/>
							) : null}

							<Form.Field
								selection
								control={Dropdown}
								placeholder={_t('ChangeTheme')}
								options={themesArray}
								value={this.props.theme}
								onChange={(e: Event, data: DropdownProps) =>
									this.props.setPref(PreferenceKey.theme, data.value)
								}
							/>

							<Form.Field
								selection
								control={Dropdown}
								placeholder={_t('ChangeLanguage')}
								options={langArray}
								value={this.props.lang}
								onChange={(e: Event, data: DropdownProps) =>
									this.props.setPref(PreferenceKey.lang, data.value)
								}
							/>

							<Form.Input
								fluid
								name="username"
								icon="user"
								iconPosition="left"
								placeholder={_t('Username')}
								value={this.state.username}
								onChange={this.handleChange}
							/>

							<Form.Input
								fluid
								name="password"
								icon="lock"
								iconPosition="left"
								placeholder={_t('Password')}
								type="password"
								value={this.state.password}
								onChange={this.handleChange}
							/>

							<Button fluid primary size="large" onClick={this.handleLogin}>
								{_t('Login')}
							</Button>
						</Segment>
					</Form>
				</Grid.Column>
			</Grid>
		);
	}
}

const mapStateToProps = (state: AppState): StateProps => {
	return {
		ok: state.api.loggedIn,
		lang: state.preferences.lang,
		theme: state.preferences.theme,
		loggingIn: state.api.loggingIn,
		server: state.api.server,
		servers: state.api.servers,

		path: state.router.location ? state.router.location.pathname : ''
	};
};

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
	return {
		onLoginClick: (username: string, password: string): AppAction =>
			dispatch(requestLogin(username, password)),
		changeServer: (server: Server): AppAction => dispatch(changeServer(server)),
		setPref: (key: PreferenceKey, value: any): AppAction =>
			dispatch(setPreference(key, value))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(
	translate('Login')(Login)
);
