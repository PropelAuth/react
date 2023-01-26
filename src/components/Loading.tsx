import React from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Container, ContainerProps } from "../elements/Container"
import { Loader, LoaderProps } from "../elements/Loader"

export type LoadingAppearance = {
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Loader?: ElementAppearance<LoaderProps>
    }
}

export type LoadingProps = {
    appearance?: LoadingAppearance
}

export const Loading = ({ appearance }: LoadingProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <Loader appearance={appearance?.elements?.Loader} />
            </Container>
        </div>
    )
}
