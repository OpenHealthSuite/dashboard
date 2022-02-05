import { Auth } from 'aws-amplify';

async function getAuthDetails(): Promise<{ userId: string, authHeader: string }> {
    let session = await Auth.currentSession()
    const userId: string = session.getIdToken().decodePayload().sub
    return { userId: userId, authHeader: `Bearer ${session.getIdToken().getJwtToken()}` }
}

// This might need to be moved to parents soon, but this'll do for now.
const usersRoot = '/users/'

export async function pacemeGetRequest<T>(path: string): Promise<T | undefined> {
    const authDetails = await getAuthDetails()
    const response = await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
        method: "GET",
        headers: {
            Authorization: authDetails.authHeader,
            "Content-Type": "application/json"
        }
    })

    return response.status === 200 ? await response.json() as T : undefined
}

export async function pacemePostRequest<T, R>(path: string, item: T): Promise<R> {
    const authDetails = await getAuthDetails()
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

export async function pacemePutRequest<T>(path: string, item: T) {
    const authDetails = await getAuthDetails()
    await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
        method: "PUT",
        headers: {
            Authorization: authDetails.authHeader,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
}

export async function pacemeDeleteRequest<T>(path: string, item: T) {
    const authDetails = await getAuthDetails()
    await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
        method: "DELETE",
        headers: {
            Authorization: authDetails.authHeader,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
}


export async function pacemeBodylessDeleteRequest(path: string) {
    const authDetails = await getAuthDetails()
    await fetch(process.env.REACT_APP_API_ROOT+usersRoot+authDetails.userId+path, { 
        method: "DELETE",
        headers: {
            Authorization: authDetails.authHeader,
            "Content-Type": "application/json"
        }
    })
}
