/**
 * @jest-environment jsdom
 */
import { v4 as uuidv4 } from "uuid"
import { getOrgHelper, ORG_SELECTION_LOCAL_STORAGE_KEY } from "./OrgHelper"

beforeEach(() => {
    const localStorageMock = (function () {
        let store = {}
        return {
            getItem: function (key) {
                return store[key]
            },
            setItem: function (key, value) {
                store[key] = value.toString()
            },
            clear: function () {
                store = {}
            },
            removeItem: function (key) {
                delete store[key]
            },
        }
    })()
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
})

afterEach(() => {
    localStorage.clear()
})

it("getter methods work", async () => {
    const orgs = createOrgs(10)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), null)

    // Positive cases
    for (let org of orgs) {
        expect(orgHelper.getOrg(org.orgId)).toStrictEqual(org)
    }
    expect(orgHelper.getOrgs().sort()).toEqual(orgs.sort())
    expect(orgHelper.getOrgIds().sort()).toEqual(orgs.map((org) => org.orgId).sort())

    // Negative cases
    const inheritedProperties = getAllProperties({})
    for (let notOrg of inheritedProperties) {
        expect(orgHelper.getOrg(notOrg)).toBeFalsy()
    }
    for (let i = 0; i < 100; i++) {
        expect(orgHelper.getOrg(uuidv4())).toBeFalsy()
    }
})

it("selecting an org calls into the provided function and local storage", async () => {
    const orgs = createOrgs(2)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const selectOrgFn = jest.fn()
    const orgHelper = getOrgHelper(jsOrgHelper, selectOrgFn, null)

    orgHelper.selectOrg(orgs[0].orgId)
    expect(localStorage.getItem(ORG_SELECTION_LOCAL_STORAGE_KEY)).toEqual(orgs[0].orgId)
    expect(selectOrgFn).toBeCalledWith(orgs[0].orgId)

    orgHelper.selectOrg(orgs[1].orgId)
    expect(localStorage.getItem(ORG_SELECTION_LOCAL_STORAGE_KEY)).toEqual(orgs[1].orgId)
    expect(selectOrgFn).toBeCalledWith(orgs[1].orgId)
})

it("getSelectedOrg returns the selected org", async () => {
    const orgs = createOrgs(2)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), orgs[1].orgId)

    expect(orgHelper.getSelectedOrg()).toEqual(orgs[1])
})

it("getNotSelectedOrgs returns the not selected orgs", async () => {
    const orgs = createOrgs(3)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), orgs[0].orgId)

    expect(orgHelper.getNotSelectedOrgs()).toEqual(orgs.slice(1))
})

it("getSelectedOrg returns the local storage value if nothing is set", async () => {
    const orgs = createOrgs(2)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), null)

    localStorage.setItem(ORG_SELECTION_LOCAL_STORAGE_KEY, orgs[1].orgId)

    expect(orgHelper.getSelectedOrg()).toEqual(orgs[1])
})

it("getSelectedOrg returns a deterministic value if nothing is set", async () => {
    const orgs = createOrgs(10)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), null)

    const firstValue = orgHelper.getSelectedOrg()
    for (let i = 0; i < 100; i++) {
        expect(orgHelper.getSelectedOrg()).toEqual(firstValue)
    }
})

it("getSelectedOrg returns null if nothing is set and inference is off", async () => {
    const orgs = createOrgs(2)
    const jsOrgHelper = createJsOrgHelper(orgs)
    const orgHelper = getOrgHelper(jsOrgHelper, jest.fn(), null)

    localStorage.setItem(ORG_SELECTION_LOCAL_STORAGE_KEY, orgs[1].orgId)

    expect(orgHelper.getSelectedOrg(false)).toBeFalsy()
})

function createJsOrgHelper(orgs) {
    let orgIdToOrgMemberInfo = {}
    for (let org of orgs) {
        orgIdToOrgMemberInfo[org.orgId] = org
    }
    return wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo)
}

function createOrgs(numOrgs) {
    let orgs = []
    for (let i = 0; i < numOrgs; i++) {
        orgs.push(createOrg())
    }
    return orgs
}

function createOrg() {
    return {
        orgId: uuidv4(),
        orgName: randomString(),
        userRole: choose(["Owner", "Admin", "Member"]),
    }
}

function randomString() {
    return (Math.random() + 1).toString(36).substring(3)
}

function choose(choices) {
    const index = Math.floor(Math.random() * choices.length)
    return choices[index]
}

// https://stackoverflow.com/questions/8024149/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object
function getAllProperties(obj) {
    let allProps = [],
        curr = obj
    do {
        const props = Object.getOwnPropertyNames(curr)
        props.forEach(function (prop) {
            if (allProps.indexOf(prop) === -1) {
                allProps.push(prop)
            }
        })
    } while ((curr = Object.getPrototypeOf(curr)))
    return allProps
}

function wrapOrgIdToOrgMemberInfo(orgIdToOrgMemberInfo) {
    return {
        getOrg(orgId) {
            if (orgIdToOrgMemberInfo.hasOwnProperty(orgId)) {
                return orgIdToOrgMemberInfo[orgId]
            } else {
                return undefined
            }
        },
        getOrgIds() {
            return Object.keys(orgIdToOrgMemberInfo)
        },
        getOrgs() {
            return Object.values(orgIdToOrgMemberInfo)
        },
        getOrgByName(orgName) {
            for (const orgMemberInfo of Object.values(orgIdToOrgMemberInfo)) {
                if (orgMemberInfo.orgName === orgName || orgMemberInfo.urlSafeOrgName === orgName) {
                    return orgMemberInfo
                }
            }
            return undefined
        },
    }
}
