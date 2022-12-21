import React, { ReactNode, useEffect, useState } from "react"
import { ElementAppearance } from "../AppearanceProvider"
import { Alert, AlertProps } from "../elements/Alert"
import { Button, ButtonProps } from "../elements/Button"
import { Container, ContainerProps } from "../elements/Container"
import { H3, H3Props } from "../elements/H3"
import { Image, ImageProps } from "../elements/Image"
import { Input, InputProps } from "../elements/Input"
import { Label, LabelProps } from "../elements/Label"
import { Modal, ModalProps } from "../elements/Modal"
import { Paragraph, ParagraphProps } from "../elements/Paragraph"
import { Progress, ProgressProps } from "../elements/Progress"
import { useApi } from "../useApi"
import {
    BAD_REQUEST_MFA_ENABLE,
    FORBIDDEN,
    NOT_FOUND_MFA_DISABLE,
    NOT_FOUND_MFA_ENABLE,
    NOT_FOUND_MFA_STATUS,
    UNAUTHORIZED,
    UNEXPECTED_ERROR,
} from "./constants"

export type MfaProps = {
    appearance?: MfaAppearance
}

export type MfaAppearance = {
    options?: {
        disableMfaButtonContent?: ReactNode
        disableMfaModalHeaderContent?: ReactNode
        disableMfaModalButtonContent?: ReactNode
        closeDisableMfaModalButtonContent?: ReactNode
        backupCodesHeaderContent?: ReactNode
        showBackupCodesButtonContent?: ReactNode
        downloadBackupCodesButtonContent?: ReactNode
        closeBackupCodesButtonContent?: ReactNode
        enableMfaButtonContent?: ReactNode
        enableMfaModalHeaderContent?: ReactNode
        enableMfaModalButtonContent?: ReactNode
        toggleQrSecretInputContent?: ReactNode
        toggleQrCodeImageContent?: ReactNode
        enableMfaCodeLabel?: ReactNode
        closeEnableMfaModalButtonContent?: ReactNode
    }
    elements?: {
        Progress?: ElementAppearance<ProgressProps>
        Container?: ElementAppearance<ContainerProps>
        EnableMfaButton?: ElementAppearance<ButtonProps>
        EnableMfaModal?: ElementAppearance<ModalProps>
        EnableMfaModalHeader?: ElementAppearance<H3Props>
        EnableMfaModalText?: ElementAppearance<ParagraphProps>
        EnableMfaModalButton?: ElementAppearance<ButtonProps>
        QrCodeImage?: ElementAppearance<ImageProps>
        QrSecretInput?: ElementAppearance<InputProps>
        EnableMfaCodeLabel?: ElementAppearance<LabelProps>
        EnableMfaCodeInput?: ElementAppearance<InputProps>
        DisableMfaButton?: ElementAppearance<ButtonProps>
        DisableMfaModal?: ElementAppearance<ModalProps>
        DisableMfaModalHeader?: ElementAppearance<H3Props>
        DisableMfaModalText?: ElementAppearance<ParagraphProps>
        DisableMfaModalButton?: ElementAppearance<ButtonProps>
        ShowBackupCodesButton?: ElementAppearance<ButtonProps>
        BackupCodesModal?: ElementAppearance<ModalProps>
        BackupCodesHeader?: ElementAppearance<H3Props>
        BackupCodesText?: ElementAppearance<ParagraphProps>
        BackupCodeInput?: ElementAppearance<InputProps>
        DownloadBackupCodesButton?: ElementAppearance<ButtonProps>
        CloseEnableMfaModalButton?: ElementAppearance<ButtonProps>
        CloseDisableMfaModalButton?: ElementAppearance<ButtonProps>
        CloseBackupCodesButton?: ElementAppearance<ButtonProps>
        ErrorMessage?: ElementAppearance<AlertProps>
    }
}

export type MfaStatus = "Enabled" | "Disabled"

export const Mfa = ({ appearance }: MfaProps) => {
    const { mfaApi } = useApi()
    const [mfaStatus, setMfaStatus] = useState<MfaStatus | undefined>(undefined)
    const [showQr, setShowQr] = useState(true)
    const [showDisableModal, setShowDisableModal] = useState(false)
    const [showEnableModal, setShowEnableModal] = useState(false)
    const [showBackupModal, setShowBackupModal] = useState(false)
    const [code, setCode] = useState("")
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [newQr, setNewQr] = useState("")
    const [newSecret, setNewSecret] = useState("")
    const [statusLoading, setStatusLoading] = useState(false)
    const [statusError, setStatusError] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    useEffect(() => {
        let mounted = true
        setStatusLoading(true)
        mfaApi
            .mfaStatus()
            .then((response) => {
                if (mounted) {
                    if (response.ok) {
                        if (response.body.type === "Enabled") {
                            setMfaStatus(response.body.type)
                            setBackupCodes(response.body.backupCodes)
                        } else if (response.body.type === "Disabled") {
                            setMfaStatus(response.body.type)
                            setNewSecret(response.body.newSecret)
                            setNewQr(response.body.newQr)
                        }
                    } else {
                        response.error._visit({
                            notFoundMfaStatus: () => setStatusError(NOT_FOUND_MFA_STATUS),
                            unauthorized: () => setStatusError(UNAUTHORIZED),
                            _other: () => setStatusError(UNEXPECTED_ERROR),
                        })
                    }
                }
            })
            .catch(() => {
                setStatusError(UNEXPECTED_ERROR)
            })
        setStatusLoading(false)
        return () => {
            setStatusLoading(false)
            mounted = false
        }
    }, [mfaStatus, mfaApi])

    async function enableMfa() {
        try {
            setLoading(true)
            const res = await mfaApi.mfaEnable({ code })
            if (res.ok) {
                setShowEnableModal(false)
                setCode("")
                setError(undefined)
                setMfaStatus("Enabled")
            } else {
                res.error._visit({
                    notFoundMfaEnable: () => setError(NOT_FOUND_MFA_ENABLE),
                    badRequestMfaEnable: () => setError(BAD_REQUEST_MFA_ENABLE),
                    forbiddenMfaEnable: () => setError(FORBIDDEN),
                    unauthorized: () => setError(UNAUTHORIZED),
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function disableMfa() {
        try {
            setLoading(true)
            const res = await mfaApi.mfaDisable()
            if (res.ok) {
                setShowDisableModal(false)
                setError(undefined)
                setMfaStatus("Disabled")
            } else {
                res.error._visit({
                    notFoundMfaDisable: () => setError(NOT_FOUND_MFA_DISABLE),
                    unauthorized: () => setError(UNAUTHORIZED),
                    _other: () => setError(UNEXPECTED_ERROR),
                })
            }
        } catch (e) {
            setError(UNEXPECTED_ERROR)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function downloadBackupCodes() {
        try {
            const codesToText = backupCodes.join(" ")
            const blob = new Blob([codesToText], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "backup-codes.txt"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (e) {
            setError("Download failed")
            console.error(e)
        }
    }

    if (statusLoading) {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Progress appearance={appearance?.elements?.Progress} />
                </Container>
            </div>
        )
    }

    if (mfaStatus === "Enabled") {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Button
                        onClick={() => setShowDisableModal(true)}
                        appearance={appearance?.elements?.DisableMfaButton}
                    >
                        {appearance?.options?.disableMfaButtonContent || "Disable 2FA"}
                    </Button>
                    <Button
                        onClick={() => setShowBackupModal(true)}
                        appearance={appearance?.elements?.ShowBackupCodesButton}
                    >
                        {appearance?.options?.showBackupCodesButtonContent || "Show Backup Codes"}
                    </Button>
                </Container>
                <Modal
                    show={showDisableModal}
                    setShow={setShowDisableModal}
                    appearance={appearance?.elements?.DisableMfaModal}
                    onClose={() => setError(undefined)}
                >
                    <H3 appearance={appearance?.elements?.DisableMfaModalHeader}>
                        {appearance?.options?.disableMfaModalHeaderContent || "Disable 2FA"}
                    </H3>
                    <Paragraph appearance={appearance?.elements?.DisableMfaModalText}>
                        Are you sure you want to disable 2FA?
                    </Paragraph>
                    <Button
                        loading={loading}
                        onClick={disableMfa}
                        appearance={appearance?.elements?.DisableMfaModalButton}
                    >
                        {appearance?.options?.disableMfaModalButtonContent || "Disable 2FA"}
                    </Button>
                    <Button
                        onClick={() => setShowDisableModal(false)}
                        appearance={appearance?.elements?.CloseDisableMfaModalButton}
                    >
                        {appearance?.options?.closeDisableMfaModalButtonContent || "Cancel"}
                    </Button>
                    {error && (
                        <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                            {error}
                        </Alert>
                    )}
                </Modal>
                <Modal
                    show={showBackupModal}
                    setShow={setShowBackupModal}
                    appearance={appearance?.elements?.BackupCodesModal}
                >
                    <H3 appearance={appearance?.elements?.BackupCodesHeader}>
                        {appearance?.options?.backupCodesHeaderContent || "Backup Codes"}
                    </H3>
                    <Paragraph appearance={appearance?.elements?.BackupCodesText}>
                        Backup codes are one-time codes you can use to login if you can't access your authenticator app.
                    </Paragraph>
                    <div data-contain="backup_codes">
                        {backupCodes.map((code, i) => {
                            return (
                                <Input
                                    key={i}
                                    value={code}
                                    readOnly
                                    appearance={appearance?.elements?.BackupCodeInput}
                                />
                            )
                        })}
                    </div>
                    <Button onClick={downloadBackupCodes} appearance={appearance?.elements?.DownloadBackupCodesButton}>
                        {appearance?.options?.downloadBackupCodesButtonContent || "Download Backup Codes"}
                    </Button>
                    <Button
                        onClick={() => setShowBackupModal(false)}
                        appearance={appearance?.elements?.CloseBackupCodesButton}
                    >
                        {appearance?.options?.closeBackupCodesButtonContent || "Close"}
                    </Button>
                    {error && (
                        <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                            {error}
                        </Alert>
                    )}
                </Modal>
            </div>
        )
    }

    if (mfaStatus === "Disabled") {
        return (
            <div data-contain="component">
                <Container appearance={appearance?.elements?.Container}>
                    <Button onClick={() => setShowEnableModal(true)} appearance={appearance?.elements?.EnableMfaButton}>
                        {appearance?.options?.enableMfaButtonContent || "Enable 2FA"}
                    </Button>
                    <Modal
                        show={showEnableModal}
                        setShow={setShowEnableModal}
                        appearance={appearance?.elements?.EnableMfaModal}
                        onClose={() => setError(undefined)}
                    >
                        <H3 appearance={appearance?.elements?.EnableMfaModalHeader}>
                            {appearance?.options?.enableMfaModalHeaderContent || "Enable 2FA"}
                        </H3>
                        <Paragraph appearance={appearance?.elements?.EnableMfaModalText}>
                            Two-Factor Authentication makes your account more secure by requiring a code in addition to
                            your normal login. You&#39;ll need an Authenticator app like Google Authenticator or Authy.
                        </Paragraph>
                        <div data-contain="qr_code">
                            {showQr ? (
                                <>
                                    <Image
                                        src={`data:image/png;base64,${newQr}`}
                                        alt={"qr code"}
                                        appearance={appearance?.elements?.QrCodeImage}
                                    />
                                    <div onClick={() => setShowQr(false)}>
                                        {appearance?.options?.toggleQrSecretInputContent || (
                                            <small>Not working? Enter a code instead</small>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Input
                                        onChange={() => null}
                                        type="text"
                                        value={newSecret}
                                        readOnly
                                        appearance={appearance?.elements?.QrSecretInput}
                                    />
                                    <div onClick={() => setShowQr(true)}>
                                        {appearance?.options?.toggleQrCodeImageContent || (
                                            <small>Prefer an image? Scan a QR code instead</small>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <Label htmlFor={"code"} appearance={appearance?.elements?.EnableMfaCodeLabel}>
                                {appearance?.options?.enableMfaCodeLabel || "Enter the 6-digit code from the app"}
                            </Label>
                            <Input
                                id={"code"}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                appearance={appearance?.elements?.EnableMfaCodeInput}
                            />
                        </div>
                        <Button
                            onClick={() => setShowEnableModal(false)}
                            appearance={appearance?.elements?.CloseEnableMfaModalButton}
                        >
                            {appearance?.options?.closeEnableMfaModalButtonContent || "Cancel"}
                        </Button>
                        <Button onClick={enableMfa} appearance={appearance?.elements?.EnableMfaModalButton}>
                            {appearance?.options?.enableMfaModalButtonContent || "Enable 2FA"}
                        </Button>
                        {error && (
                            <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                                {error}
                            </Alert>
                        )}
                    </Modal>
                </Container>
            </div>
        )
    }

    return (
        <div data-contain="component">
            <Container appearance={appearance?.elements?.Container}>
                <Alert type={"error"} appearance={appearance?.elements?.ErrorMessage}>
                    {UNEXPECTED_ERROR}
                </Alert>
            </Container>
        </div>
    )
}
