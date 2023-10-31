import React, { useEffect } from "react"
import { useAuthUrl } from "../additionalHooks"
import { Button } from "../elements/Button"
import { Config } from "../withConfig"
import { NO_PASSWORDLESS_URL, NO_SSO_URL } from "./constants"
import { withHttp } from "./helpers"
import { LoginAppearance } from "./Login"
import { SignupAppearance } from "./Signup"

export type SignInOptionsProps = {
    config: Config
    onRedirectToPasswordlessLogin?: VoidFunction
    onRedirectToSSOLogin?: VoidFunction
    appearance?: LoginAppearance | SignupAppearance
}

export const SignInOptions = ({
    config,
    onRedirectToPasswordlessLogin,
    onRedirectToSSOLogin,
    appearance,
}: SignInOptionsProps) => {
    const { authUrl } = useAuthUrl()
    const GOOGLE_LOGIN_PATH = "/google/login"
    const GITHUB_LOGIN_PATH = "/github/login"
    const SLACK_LOGIN_PATH = "/slack/login"
    const MICROSOFT_LOGIN_PATH = "/microsoft/login"
    const LINKEDIN_LOGIN_PATH = "/linkedin/login"

    function loginWithPasswordless() {
        onRedirectToPasswordlessLogin ? onRedirectToPasswordlessLogin() : console.error(NO_PASSWORDLESS_URL)
    }

    function loginWithSSO() {
        onRedirectToSSOLogin ? onRedirectToSSOLogin() : console.error(NO_SSO_URL)
    }

    function loginWithSocial(path: string) {
        const url = withHttp(authUrl)
        return window.location.replace(url + path)
    }

    useEffect(() => {
        if (config.hasPasswordlessLogin && !onRedirectToPasswordlessLogin) {
            console.error("Please specify an onRedirectToPasswordlessLogin function.")
        }
        if (config.hasSsoLogin && !onRedirectToSSOLogin) {
            console.error("Please specify an onRedirectToSSOLogin function.")
        }
    }, [])

    return (
        <div data-contain="social_buttons">
            {config.hasGoogleLogin && (
                <Button
                    onClick={() => loginWithSocial(GOOGLE_LOGIN_PATH)}
                    appearance={appearance?.elements?.SocialButton}
                >
                    <GoogleLogo />
                    <span>Sign in with Google</span>
                </Button>
            )}
            {config.hasGithubLogin && (
                <Button
                    onClick={() => loginWithSocial(GITHUB_LOGIN_PATH)}
                    appearance={appearance?.elements?.SocialButton}
                >
                    <GithubLogo />
                    <span>Sign in with Github</span>
                </Button>
            )}
            {config.hasSlackLogin && (
                <Button
                    onClick={() => loginWithSocial(SLACK_LOGIN_PATH)}
                    appearance={appearance?.elements?.SocialButton}
                >
                    <SlackLogo />
                    <span>Sign in with Slack</span>
                </Button>
            )}
            {config.hasMicrosoftLogin && (
                <Button
                    onClick={() => loginWithSocial(MICROSOFT_LOGIN_PATH)}
                    appearance={appearance?.elements?.SocialButton}
                >
                    <MicrosoftLogo />
                    <span>Sign in with Microsoft</span>
                </Button>
            )}
            {config.hasLinkedinLogin && (
                <Button
                    onClick={() => loginWithSocial(LINKEDIN_LOGIN_PATH)}
                    appearance={appearance?.elements?.SocialButton}
                >
                    <LinkedinLogo />
                    <span>Sign in with LinkedIn</span>
                </Button>
            )}
            {config.hasPasswordlessLogin && (
                <Button
                    onClick={() => loginWithPasswordless()}
                    appearance={appearance?.elements?.RedirectToPasswordlessLoginButton}
                    disabled={!onRedirectToPasswordlessLogin}
                >
                    <PasswordlessLogo />
                    <span>Sign in with Magic Link</span>
                </Button>
            )}
            {config.hasSsoLogin && (
                <Button
                    onClick={() => loginWithSSO()}
                    appearance={appearance?.elements?.RedirectToSSOLoginButton}
                    disabled={!onRedirectToSSOLogin}
                >
                    <SSOLogo />
                    <span>Sign in with SSO</span>
                </Button>
            )}
        </div>
    )
}

export const GoogleLogo = () => {
    return (
        <svg width="92" height="92" viewBox="0 0 92 92">
            <path
                d="M90.0004 47.0998C90.0004 43.9998 89.7004 40.7998 89.2004 37.7998H45.9004V55.4998H70.7004C69.7004 61.1998 66.4004 66.1998 61.5004 69.3998L76.3004 80.8998C85.0004 72.7998 90.0004 60.9998 90.0004 47.0998Z"
                fill="#4280EF"
            />
            <path
                d="M45.9004 91.8999C58.3004 91.8999 68.7004 87.7999 76.3004 80.7999L61.5004 69.3999C57.4004 72.1999 52.1004 73.7999 45.9004 73.7999C33.9004 73.7999 23.8004 65.6999 20.1004 54.8999L4.90039 66.5999C12.7004 82.0999 28.5004 91.8999 45.9004 91.8999Z"
                fill="#34A353"
            />
            <path
                d="M20.1004 54.7999C18.2004 49.0999 18.2004 42.8999 20.1004 37.1999L4.90039 25.3999C-1.59961 38.3999 -1.59961 53.6999 4.90039 66.5999L20.1004 54.7999Z"
                fill="#F6B704"
            />
            <path
                d="M45.9004 18.2999C52.4004 18.1999 58.8004 20.6999 63.5004 25.1999L76.6004 11.9999C68.3004 4.19989 57.3004 -0.000110182 45.9004 0.0998898C28.5004 0.0998898 12.7004 9.89989 4.90039 25.3999L20.1004 37.1999C23.8004 26.2999 33.9004 18.2999 45.9004 18.2999Z"
                fill="#E54335"
            />
        </svg>
    )
}

export const GithubLogo = () => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 0C7.16 0 0 7.16 0 16C0 23.08 4.58 29.06 10.94 31.18C11.74 31.32 12.04 30.84 12.04 30.42C12.04 30.04 12.02 28.78 12.02 27.44C8 28.18 6.96 26.46 6.64 25.56C6.46 25.1 5.68 23.68 5 23.3C4.44 23 3.64 22.26 4.98 22.24C6.24 22.22 7.14 23.4 7.44 23.88C8.88 26.3 11.18 25.62 12.1 25.2C12.24 24.16 12.66 23.46 13.12 23.06C9.56 22.66 5.84 21.28 5.84 15.16C5.84 13.42 6.46 11.98 7.48 10.86C7.32 10.46 6.76 8.82 7.64 6.62C7.64 6.62 8.98 6.2 12.04 8.26C13.32 7.9 14.68 7.72 16.04 7.72C17.4 7.72 18.76 7.9 20.04 8.26C23.1 6.18 24.44 6.62 24.44 6.62C25.32 8.82 24.76 10.46 24.6 10.86C25.62 11.98 26.24 13.4 26.24 15.16C26.24 21.3 22.5 22.66 18.94 23.06C19.52 23.56 20.02 24.52 20.02 26.02C20.02 28.16 20 29.88 20 30.42C20 30.84 20.3 31.34 21.1 31.18C24.2763 30.1077 27.0363 28.0664 28.9917 25.3432C30.947 22.6201 31.9991 19.3524 32 16C32 7.16 24.84 0 16 0Z"
                fill="black"
            />
        </svg>
    )
}

export const SlackLogo = () => {
    return (
        <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path
                d="M9.12583 0.0617676C7.75125 0.0617676 6.63708 1.17843 6.63708 2.55552C6.63676 2.88267 6.70087 3.20669 6.82576 3.50907C6.95066 3.81145 7.13388 4.08626 7.36499 4.31783C7.59609 4.5494 7.87054 4.73318 8.17266 4.85868C8.47479 4.98418 8.79868 5.04894 9.12583 5.04927H11.615V2.55552C11.6156 1.89476 11.3536 1.26084 10.8868 0.79318C10.42 0.325523 9.78659 0.0624303 9.12583 0.0617676M9.12583 6.71177H2.48875C1.11417 6.71177 0 7.82843 0 9.20593C0 10.583 1.11417 11.6997 2.48875 11.6997H9.12625C10.5004 11.6997 11.615 10.583 11.615 9.20593C11.615 7.82843 10.5004 6.71177 9.12583 6.71177"
                fill="#097EFF"
            />
            <path
                d="M24.8884 9.20593C24.8884 7.82843 23.7739 6.71177 22.3993 6.71177C21.0247 6.71177 19.9105 7.82843 19.9105 9.20593V11.6997H22.3993C23.06 11.699 23.6935 11.4359 24.1603 10.9683C24.6271 10.5006 24.889 9.86669 24.8884 9.20593M18.2514 9.20593V2.55552C18.2519 1.89476 17.99 1.26084 17.5232 0.79318C17.0564 0.325523 16.4229 0.0624303 15.7622 0.0617676C14.3876 0.0617676 13.2734 1.17843 13.2734 2.55552V9.20552C13.2734 10.5834 14.3876 11.7001 15.7622 11.7001C16.4229 11.6994 17.0564 11.4363 17.5232 10.9687C17.99 10.501 18.2519 9.86711 18.2514 9.20635"
                fill="#097EFF"
            />
            <path
                d="M15.7622 25.0002C16.4229 24.9996 17.0564 24.7365 17.5232 24.2688C17.99 23.8012 18.2519 23.1672 18.2514 22.5065C18.2519 21.8457 17.99 21.2118 17.5232 20.7441C17.0564 20.2765 16.4229 20.0134 15.7622 20.0127H13.2734V22.5065C13.2734 23.8836 14.3876 25.0002 15.7622 25.0002ZM15.7622 18.3502H22.3997C23.7739 18.3502 24.8884 17.2336 24.8884 15.8561C24.889 15.1953 24.6271 14.5614 24.1603 14.0937C23.6935 13.6261 23.06 13.363 22.3993 13.3623H15.7622C14.3876 13.3623 13.2734 14.479 13.2734 15.8561C13.2731 16.1832 13.3372 16.5072 13.4621 16.8096C13.587 17.112 13.7702 17.3868 14.0013 17.6184C14.2324 17.8499 14.5069 18.0337 14.809 18.1592C15.1111 18.2847 15.435 18.3495 15.7622 18.3498"
                fill="#ECB12F"
            />
            <path
                d="M1.25576e-06 15.8561C-0.000327214 16.1832 0.0637857 16.5072 0.188679 16.8096C0.313573 17.112 0.496801 17.3868 0.727903 17.6184C0.959005 17.8499 1.23345 18.0337 1.53558 18.1592C1.83771 18.2847 2.1616 18.3495 2.48875 18.3498C3.14951 18.3491 3.78295 18.086 4.24975 17.6184C4.71654 17.1507 4.97847 16.5168 4.97792 15.8561V13.3623H2.48875C1.11417 13.3623 1.25576e-06 14.479 1.25576e-06 15.8561M6.63708 15.8561V22.5061C6.63708 23.8836 7.75125 25.0002 9.12583 25.0002C9.78659 24.9996 10.42 24.7365 10.8868 24.2688C11.3536 23.8012 11.6156 23.1672 11.615 22.5065V15.8561C11.6153 15.5289 11.5512 15.2048 11.4263 14.9024C11.3014 14.6 11.1181 14.3252 10.887 14.0936C10.6558 13.862 10.3813 13.6783 10.0791 13.5528C9.77696 13.4273 9.45303 13.3626 9.12583 13.3623C7.75125 13.3623 6.63708 14.479 6.63708 15.8561Z"
                fill="#ECB12F"
            />
        </svg>
    )
}

export const MicrosoftLogo = () => {
    return (
        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
            <path d="M0 0H10V10H0V0Z" fill="#F35325" />
            <path d="M11 0H21V10H11V0Z" fill="#81BC06" />
            <path d="M0 11H10V21H0V11Z" fill="#05A6F0" />
            <path d="M11 11H21V21H11V11Z" fill="#FFBA08" />
        </svg>
    )
}

export const LinkedinLogo = () => {
    return (
        <svg width="21" height="22" viewBox="0 0 21 22" fill="none">
            <path
                d="M0.882812 2.23542C0.882812 1.43471 1.54838 0.785208 2.36943 0.785208H19.5134C20.3344 0.785208 21 1.43471 21 2.23542V19.5798C21 20.3808 20.3344 21.03 19.5134 21.03H2.36943C1.54838 21.03 0.882812 20.3808 0.882812 19.5798V2.23542V2.23542Z"
                fill="#006699"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.97986 17.7322V8.59051H3.94134V17.7322H6.97986V17.7322ZM5.46058 7.34237C6.52018 7.34237 7.17969 6.64039 7.17969 5.76312C7.15994 4.8661 6.52018 4.1836 5.48069 4.1836C4.4413 4.1836 3.76172 4.8661 3.76172 5.76312C3.76172 6.64039 4.42109 7.34237 5.44078 7.34237H5.46053H5.46058Z"
                fill="white"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.66016 17.7322H11.6986V12.6271C11.6986 12.3539 11.7184 12.0809 11.7986 11.8856C12.0183 11.3397 12.5182 10.7743 13.3576 10.7743C14.4571 10.7743 14.897 11.6127 14.897 12.8416V17.7322H17.9352V12.4905C17.9352 9.68256 16.4362 8.37599 14.4371 8.37599C12.7979 8.37599 12.0783 9.29222 11.6784 9.91629H11.6987V8.59051H8.66024C8.70011 9.4483 8.66024 17.7322 8.66024 17.7322H8.66016Z"
                fill="white"
            />
        </svg>
    )
}

export const PasswordlessLogo = () => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
        </svg>
    )
}

export const SSOLogo = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_7_25)">
                <path
                    d="M16.5 0C12.36 0 9.00003 3.36 9.00003 7.5C9.00003 9.03 9.46503 10.44 10.245 11.625L0.435034 21.435C0.152578 21.7175 -0.00610352 22.1005 -0.00610352 22.5C-0.00610352 22.8995 0.152578 23.2825 0.435034 23.565C0.717489 23.8475 1.10058 24.0061 1.50003 24.0061C1.89949 24.0061 2.28258 23.8475 2.56503 23.565L4.50003 21.615L6.43503 23.55C6.70503 23.835 7.08003 24 7.50003 24C7.92003 24 8.29503 23.835 8.56503 23.565L11.565 20.565C11.835 20.295 12 19.92 12 19.5C12 19.08 11.835 18.705 11.565 18.435L9.61503 16.5L12.36 13.755C13.56 14.535 14.97 15 16.5 15C20.64 15 24 11.64 24 7.5C24 3.36 20.64 0 16.5 0ZM16.5 12C16.155 12 15.825 11.955 15.51 11.88C15.495 11.88 15.48 11.865 15.465 11.865C15.15 11.79 14.85 11.685 14.565 11.55C13.9636 11.2604 13.4339 10.8411 13.0137 10.3224C12.5936 9.80373 12.2935 9.19843 12.135 8.55C12.135 8.535 12.12 8.52 12.12 8.505C12.045 8.175 12 7.845 12 7.5C12 5.01 14.01 3 16.5 3C18.99 3 21 5.01 21 7.5C21 9.99 18.99 12 16.5 12Z"
                    fill="black"
                />
            </g>
            <defs>
                <clipPath id="clip0_7_25">
                    <rect width="24" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}
