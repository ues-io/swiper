import { definition, component, styles, api, signal } from "@uesio/ui"
import { useEffect, useRef } from "react"

import { register } from "swiper/element/bundle"
import { Swiper } from "swiper/types"
// register Swiper custom elements
register()

type SlideDefinition = {
	components: definition.DefinitionList
}

type SwiperElement = {
	swiper: Swiper
} & HTMLElement

type ComponentDefinition = {
	slides?: SlideDefinition[]
	onReachEnd?: signal.SignalDefinition[]
	onReachStart?: signal.SignalDefinition[]
	spaceBetween?: number
	slidesPerView?: number
	centeredSlides?: boolean
	effect?: string
	initialSlide?: number
	navigationEnabled?: boolean
	paginationEnabled?: boolean
	keyboardEnabled?: boolean
	paginationClickable?: boolean
}

interface SetActiveIndexSignal extends signal.SignalDefinition {
	index: string
}

const signals: Record<string, unknown> = {
	SET_ACTIVE_INDEX: {
		dispatcher: (state: unknown, signal: SetActiveIndexSignal) =>
			signal.index,
	},
	NEXT: {
		dispatcher: (state: number | undefined) => (state ? state + 1 : 1),
	},
	PREV: {
		dispatcher: (state: number | undefined) => (state ? state - 1 : 0),
	},
}

const StyleDefaults = {
	root: [],
}

const Component: definition.UC<ComponentDefinition> = (props) => {
	const swiperElRef = useRef<HTMLElement>(null)

	const classes = styles.useStyleTokens(StyleDefaults, props)

	const {
		slides,
		slidesPerView = 1,
		effect,
		onReachStart,
		spaceBetween,
		onReachEnd,
		initialSlide,
		centeredSlides,
		navigationEnabled = true,
		paginationEnabled = true,
		paginationClickable = true,
		keyboardEnabled = true,
	} = props.definition

	const componentId = api.component.getComponentIdFromProps(props)

	const [activeIndex] = api.component.useState<string>(
		componentId,
		initialSlide
	)

	const { path, context, componentType } = props

	const routePath = context.getRoute()?.path

	const endHandler = api.signal.getHandler(onReachEnd, context)
	const startHandler = api.signal.getHandler(onReachStart, context)

	const handleDragEnd = (e: CustomEvent) => {
		const swiper = e.detail[0] as Swiper
		const event = e.detail[1] as TouchEvent
		const slide = event.target as HTMLElement
		const closest = slide.closest("swiper-slide") as HTMLElement
		if (!closest) return null
		const parent = closest.parentElement
		if (!parent) return null
		const index = Array.from(parent.children).indexOf(closest)
		if (
			swiper.swipeDirection === "next" &&
			index === swiper.slides.length - 1
		) {
			endHandler?.()
		}
		if (swiper.swipeDirection === "prev" && index === 0) {
			startHandler?.()
		}
	}

	useEffect(() => {
		swiperElRef.current?.addEventListener("swipertouchend", handleDragEnd)
		return () => {
			swiperElRef.current?.removeEventListener(
				"swipertouchend",
				handleDragEnd
			)
		}
	}, [routePath])

	useEffect(() => {
		const swiperEl = swiperElRef.current as SwiperElement
		const swiper = swiperEl?.swiper as Swiper
		swiper.slideTo(activeIndex)
	})

	const lengthkey = slides?.length || 0

	return (
		<div className={classes.root} key={routePath + "_" + lengthkey}>
			<swiper-container
				ref={swiperElRef}
				slides-per-view={slidesPerView}
				pagination-enabled={paginationEnabled}
				space-between={spaceBetween}
				pagination-clickable={paginationClickable}
				navigation-enabled={navigationEnabled}
				centered-slides={centeredSlides}
				effect={effect}
				watch-overflow={false}
				keyboard-enabled={keyboardEnabled}
				cards-effect-per-slide-offset={4}
				className={classes.root}
			>
				{slides?.map((slide, index) => (
					<swiper-slide key={index}>
						<component.Slot
							definition={slide}
							listName="components"
							path={`${path}["slides"]["${index}"]`}
							context={context}
							componentType={componentType}
						/>
					</swiper-slide>
				))}
			</swiper-container>
		</div>
	)
}

Component.signals = signals

export default Component
