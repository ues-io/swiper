import { definition, styles } from "@uesio/ui"
import {
	DetailedHTMLProps,
	HTMLAttributes,
	ReactNode,
	useEffect,
	useRef,
} from "react"

import { register } from "swiper/element/bundle"
import { Swiper } from "swiper/types"
import type { SwiperSlideProps, SwiperProps } from "swiper/react"
// register Swiper custom elements
register()

type SwiperElement = {
	swiper: Swiper
} & HTMLElement

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"swiper-container": DetailedHTMLProps<
				HTMLAttributes<HTMLElement> & SwiperProps,
				HTMLElement
			>
			"swiper-slide": DetailedHTMLProps<
				HTMLAttributes<HTMLElement> & SwiperSlideProps,
				HTMLElement
			>
		}
	}
}

interface SwiperUtilityProps {
	slides: ReactNode[]
	options?: SwiperProps
	startHandler?: () => void
	endHandler?: () => void
	activeIndex?: number
}

const StyleDefaults = Object.freeze({
	root: [],
})

const SwiperUtility: definition.UtilityComponent<SwiperUtilityProps> = (
	props
) => {
	const classes = styles.useUtilityStyleTokens(
		StyleDefaults,
		props,
		"uesio/swiper.swiper"
	)
	const {
		id,
		context,
		slides,
		startHandler,
		endHandler,
		activeIndex,
		options = {},
	} = props

	const lengthkey = slides?.length || 0
	const routePath = `${context.getRoute()?.path}_${id}`
	const key = `${routePath}_${lengthkey}`

	const swiperElRef = useRef<HTMLElement>(null)

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
		swiper.slideTo(activeIndex || 0)
	})

	return (
		<div className={classes.root} key={key}>
			<swiper-container
				ref={swiperElRef}
				slides-per-view={options.slidesPerView}
				pagination-enabled={options.pagination}
				space-between={options.spaceBetween}
				pagination-clickable={options.pagination}
				navigation-enabled={options.navigation}
				centered-slides={options.centeredSlides}
				effect={options.effect}
				watch-overflow={false}
				keyboard-enabled={options.keyboard}
				cards-effect-per-slide-offset={4}
				className={classes.root}
			>
				{slides?.map((slide, index) => (
					<swiper-slide key={index}>{slide}</swiper-slide>
				))}
			</swiper-container>
		</div>
	)
}

export default SwiperUtility
