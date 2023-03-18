import { API_ROOT } from "../secrets";
import { getAuthDetails } from "./AuthenticationDetails";

export async function pacemeUserRouteGetRequest<T>(
  path: string,
  fnGetAuthDetails = getAuthDetails,
  fnPacemeGetRequest = pacemeGetRequest
): Promise<T> {
  const response = await fnGetAuthDetails();
  return fnPacemeGetRequest<T>("/users/" + response.userId + path);
}

export async function pacemeUserRoutePostRequest<R, T>(
  path: string,
  body: R,
  fnGetAuthDetails = getAuthDetails,
  fnPacemePostRequest = pacemePostRequest
): Promise<T> {
  const response = await fnGetAuthDetails();
  return fnPacemePostRequest<R, T>("/users/" + response.userId + path, body);
}

export async function pacemeUserRoutePutRequest<R, T>(
  path: string,
  body: R,
  fnGetAuthDetails = getAuthDetails,
  fnPacemePutRequest = pacemePutRequest
): Promise<T> {
  const response = await fnGetAuthDetails();
  return fnPacemePutRequest<R, T>("/users/" + response.userId + path, body);
}

export async function pacemeGetRequest<T>(
  path: string,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<T> {
  const response = await fnFetch(apiRoot + path);
  if (response.status === 200) {
    return (await response.json()) as T;
  } else {
    if ([401, 403].includes(response.status)) {
      window.location.reload()
    }
    throw new Error(`HTTP Status ${response.status}: Error retrieving data`);
  }
}

export async function pacemePostRequest<R, T>(
  path: string,
  body: R,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<T> {
  const response = await fnFetch(apiRoot + path, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  if (response.status === 200) {
    return (await response.json()) as T;
  } else {
    if ([401, 403].includes(response.status)) {
      window.location.reload()
    }
    throw new Error(`HTTP Status ${response.status}: Error retrieving data`);
  }
}

export async function pacemePutRequest<R, T>(
  path: string,
  body: R,
  fnFetch = fetch,
  apiRoot = API_ROOT
): Promise<T> {
  const response = await fnFetch(apiRoot + path, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  if (response.status === 200) {
    return (await response.json()) as T;
  } else {
    if ([401, 403].includes(response.status)) {
      window.location.reload()
    }
    throw new Error(`HTTP Status ${response.status}: Error retrieving data`);
  }
}
