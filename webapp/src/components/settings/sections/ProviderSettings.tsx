import { Card, CardContent, CardHeader } from '@mui/material';
import { useEffect, useState } from 'react';
import { getProviderStatuses, startChallenge, IProviderStatus } from '../../../services/ProvidersService'
import { LoadingIndicator } from '../../shared/LoadingIndicator';

async function GetChallenge(key: string) {
  // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
  // Send user to retreived URL
  const { authUrl } = await startChallenge(key)

  window.location.href = authUrl
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
          <LoadingIndicator loading={loading}>
              <ul>
                  {statuses.map(s => <li key={s.key}>{s.name} - {s.authenticated ? 'Authed' : 'Unauthed'}: <button onClick={() => GetChallenge(s.key)}>Authenticate</button></li>)}
              </ul>
          </LoadingIndicator></CardContent>
  </Card>)
}
