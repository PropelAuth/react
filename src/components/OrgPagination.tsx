import React, { useEffect, useState } from "react"
import { Button } from "../elements/Button"
import { Paragraph } from "../elements/Paragraph"
import { OrgAppearance } from "./ManageOrg"

export type PaginationProps<T> = {
    items: T[]
} & PaginationControls

export type PaginationControls = {
    controls: {
        currentPage: number
        totalPages: number
        hasBack: boolean
        hasNext: boolean
        onBack: VoidFunction
        onNext: VoidFunction
    }
    appearance?: OrgAppearance
}

export const OrgPagination = ({ controls, appearance }: PaginationControls) => {
    return (
        <>
            <Paragraph
                appearance={appearance?.elements?.PageText}
            >{`Page ${controls.currentPage} of ${controls.totalPages}`}</Paragraph>
            <div data-contain="pagination_buttons">
                {controls.hasBack && (
                    <Button onClick={controls.onBack} appearance={appearance?.elements?.PageBackButton}>
                        {appearance?.options?.pageBackButtonContent || "Back"}
                    </Button>
                )}
                {controls.hasNext && (
                    <Button onClick={controls.onNext} appearance={appearance?.elements?.PageNextButton}>
                        {appearance?.options?.pageNextButtonContent || "Next"}
                    </Button>
                )}
            </div>
        </>
    )
}

export type UsePaginationProps<T> = {
    items: T[]
    itemsPerPage: number
}

export function usePagination<T>({ items, itemsPerPage }: UsePaginationProps<T>) {
    const [page, setPage] = useState<number>(1)
    const [pageItems, setPageItems] = useState<T[]>(items ?? [])
    const [numItems, setNumItems] = useState<number>(items ? items.length : 0)
    const maxPages = Math.ceil(numItems / itemsPerPage)

    useEffect(() => {
        if (items && items.length) {
            setNumItems(items.length)
            setPage(1)
        }
    }, [items])

    useEffect(() => {
        const arr = items ?? []
        const start = (page - 1) * itemsPerPage
        const end = page * itemsPerPage
        setPageItems(arr.slice(start, end))
    }, [items, page, itemsPerPage])

    return {
        items: pageItems,
        controls: {
            currentPage: page,
            totalPages: maxPages,
            hasBack: page > 1,
            hasNext: page < maxPages,
            onBack: () => setPage(page - 1),
            onNext: () => setPage(page + 1),
        },
    }
}
