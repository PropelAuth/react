import React from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Container, ContainerProps } from "../elements/Container"
import { Progress, ProgressProps } from "../elements/Progress"

export type LoadingAppearance = {
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Progress?: ElementAppearance<ProgressProps>
    }
}

export type LoadingProps = {
    appearance?: LoadingAppearance
}

export const Loading = ({ appearance }: LoadingProps) => {
    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <Progress appearance={appearance?.elements?.Progress} />
            </Container>
        </div>
    )
}
