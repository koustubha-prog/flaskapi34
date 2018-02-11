import React, { Component } from "react"
import { connect } from "react-redux"
import {
	Header, Table, Label, Radio, Modal,
	Form, Button, Icon, Dropdown,
} from "semantic-ui-react"
import { translate, Trans } from "react-i18next"
import moment from "moment"
import _ from "lodash"

import CrateReward from "./CrateReward"
import { requestCatalog } from "../../../actions"
import { handleChange } from "../../../components/Util"
import ItemStack from "../../../components/ItemStack"

import DataViewFunc from "../../../components/DataView"
const DataView = DataViewFunc("husky-crates/crate", "id")

const ITEM_TYPES = "item.ItemType"

class Crates extends Component {

	constructor(props) {
		super(props)

		this.state = {
			modal: false,
		}

		this.toggleModal = this.toggleModal.bind(this)
		this.renderRewards = this.renderRewards.bind(this)
		this.handleEdit = this.handleEdit.bind(this)
		this.handleChange = handleChange.bind(this, null);

		this.addReward = this.addReward.bind(this)
		this.addRewardObject = this.addRewardObject.bind(this)
		this.removeReward = this.removeReward.bind(this)
		this.removeRewardObject = this.removeRewardObject.bind(this)
		this.handleRewardChange = this.handleRewardChange.bind(this)
	}

	componentDidMount() {
		this.props.requestCatalog(ITEM_TYPES)
	}

	handleEdit(crate, view) {
		this.save = () => {
			view.save(crate, {
				name: this.state.name,
				type: this.state.type,
				free: this.state.free,
				freeDelay: this.state.freeDelay,
				rewards: this.state.rewards,
			})
			this.setState({
				crate: null,
				modal: false,
			})
		}

		this.setState({
			modal: true,
			crate: crate,
			name: crate ? crate.name : null,
			type: crate ? crate.type : null,
			free: crate ? crate.free : null,
			freeDelay: crate ? crate.freeDelay : null,
			rewards: crate ? _.map(crate.rewards, r => _.assign({}, r)) : null,
		})
	}

	toggleModal() {
		this.setState({
			modal: !this.state.modal
		});
	}

	handleRewardChange(reward, event, data) {
		handleChange((name, value) => {
			const newReward = _.assign({}, reward);
			_.set(newReward, name, value);

			this.setState({
				rewards: _.map(this.state.rewards, r => r === reward ? newReward : r)
			})
		}, event, data)
	}

	addReward() {
		this.setState({
			rewards: _.concat(this.state.rewards, {
				name: "",
				chance: 0,
				objects: [],
				displayItem: {
					type: {},
					quantity: 1,
				},
			}),
		})
	}

	removeReward(reward) {
		this.setState({
			rewards: _.filter(this.state.rewards, r => r !== reward)
		})
	}

	addRewardObject(reward, object) {
		console.log(reward, object);
		
		this.setState({
			rewards: _.map(this.state.rewards, r => {
				if (r !== reward) return r;
				return _.assign({}, reward, {
					objects: _.concat(reward.objects, object),
				})
			}),
		})
	}

	removeRewardObject(reward, index) {
		this.setState({
			rewards: _.map(this.state.rewards, r => {
				if (r !== reward) return r;
				return _.assign({}, reward, {
					objects: _.filter(reward.objects, (__, i) => i !== index),
				})
			}),
		})
	}

	render() {
		const _t = this.props.t

		return <div>
			<DataView
				canEdit canDelete
				icon="archive"
				title={_t("HuskyCrates")}
				filterTitle={_t("FilterCrates")}
				createTitle={_t("CreateCrate")}
				fields={{
					id: {
						label: _t("Id"),
						create: true,
						filter: true,
						required: true,
					},
					name: {
						label: _t("Name"),
						create: true,
						edit: true,
						filter: true,
						required: true,
					},
					type: {
						label: _t("Type"),
						create: true,
						edit: true,
						filter: true,
						required: true,
						options: this.props.crateTypes
					},
					free: {
						label: _t("Free"),
						view: (crate) => <div>
							<Icon
								color={crate.free ? "green" : "red"}
								name={crate.free ? "check" : "remove"}
							/>
							{crate.free ?
								<div>
									<Icon name="repeat" />
									{moment.duration(crate.freeDelay, "second").humanize()}
								</div>
							: null}
						</div>,
					},
					rewards: {
						label: _t("Rewards"),
						wide: true,
						view: this.renderRewards,
					},
				}}
				onEdit={this.handleEdit}
			/>

			{this.renderModal()}
		</div>
	}

	renderRewards(crate) {
		const tc = _.sumBy(crate.rewards, "chance")
		const fmt = chance => ((chance / tc) * 100).toFixed(3) + "%"

		return <Table compact size="small">
			<Table.Body>
				{_.map(crate.rewards, (reward, i) =>
					<Table.Row key={i}>
						<Table.Cell collapsing>{fmt(reward.chance)}</Table.Cell>
						<Table.Cell collapsing>{reward.name}</Table.Cell>
						<Table.Cell collapsing>
							{reward.shouldAnnounce && <Icon name="bullhorn" />}
						</Table.Cell>
						<Table.Cell>
							{_.map(reward.objects, (obj, i) => {
								if (obj.type === "COMMAND" && obj.command)
									return <Label key={i} color="blue">/{obj.command}</Label>
								if (obj.type === "ITEM" && obj.item)
									return <ItemStack key={i} item={obj.item} />
								return null;
							})}
						</Table.Cell>
					</Table.Row>
				)}
			</Table.Body>
		</Table>
	}

	renderModal() {
		let totalChance = _.sum(_.map(this.state.rewards, r => r.chance ? r.chance : 0));
		const format = chance => ((chance / totalChance) * 100).toFixed(3) + "%";

		const _t = this.props.t

		return <Modal open={this.state.modal} onClose={this.toggleModal} size="fullscreen">
			<Modal.Header>
				<Trans i18nKey="RewardsTitle" name={this.state.name}>
					Edit '{this.state.name}' crate
				</Trans>
			</Modal.Header>
			<Modal.Content>
				<Form>
					<Header>
						<Icon fitted name="info" /> {_t("General")}
					</Header>

					<Form.Group widths="equal">

						<Form.Input
							required fluid
							type="text"
							name="name"
							label={_t("Name")}
							placeholder={_t("Name")}
							onChange={this.handleChange}
							value={this.state.name}
						/>

						<Form.Field
							required fluid selection
							control={Dropdown}
							name="type"
							label={_t("Type")}
							placeholder={_t("Type")}
							onChange={this.handleChange}
							options={this.props.crateTypes}
							value={this.state.type}
						/>

					</Form.Group>

					<Form.Group widths="equal">
						
						<Form.Field
							toggle required 
							control={Radio}
							label={_t("IsFree")}
							checked={this.state.free}
							onClick={e => this.setState({ free: !this.state.free })}
						/>

						<Form.Input
							fluid
							type="number"
							name="freeDelay"
							labelPosition="right"
							label={_t("FreeDelay")}
							placeholder={_t("FreeDelay")}
							onChange={this.handleChange}
							value={this.state.freeDelay}
							disabled={!this.state.free}
						>
							<input />
							<Label>{moment.duration(this.state.freeDelay, "second").humanize()}</Label>
						</Form.Input>

					</Form.Group>

					<Header>
						<Icon fitted name="trophy" /> {_t("Rewards")}
					</Header>

					<Table size="small">
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>{_t("Chance")}</Table.HeaderCell>
								<Table.HeaderCell>{_t("Name")}</Table.HeaderCell>
								<Table.HeaderCell>{_t("DisplayItem")}</Table.HeaderCell>
								<Table.HeaderCell>{_t("Objects")}</Table.HeaderCell>
								<Table.HeaderCell>{_t("Actions")}</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{_.map(this.state.rewards, (reward, i) =>
								<CrateReward
									key={i}
									reward={reward}
									format={format}
									handleRewardChange={this.handleRewardChange}
									addRewardObject={this.addRewardObject}
									removeRewardObject={this.removeRewardObject}
									removeReward={this.removeReward}
									objectTypes={this.props.objectTypes}
									itemTypes={this.props.itemTypes}
									t={_t}
								/>
							)}
							<Table.Row>
								<Table.Cell colSpan="4" textAlign="center">
									<Button
										color="green"
										icon="plus" 
										content={_t("Add")}
										onClick={this.addReward}
									/>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button color="blue" onClick={this.save}>{_t("Save")}</Button>&nbsp;
				<Button onClick={this.toggleModal}>{_t("Cancel")}</Button>
			</Modal.Actions>
		</Modal>
	}
}

const mapStateToProps = (_state) => {
	return {
		itemTypes: _state.api.types[ITEM_TYPES],
		crateTypes: [{
			value: "Spinner",
			text: "Spinner",
		}, {
			value: "Roulette",
			text: "Roulette",
		}, {
			value: "Instant",
			text: "Instant",
		}, {
			value: "Simple",
			text: "Simple"
		}],
		objectTypes: [{
			value: "ITEM",
			text: "Item",
		}, {
			value: "COMMAND",
			text: "Command",
		}]
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		requestCatalog: type => dispatch(requestCatalog(type)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(
	translate("Integrations.HuskyCrates")(Crates)
);
