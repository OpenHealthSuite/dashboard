import { Auth } from 'aws-amplify';

async function getAuthHeader(): Promise<string> {
    let session = await Auth.currentSession()
    return `Bearer ${session.getIdToken().getJwtToken()}`
}

export async function pacemeGetRequest<T>(path: string): Promise<T> {
    const response = await fetch(process.env.REACT_APP_API_ROOT+path, { 
        method: "GET",
        headers: {
            Authorization: await getAuthHeader(),
            "Content-Type": "application/json"
        }
    })
    return await response.json() as T
}

export async function pacemePostRequest<T, R>(path: string, item: T): Promise<R> {
    const response = await fetch(process.env.REACT_APP_API_ROOT+path, { 
        method: "POST",
        headers: {
            Authorization: await getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
    return await response.json() as R
}

export async function pacemePutRequest<T>(path: string, item: T) {
    await fetch(process.env.REACT_APP_API_ROOT+path, { 
        method: "PUT",
        headers: {
            Authorization: await getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
}

export async function pacemeDeleteRequest<T>(path: string, item: T) {
    await fetch(process.env.REACT_APP_API_ROOT+path, { 
        method: "DELETE",
        headers: {
            Authorization: await getAuthHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
}


export async function pacemeBodylessDeleteRequest(path: string) {
    await fetch(process.env.REACT_APP_API_ROOT+path, { 
        method: "DELETE",
        headers: {
            Authorization: await getAuthHeader(),
            "Content-Type": "application/json"
        }
    })
}
