import { definition, component, api, signal } from "@uesio/ui"
import SwiperUtility from "../../utilities/swiper/swiper"
import { SwiperOptions } from "swiper/types"
import { signals } from "./signals"

type ComponentDefinition = {
	wire?: string
	components?: definition.DefinitionList
	recordDisplay?: component.DisplayCondition[]
	onReachEnd?: signal.SignalDefinition[]
	onReachStart?: signal.SignalDefinition[]
	options?: SwiperOptions
}

const Component: definition.UC<ComponentDefinition> = (props) => {
	const { onReachStart, onReachEnd, options, recordDisplay } =
		props.definition

	const componentId = api.component.getComponentIdFromProps(props)

	const [activeIndex] = api.component.useState<string>(
		componentId,
		options?.initialSlide ?? 0
	)

	const { path, context, componentType } = props

	const wire = api.wire.useWire(props.definition.wire, context)

	const endHandler = api.signal.getHandler(onReachEnd, context)
	const startHandler = api.signal.getHandler(onReachStart, context)

	const itemContexts = component.useContextFilter<wire.WireRecord>(
		wire?.getData() || [],
		recordDisplay,
		(record, context) => {
			if (record && wire) {
				context = context.addRecordFrame({
					wire: wire.getId(),
					record: record.getId(),
					view: wire.getViewId(),
				})
			}
			return context
		},
		context
	)

	const slideNodes =
		itemContexts.map((recordContext, i) => (
			<component.Slot
				key={recordContext.item.getId() || i}
				definition={props.definition}
				listName="components"
				path={`${path}["slides"]["${i}"]`}
				context={recordContext.context}
				componentType={componentType}
			/>
		)) ?? []

	return (
		<SwiperUtility
			context={context}
			styleTokens={props.definition["uesio.styleTokens"]}
			variant={props.definition["uesio.variant"]}
			options={options}
			activeIndex={activeIndex}
			slides={slideNodes}
			startHandler={startHandler}
			endHandler={endHandler}
		/>
	)
}

Component.signals = signals

export default Component
