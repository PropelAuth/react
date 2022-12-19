import React, { ReactNode } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { useConfig } from "../useConfig"

export type ConfirmEmailProps = {
    appearance?: ConfirmEmailAppearance
}

export type ConfirmEmailAppearance = {
    options?: {
        displayLogo?: boolean
        headerContent?: ReactNode
        textContent?: ReactNode
    }
    elements?: {
        Container?: ElementAppearance<ContainerProps>
        Logo?: ElementAppearance<ImageProps>
        Header?: ElementAppearance<H3Props>
        Text?: ElementAppearance<ParagraphProps>
    }
}

export const ConfirmEmail = ({ appearance }: ConfirmEmailProps) => {
    const { config } = useConfig()
    const message = `You should receive an email with a link to confirm your email address within the next few minutes. If you do not receive an email, make sure to check your spam.`
    // Resend button?

    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                {appearance?.options?.displayLogo && config && (
                    <div data-contain="logo">
                        <Image
                            src={config.logo_url}
                            alt={config.site_display_name}
                            appearance={appearance?.elements?.Logo}
                        />
                    </div>
                )}
                <div data-contain="header">
                    <H3 appearance={appearance?.elements?.Header}>
                        {appearance?.options?.headerContent || "Confirm your email"}
                    </H3>
                </div>
                <div data-contain="text">
                    <Paragraph appearance={appearance?.elements?.Text}>
                        {appearance?.options?.textContent || `${message}`}
                    </Paragraph>
                </div>
            </Container>
        </div>
    )
}
