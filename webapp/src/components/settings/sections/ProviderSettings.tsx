import { Button, Card, CardContent, CardHeader } from "@mui/material";
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
        {statuses &&
          statuses.map((s) => (
            <Button
              variant={s.authenticated ? "contained" : "outlined"}
              onClick={() => GetChallenge(s.key)}
            >
              {s.name}
              {" - "}
              {s.authenticated ? "Reauthenticate" : "Authenticate"}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
}
