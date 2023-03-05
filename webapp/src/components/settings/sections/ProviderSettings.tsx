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
    <div>
      <div>Data Providers</div>
      <div>
        {isLoading && "Pending"}
        {isErrored && "Error"}
        {statuses &&
          statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => GetChallenge(s.key)}
            >
              {s.name}
              {" - "}
              {s.authenticated ? "Reauthenticate" : "Authenticate"}
            </button>
          ))}
      </div>
    </div>
  );
}
