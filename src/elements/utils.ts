import { CSSProperties } from "react"
import { Element, ElementAppearance } from "../AppearanceProvider"

export type PropsFromAppearance<T> = {
    classes?: string
    styles?: CSSProperties
    Element?: Element<T>
}

export function getPropsFromAppearance<T>(appearance: ElementAppearance<T> | undefined): PropsFromAppearance<T> {
    if (appearance === null) {
        return { classes: undefined, styles: undefined, Element: null }
    }

    switch (typeof appearance) {
        case "string":
            return { classes: appearance, styles: undefined, Element: undefined }
        case "object":
            return { classes: undefined, styles: appearance, Element: undefined }
        case "function":
            return { classes: undefined, styles: undefined, Element: appearance }
        default:
            return { classes: undefined, styles: undefined, Element: undefined }
    }
}

export function joinClasses(x?: string, y?: string): string | undefined {
    if (!x && !y) {
        return undefined
    }

    if (!x) {
        return y
    }

    if (!y) {
        return x
    }

    return x + " " + y
}

export function joinStyles(x?: CSSProperties, y?: CSSProperties): CSSProperties | undefined {
    if (!x && !y) {
        return undefined
    }

    if (!x) {
        return y
    }

    if (!y) {
        return x
    }

    return {
        ...x,
        ...y,
    }
}

export type MergeProps<T> = {
    appearance?: ElementAppearance<T>
    element?: ElementAppearance<T>
}

function overrideElement<T>(localElement?: Element<T>, globalElement?: Element<T>) {
    if (localElement === null) {
        return null
    } else if (localElement) {
        return localElement
    } else if (globalElement === null) {
        return null
    } else if (globalElement) {
        return globalElement
    } else {
        return undefined
    }
}

export function mergeProps<T>({ appearance, element }: MergeProps<T>) {
    const globalProps = getPropsFromAppearance(element)
    const localProps = getPropsFromAppearance(appearance)
    const classes = joinClasses(globalProps.classes, localProps.classes)
    const styles = joinStyles(globalProps.styles, localProps.styles)
    const Override = overrideElement(localProps.Element, globalProps.Element)
    return { classes, styles, Override }
}
