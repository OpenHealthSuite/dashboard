import { pacemeGetRequest } from "./PaceMeApiService"

export async function getAuthDetails(fnPacemeGetRequest = pacemeGetRequest): Promise<{ userId: string }> {
  // TODO: Not do this for every request
  return fnPacemeGetRequest<{ userId: string }>('/whoami')
}