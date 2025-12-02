import { createClient, IAuthClient } from "@propelauth/javascript"
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"

type ClientRef = {
    authUrl: string
    client: IAuthClient
}

// Props when creating a new client internally
type UseClientRefCreateProps = {
    authUrl: string
    minSecondsBeforeRefresh?: number
    client?: never
}

// Props when using an externally-provided client
type UseClientRefExternalProps = {
    client: IAuthClient
    authUrl?: never
    minSecondsBeforeRefresh?: never
}

type UseClientRefProps = UseClientRefCreateProps | UseClientRefExternalProps

export const useClientRef = (props: UseClientRefProps) => {
    const [accessTokenChangeCounter, setAccessTokenChangeCounter] = useState(0)

    const externalClient = "client" in props ? props.client : undefined
    const authUrl = "authUrl" in props ? props.authUrl : undefined
    const minSecondsBeforeRefresh = "minSecondsBeforeRefresh" in props ? props.minSecondsBeforeRefresh : undefined

    // Initialize ref immediately with external client (available during render)
    // or null (will be set in useEffect for internally-created clients)
    const clientRef = useRef<ClientRef | null>(
        externalClient ? { authUrl: externalClient.getAuthOptions().authUrl, client: externalClient } : null
    )

    // Effect for external client: set up observer
    useEffect(() => {
        if (!externalClient) {
            return
        }

        // Warning for disabled background refresh
        const options = externalClient.getAuthOptions()
        if (!options.enableBackgroundTokenRefresh) {
            console.warn(
                "[@propelauth/react] The provided client has enableBackgroundTokenRefresh disabled. " +
                    "This may cause authentication state to become stale."
            )
        }

        const observer = () => setAccessTokenChangeCounter((x) => x + 1)
        externalClient.addAccessTokenChangeObserver(observer)

        return () => {
            externalClient.removeAccessTokenChangeObserver(observer)
        }
    }, [externalClient])

    // Effect for internal client: create, set up observer, and manage lifecycle
    useEffect(() => {
        if (externalClient) {
            return
        }

        const client = createClient({
            authUrl: authUrl!,
            enableBackgroundTokenRefresh: true,
            minSecondsBeforeRefresh,
            skipInitialFetch: true,
        })

        client.addAccessTokenChangeObserver(() => setAccessTokenChangeCounter((x) => x + 1))

        clientRef.current = { authUrl: client.getAuthOptions().authUrl, client }

        return () => {
            client.destroy()
            if (clientRef.current?.client === client) {
                clientRef.current = null
            }
        }
    }, [externalClient, authUrl, minSecondsBeforeRefresh])

    return { clientRef, accessTokenChangeCounter }
}

export const useClientRefCallback = <I extends unknown[], O>(
    clientRef: MutableRefObject<ClientRef | null>,
    callback: (client: IAuthClient) => (...inputs: I) => O
): ((...inputs: I) => O) => {
    return useCallback(
        (...inputs: I) => {
            const client = clientRef.current?.client
            if (!client) {
                console.error(
                    "[@propelauth/react] Auth client is not initialized yet. " +
                        "The client is created in a useEffect, which runs after render. " +
                        "This error typically occurs when calling auth methods during component render. " +
                        "To fix this, either move auth calls to useEffect/event handlers, or create " +
                        "the client yourself with createClient() and pass it to AuthProvider via the 'client' prop."
                )
                throw new Error("Client is not initialized")
            }
            return callback(client)(...inputs)
        },
        [callback]
    )
}
