import { useEffect, useState } from 'react';
import { getProviderStatuses, startChallenge, IProviderStatus } from '../../services/ProvidersService'

export default function SettingsDashboard() {
  const [statuses, setStatuses] = useState<IProviderStatus[]>([]);
  const [loading, setLoading] = useState(true)

  const getStatuses = async () => {
      setLoading(false)
      // TODO: Graceful error handling with toast
      setStatuses((await getProviderStatuses()) || [])
  }

  useEffect(() => {
      if (loading) {
          getStatuses()
      }
  }, [loading])

  return <ul>
      {statuses.map(s => <li key={s.key}>{s.name} - {s.authenticated ? 'Authed':'Unauthed'}: <button onClick={() => GetChallenge(s.key)}>Authenticate</button></li>)}
      </ul>
}


async function GetChallenge(key: string) {
  // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
  // Send user to retreived URL
  const { authUrl } = await startChallenge(key)

  window.location.href = authUrl
}
