import ForgotPassword from "./components/ForgotPassword"
import LoginManager from "./components/LoginManager"
import LoginPasswordless from "./components/LoginPasswordless"
import LoginSSO from "./components/LoginSSO"
import Signup from "./components/Signup"

export type {
    AccessHelper,
    AccessHelperWithOrg,
    OrgHelper,
    OrgIdToOrgMemberInfo,
    OrgMemberInfo,
    RedirectToLoginOptions,
    RedirectToSignupOptions,
    User,
} from "@propelauth/javascript"
export { useAccessHelper, useOrgHelper } from "./additionalHooks"
export type {
    UseAccessHelper,
    UseAccessHelperLoaded,
    UseAccessHelperLoading,
    UseOrgHelper,
    UseOrgHelperLoaded,
    UseOrgHelperLoading,
} from "./additionalHooks"
export { AuthProvider, RequiredAuthProvider } from "./AuthContext"
export type { AuthProviderProps, RequiredAuthProviderProps } from "./AuthContext"
export { AuthProviderForTesting } from "./AuthContextForTesting"
export type { AuthProviderForTestingProps, UserInformationForTesting } from "./AuthContextForTesting"
export { BetaComponentLibraryProvider } from "./BetaComponentLibraryProvider"
export type { BetaComponentLibraryProviderProps } from "./BetaComponentLibraryProvider"
export type { CompleteAccountAppearance } from "./components/CompleteAccount"
export type { ConfirmEmailAppearance } from "./components/ConfirmEmail"
export type { CreateOrgAppearance } from "./components/CreateOrg"
export type { ForgotPasswordAppearance, ForgotPasswordProps } from "./components/ForgotPassword"
export type { LoginAppearance } from "./components/Login"
export type { LoginPasswordlessAppearance, LoginPasswordlessProps } from "./components/LoginPasswordless"
export type { LoginSSOAppearance, LoginSSOProps } from "./components/LoginSSO"
export type { SignupAppearance, SignupProps } from "./components/Signup"
export type { UpdatePasswordAppearance } from "./components/UpdatePassword"
export type { VerifyMfaAppearance } from "./components/VerifyMfa"
export type { AlertProps } from "./elements/Alert"
export type { ButtonProps } from "./elements/Button"
export type { CheckboxProps } from "./elements/Checkbox"
export type { ContainerProps } from "./elements/Container"
export type { DividerProps } from "./elements/Divider"
export type { H1Props } from "./elements/H1"
export type { H3Props } from "./elements/H3"
export type { H5Props } from "./elements/H5"
export type { ImageProps } from "./elements/Image"
export type { InputProps } from "./elements/Input"
export type { LabelProps } from "./elements/Label"
export type { LinkProps } from "./elements/Link"
export type { LoaderProps } from "./elements/Loader"
export type { ParagraphProps } from "./elements/Paragraph"
export type { SelectProps } from "./elements/Select"
export { loadOrgSelectionFromLocalStorage, saveOrgSelectionToLocalStorage, useActiveOrg } from "./useActiveOrg"
export { useAuthInfo } from "./useAuthInfo"
export { useLogoutFunction } from "./useLogoutFunction"
export { RedirectToLogin, RedirectToSignup, useRedirectFunctions } from "./useRedirectFunctions"
export type { RedirectProps } from "./useRedirectFunctions"
export { withAuthInfo } from "./withAuthInfo"
export type {
    WithAuthInfoArgs,
    WithAuthInfoProps,
    WithLoggedInAuthInfoProps,
    WithNotLoggedInAuthInfoProps,
} from "./withAuthInfo"
export { withRequiredAuthInfo } from "./withRequiredAuthInfo"
export type { WithRequiredAuthInfoArgs } from "./withRequiredAuthInfo"
export { Signup, LoginManager, ForgotPassword, LoginPasswordless, LoginSSO }
