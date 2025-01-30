import { signal } from "@uesio/ui"

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

export { signals }
