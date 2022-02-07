import { 
    pacemeGetRequest,
    pacemePostRequest
} from './BasePaceMeApiService';

const providersRoot = '/providers'

export interface IProviderStatus {
    key: string,
    name: string,
    authenticated: boolean
}

export async function getProviderStatuses(): Promise<IProviderStatus[] | undefined> {
    return await pacemeGetRequest<IProviderStatus[]>([providersRoot].join('/'))
}

export async function startChallenge(providerKey: string): Promise<{ authUrl: string } | undefined> {
    return await pacemePostRequest<{}, { authUrl: string }>([providersRoot, providerKey, 'start'].join('/'), {})
}

export async function redeemCode(providerKey: string, code: string): Promise<{} | undefined> {
    return await pacemePostRequest<{ code: string }, {}>([providersRoot, providerKey, 'redeem'].join('/'), { code })
}