import { definition, component, api, signal } from "@uesio/ui"
import SwiperUtility from "../../utilities/swiper/swiper"
import { SwiperOptions } from "swiper/types"
import { signals } from "./signals"

type SlideDefinition = {
	components: definition.DefinitionList
}

type ComponentDefinition = {
	slides?: SlideDefinition[]
	onReachEnd?: signal.SignalDefinition[]
	onReachStart?: signal.SignalDefinition[]
	options?: SwiperOptions
}

const Component: definition.UC<ComponentDefinition> = (props) => {
	const { slides, onReachStart, onReachEnd, options } = props.definition

	const componentId = api.component.getComponentIdFromProps(props)

	const [activeIndex] = api.component.useState<string>(
		componentId,
		options?.initialSlide ?? 0
	)

	const { path, context, componentType } = props

	const endHandler = api.signal.getHandler(onReachEnd, context)
	const startHandler = api.signal.getHandler(onReachStart, context)

	const slideNodes =
		slides?.map((slide, index) => (
			<component.Slot
				definition={slide}
				listName="components"
				path={`${path}["slides"]["${index}"]`}
				key={index}
				context={context}
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
