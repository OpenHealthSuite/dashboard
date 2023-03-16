import { Container, Heading, UnorderedList, Text, Button, ListItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  pacemeUserRouteGetRequest,
  pacemeUserRoutePostRequest,
} from "../../../services/PaceMeApiService";

const providersRoot = "/providers";

export interface IProviderStatus {
  key: string;
  name: string;
  authenticated: boolean;
}

async function GetChallenge(key: string) {
  const challenge = await await pacemeUserRoutePostRequest<
    {},
    { authUrl: string }
  >([providersRoot, key, "start"].join("/"), {});
  if (challenge) {
    window.location.href = challenge.authUrl;
  }
}

export default function ProviderAuthenticationSettings() {
  const [statuses, setStatuses] = useState<IProviderStatus[]>();
  const [isLoading, setLoading] = useState(true);
  const [isErrored, setError] = useState(false);

  useEffect(() => {
    pacemeUserRouteGetRequest<IProviderStatus[]>([providersRoot].join("/"))
      .then(setStatuses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [setLoading, setError, setStatuses]);

  return (
    <Container maxWidth="420px">
      <Heading as="h5">Data Providers</Heading>
        {isLoading && <Text>Pending</Text>}
        {isErrored && <Text>Error</Text>}
        {statuses &&<UnorderedList listStyleType="none" margin="0">
        
          {statuses.map((s) => (
            <ListItem>
              <Button
                key={s.key}
                size="sm"
                onClick={() => GetChallenge(s.key)}
              >
                {s.name}
                {" - "}
                {s.authenticated ? "Reauthenticate" : "Authenticate"}
              </Button>
            </ListItem>
          ))}
        </UnorderedList>}
    </Container>
  );
}
