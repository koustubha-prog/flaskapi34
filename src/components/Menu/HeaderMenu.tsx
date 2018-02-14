import * as React from "react"
import { connect, Dispatch } from "react-redux"
import { Menu, Icon, Image, Dropdown, MenuItemProps } from "semantic-ui-react"
import { translate } from "react-i18next"
import { Action, Store } from "redux"

import { requestLogout, changeLanguage } from "../../actions"

const apiLink = "/docs"
const spongeLink = "https://forums.spongepowered.org/t/" + 
	"web-api-provides-an-admin-panel-and-api-for-your-minecraft-server/15709"
const docsLink = "https://github.com/Valandur/Web-API/blob/master/docs/INDEX.md"
const issuesLink = "https://github.com/Valandur/admin-panel/issues"

export interface AppProps extends reactI18Next.InjectedTranslateProps {
	lang: string
	changeLanguage: (lang: string) => Dispatch<Action>
	requestLogout: () => Dispatch<Action>
	toggleSidebar?: (event: React.MouseEvent<HTMLElement>, data: MenuItemProps) => void
}

class HeaderMenu extends React.Component<AppProps> {

	render() {
		const _t = this.props.t

		return (
			<Menu fluid stackable size="small" style={{ marginBottom: 0 }}>
				<Menu.Item as="a" header style={{ minWidth: "259px" }}>
					<Image size="small" centered src="./img/logo.png" />
				</Menu.Item>

				<Menu.Item name="sidebar" onClick={this.props.toggleSidebar}>
					<Icon name="sidebar" size="large" />
				</Menu.Item>

				<Menu.Item>
					<Dropdown
						selection
						placeholder="Change language"
						options={[{
							text: "English",
							value: "en",
						}, {
							text: "Deutsch",
							value: "de",
						}, {
							"text": "русский",
							value: "ru",
						}]}
						value={this.props.lang}
						onChange={(e, data) => { if (typeof data.value === "string") { this.props.changeLanguage(data.value) }}}
					/>
				</Menu.Item>

				<Menu.Menu position="right">
					<Menu.Item>
						<a href={apiLink} target="_blank" rel="noopener noreferrer">
							<Icon name="external" />{_t("APILink")}
						</a>
					</Menu.Item>
					<Menu.Item>
						<a href={spongeLink} target="_blank" rel="noopener noreferrer">
							<Icon name="external" />{_t("SpongeLink")}
						</a>
					</Menu.Item>
					<Menu.Item>
						<a href={docsLink} target="_blank" rel="noopener noreferrer">
							<Icon name="external" />{_t("DocsLink")}
						</a>
					</Menu.Item>
					<Menu.Item>
						<a href={issuesLink} target="_blank" rel="noopener noreferrer">
							<Icon name="external" />{_t("IssuesLink")}
						</a>
					</Menu.Item>

					<Menu.Item name="logout" onClick={this.props.requestLogout}>
						<Icon name="log out" /> {_t("Logout")}
					</Menu.Item>
				</Menu.Menu>
			</Menu>
		)
	}
}

const mapStateToProps = (state: Store<object>) => {
	return {
		lang: state.api.lang,
	}
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
	return {
		requestLogout: () => dispatch(requestLogout()),
		changeLanguage: (lang: string) => dispatch(changeLanguage(lang)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(translate("Menu")(HeaderMenu))