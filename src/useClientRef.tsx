import { createClient, IAuthClient } from "@propelauth/javascript"
import { MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

type ClientRef = {
    authUrl: string
    client: IAuthClient
}

interface UseClientRefProps {
    authUrl: string
    minSecondsBeforeRefresh?: number
}

export const useClientRef = (props: UseClientRefProps) => {
    const [accessTokenChangeCounter, setAccessTokenChangeCounter] = useState(0)
    const { authUrl, minSecondsBeforeRefresh } = props

    const bumpTokenChangeCounter = useCallback(() => setAccessTokenChangeCounter((x) => x + 1), [])

    const [client, setClient] = useState<ClientRef>({
        authUrl,
        client: createClient({
            authUrl,
            enableBackgroundTokenRefresh: true,
            minSecondsBeforeRefresh,
            skipInitialFetch: true,
        }),
    })
    const clientRef = useRef<ClientRef | null>(client)

    useEffect(() => {
        setClient({
            authUrl,
            client: createClient({
                authUrl,
                enableBackgroundTokenRefresh: true,
                minSecondsBeforeRefresh,
                skipInitialFetch: true,
            }),
        })
    }, [authUrl, minSecondsBeforeRefresh])
    useLayoutEffect(() => {
        client.client.addAccessTokenChangeObserver(bumpTokenChangeCounter)
        clientRef.current = client
        return () => {
            client.client.removeAccessTokenChangeObserver(bumpTokenChangeCounter)
        }
    }, [client, bumpTokenChangeCounter])

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
                throw new Error("Client is not initialized")
            }
            return callback(client)(...inputs)
        },
        [callback]
    )
}
