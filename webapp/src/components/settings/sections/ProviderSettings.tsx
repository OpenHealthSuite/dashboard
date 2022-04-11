import { Card, CardContent, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';
import { getProviderStatuses, startChallenge, IProviderStatus } from '../../../services/ProvidersService'
import { LoadingCard } from '../../shared/LoadingCard';

async function GetChallenge(key: string) {
  // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
  // Send user to retreived URL
  const challenge = await startChallenge(key)
  if (challenge) {
    window.location.href = challenge.authUrl
  }
}

export default function ProviderSettings() {
  const [statuses, setStatuses] = useState<IProviderStatus[]>([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      const getStatuses = async () => {
          // TODO: Graceful error handling with toast
          setStatuses((await getProviderStatuses()) || [])
          setLoading(false)
      }
      getStatuses()
  }, [setLoading, setStatuses])

  return (<Card>
      <CardHeader title={"Data Providers"} />
      <CardContent>
          <LoadingCard loading={loading}>
              <ul>
                  {statuses.map(s => <li key={s.key}>{s.name} - {s.authenticated ? 'Authed' : 'Unauthed'}: <button onClick={() => GetChallenge(s.key)}>Authenticate</button></li>)}
              </ul>
          </LoadingCard></CardContent>
  </Card>)
}
