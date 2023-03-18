import { Flex, FormControl, FormLabel, Heading, Select } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { pacemeUserRouteGetRequest, pacemeUserRoutePutRequest, pacemeGetRequest } from '../../../services/PaceMeApiService'

type UserProviderSettings = {
  [key: string]: string
}

type AvailableProviders = {
  [key: string]: string[]
}

const deCamelCaser = (str: string) => {
  const words = str.split(/(?=[A-Z])/);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()
  return words.join(' ');
}

export const ProviderSettingsControl: React.FC<{}> = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<AvailableProviders | undefined>(undefined)
  const [userProviderSettings, setUserProviderSettings] = useState<UserProviderSettings>({})

  useEffect(() => {
    Promise.allSettled([
      pacemeGetRequest<AvailableProviders>('/providers/available'),
      pacemeUserRouteGetRequest<UserProviderSettings>('/userSettings/provider_settings')
    ]).then(([available, user]) => {
      if (available.status === 'rejected') {
        setError(true);
        setLoading(false);
        return;
      }
      if (user.status === 'fulfilled') {
        setUserProviderSettings(user.value)
      }
      setAvailableProviders(available.value)
      setError(false);
      setLoading(false);
    })
  }, [setLoading, setError, setAvailableProviders, setUserProviderSettings])

  const changeHandler = useCallback((ev: React.ChangeEvent<HTMLSelectElement>, key: string) => {
    userProviderSettings[key] = ev.target.value;
    setUserProviderSettings(userProviderSettings);
    pacemeUserRoutePutRequest('/userSettings/provider_settings', userProviderSettings);
  },[userProviderSettings, setUserProviderSettings])

  return <Flex flexDirection={"column"} alignItems="center">
    <Heading as="h5" marginBottom={'0.5em'}>Provider Configuration</Heading>
    <Flex wrap={'wrap'} justifyContent="center">
      {loading && <>Loading</>}
      {!loading && error && <>Something went wrong</>}
      {!loading && !error && availableProviders && Object.entries(availableProviders)
        .map(([key, options]) => (<FormControl maxWidth={300} key={key}>
          <FormLabel>{deCamelCaser(key)}</FormLabel>
          <Select placeholder='Select provider' 
            onChange={(ev) => changeHandler(ev, key)}
            defaultValue={(userProviderSettings[key])}>
            {options.map(option => <option value={option} key={option}>{deCamelCaser(option)}</option>)}
          </Select>
        </FormControl>))}
    </Flex>
  </Flex>
}