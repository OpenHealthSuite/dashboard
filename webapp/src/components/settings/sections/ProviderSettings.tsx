import { Card, CardContent, CardHeader } from "@mui/material";
import { useEffect, useState } from "react";
import {
  pacemeUserRouteGetRequest,
  pacemeUserRoutePostRequest,
} from "../../../services/PaceMeApiService";
import { Error, Pending } from "@mui/icons-material";

const providersRoot = "/providers";

export interface IProviderStatus {
  key: string;
  name: string;
  authenticated: boolean;
}

async function GetChallenge(key: string) {
  // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
  // Send user to retreived URL
  const challenge = await await pacemeUserRoutePostRequest<
    {},
    { authUrl: string }
  >([providersRoot, key, "start"].join("/"), {});
  if (challenge) {
    window.location.href = challenge.authUrl;
  }
}

export default function ProviderSettings() {
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
    <Card>
      <CardHeader title={"Data Providers"} />
      <CardContent>
        {isLoading && <Pending />}
        {isErrored && <Error />}
        {statuses && (
          <ul>
            {statuses.map((s) => (
              <li key={s.key}>
                {s.name} - {s.authenticated ? "Authed" : "Unauthed"}:{" "}
                <button onClick={() => GetChallenge(s.key)}>
                  Authenticate
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
