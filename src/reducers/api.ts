import * as i18next from "i18next"
import * as _ from "lodash"

import { AppAction, TypeKeys } from "../actions"
import { CatalogType, CommandApi, InfoApi, PermissionApi, PlayerApi, PluginApi, RegistryApi, ServerApi,
	UserApi } from "../fetch"
import { CatalogTypeKeys, Lang, PermissionTree, Server } from "../types"

export interface ApiCollection {
	cmd: CommandApi
	info: InfoApi
	permission: PermissionApi
	player: PlayerApi
	plugin: PluginApi
	registry: RegistryApi
	server: ServerApi
	user: UserApi
}

function setupApis(basePath?: string, apiKey?: string): ApiCollection {
	const conf = { apiKey: apiKey, basePath: basePath + "/api/v5" }

	return {
		cmd: new CommandApi(conf),
		info: new InfoApi(conf),
		permission: new PermissionApi(conf),
		player: new PlayerApi(conf),
		plugin: new PluginApi(conf),
		registry: new RegistryApi(conf),
		server: new ServerApi(conf),
		user: new UserApi(conf),
	}
}

export interface ApiState {
	key?: string
	loggedIn: boolean
	loggingIn: boolean
	server: Server
	servers: Server[]
	servlets: {
		[x: string]: string
	}
	types: {
		[x in CatalogTypeKeys]?: CatalogType[]
	}
	lang: Lang
	permissions?: PermissionTree

	apis: ApiCollection
	version: 2,
}

let initialState: ApiState = {
	loggedIn: false,
	loggingIn: false,
	server: window.config.servers[0],
	servers: window.config.servers,
	servlets: {},
	types: {},
	lang: Lang.EN,

	apis: setupApis(window.config.servers[0].apiUrl),
	version: 2,
}

if (window.localStorage) {
	const str = window.localStorage.getItem("api")
	const prevApi: ApiState | undefined = str ? JSON.parse(str) : undefined
	if (prevApi && prevApi.version === initialState.version && prevApi.loggedIn) {
		initialState = _.assign({}, initialState, prevApi)
		// If the servers changed we need to reload them
		if (!_.isEqual(initialState.servers, window.config.servers)) {
			initialState.server = window.config.servers[0]
			initialState.servers = window.config.servers
		}
		initialState.apis = setupApis(prevApi.server.apiUrl, prevApi.key)
	}
}

export default (state = initialState, action: AppAction) => {

	switch (action.type) {
		case TypeKeys.CHANGE_SERVER:
			return _.assign({}, state, {
				server: action.server,
				apis: setupApis(action.server.apiUrl),
			})

		case TypeKeys.SERVLETS_RESPONSE:
			if (!action.ok) {
				return state
			}

			return _.assign({}, state, {
				servlets: action.servlets,
			})

		case TypeKeys.CHANGE_LANGUAGE:
			i18next.changeLanguage(action.lang)
			return _.assign({}, state, {
				lang: action.lang,
			})

		case TypeKeys.LOGIN_REQUEST:
			return _.assign({}, state, {
				loggingIn: true,
			})

		case TypeKeys.LOGIN_RESPONSE:
			if (action.error || !action.data) {
				return _.assign({}, state, {
					loggingIn: false,
					loggedIn: false,
					key: null,
					permissions: null,
					rateLimit: null,
				})
			}
			return _.assign({}, state, {
				loggingIn: false,
				loggedIn: true,
				key: action.data.key,
				permissions: action.data.permissions,
				rateLimit: action.data.rateLimit,
				apis: setupApis(state.server.apiUrl, action.data.key)
			})

		case TypeKeys.LOGOUT_REQUEST:
			return _.assign({}, state, {
				loggedIn: false,
				key: null,
				permissions: null,
				rateLimit: null,
			})

		case TypeKeys.CHECK_USER_RESPONSE:
			if (!action.ok) {
				return state
			}

			return _.assign({}, state, {
				permissions: action.data.permissions,
				rateLimit: action.data.rateLimit,
			})

		case TypeKeys.CATALOG_RESPONSE:
			return {
				...state,
				types: {
					...state.types,
					[action.class]: action.types.filter((t, i) => action.types.findIndex(otherT => otherT.id === t.id) === i),
				},
			}

		default:
			return state
	}
}