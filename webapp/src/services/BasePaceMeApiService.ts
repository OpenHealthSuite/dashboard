import { Auth } from 'aws-amplify';

async function getAuthDetails(): Promise<{ userId: string, authHeader: string }> {
    let session = await Auth.currentSession()
    const userId: string = session.getIdToken().decodePayload().sub
    return { userId: userId, authHeader: `Bearer ${session.getIdToken().getJwtToken()}` }
}

// This might need to be moved to parents soon, but this'll do for now.
const usersRoot = '/users/'

// TODO: The undefined responses on errors should generate toasts...
export async function pacemeGetRequest<T>(path: string): Promise<T | undefined> {
    const authDetails = await getAuthDetails()
    try {
        const response = await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
            method: "GET",
            headers: {
                Authorization: authDetails.authHeader,
                "Content-Type": "application/json"
            }
        })
        return response.status === 200 ? await response.json() as T : undefined
    } catch {
        return undefined
    }

}

export async function pacemePostRequest<T, R>(path: string, item: T): Promise<R | undefined> {
    const authDetails = await getAuthDetails()
    try {
        const response = await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
            method: "POST",
            headers: {
                Authorization: authDetails.authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        })
        return await response.json() as R
    }
    catch {
        return undefined
    }
}

export async function pacemePutRequest<T>(path: string, item: T):  Promise<boolean> {
    const authDetails = await getAuthDetails()
    try {
        await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
            method: "PUT",
            headers: {
                Authorization: authDetails.authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        })
        return true
    } catch {
        return false
    }
}

export async function pacemeDeleteRequest<T>(path: string, item: T):  Promise<boolean> {
    const authDetails = await getAuthDetails()
    try {
        await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
            method: "DELETE",
            headers: {
                Authorization: authDetails.authHeader,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        })
        return true
    } catch {
        return false
    }
}


export async function pacemeBodylessDeleteRequest(path: string):  Promise<boolean> {
    const authDetails = await getAuthDetails()
    try {
        await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
            method: "DELETE",
            headers: {
                Authorization: authDetails.authHeader,
                "Content-Type": "application/json"
            }
        })        
        return true
    } catch {
        return false
    }
}
