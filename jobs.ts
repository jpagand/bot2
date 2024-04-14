import { assert, CosmWasmClient, Uint53 } from "./deps.ts";
import { chainHash, timeOfRound } from "./drand.ts";

interface Job {
  /// A RNG specific randomness source identifier, e.g. `drand:<network id>:<round>`
  source_id: string;
  // The channel the job came from and we have to send the response to
  channel: string;
  origin: string;
}

interface JobsResponse {
  jobs: Job[];
}

function parseRound(job: Job): number {
  const [sourceType, networkId, round] = job.source_id.split(":");
  assert(sourceType == "drand", "Source type must be 'drand'");
  assert(networkId == chainHash, "Got wrong chain hash in job");
  assert(round, "Round must be set");
  return Uint53.fromString(round).toNumber();
}

function formatDuration(durationInMs: number): string {
  const inSeconds = durationInMs / 1000;
  return `${inSeconds.toFixed(1)}s`;
}

export class JobsChecker {
  private readonly noisClient: CosmWasmClient;
  private readonly gateway: string;

  public constructor(
    noisClient: CosmWasmClient,
    gatewayAddress: string,
  ) {
    this.noisClient = noisClient;
    this.gateway = gatewayAddress;
  }

  /**
   * Checks gateway for pending jobs and returns the rounds of those jobs as a list
   */
  public async check(): Promise<number[]> {
    const queryLimit = 4;

    // Use jobs_asc because with jobs_desc all entries in the result might be in the (far) future,
    // leading to cases where the unprocesses jobs in the past are not processed anymore.
    const query = { jobs_asc: { offset: null, limit: queryLimit } };
    const { jobs }: JobsResponse = await this.noisClient.queryContractSmart(this.gateway, query);
    if (jobs.length === 0) return []; // Nothing to do for us

    const rounds = jobs.map(parseRound);
    const roundInfos = rounds.map((round) => {
      const due = timeOfRound(round) - Date.now();
      return `#${round} (due ${formatDuration(due)})`;
    });
    console.log(`Top ${queryLimit} pending jobs: %c${roundInfos.join(", ")}`, "color: orange");
    return rounds;
  }
}
