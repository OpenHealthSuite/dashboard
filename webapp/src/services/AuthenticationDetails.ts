export async function getAuthDetails(fnFetch = fetch): Promise<{ userId: string }> {
  if (process.env.REACT_APP_DEV_USER_ID) {
      return { userId: process.env.REACT_APP_DEV_USER_ID }
  }
  // TODO: Not do this for every request
  // TODO: This is based on github - changes might be needed for oidc?
  const response = await fnFetch('/oauth2/userinfo')
  const details = await response.json()
  return { userId: details.user }
}