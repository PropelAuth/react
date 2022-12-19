export function threeDaysFromNow() {
    return Math.round(Date.now() / 1000) + 24 * 60 * 60 * 3
}

export function getTokenFromURL(): string | null {
    const url = new URL(window.location.href)
    return url.searchParams.get("t")
}
