import { API_ROOT } from "../secrets";
import { getAuthDetails } from "./AuthenticationDetails";

export async function pacemeUserRouteGetRequest<T>(
  path: string,
  fnGetAuthDetails = getAuthDetails,
  fnPacemeGetRequest = pacemeGetRequest
): Promise<T> {
  const response = await fnGetAuthDetails();
  return fnPacemeGetRequest<T>('/users/' + response.userId + path)
}

export async function pacemeGetRequest<T>(
  path: string,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<T> {
  const response = await fnFetch(apiRoot + path);
  if (response.status === 200) {
    return await response.json() as T;
  } else {
    throw new Error(`HTTP Status ${response.status}: Error retrieving data`);
  }
}
