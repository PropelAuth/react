export function threeDaysFromNow() {
    return Math.round(Date.now() / 1000) + 24 * 60 * 60 * 3
}

export function withHttp(url: string): string {
    if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
        return url
    } else {
        return "https://" + url
    }
}
