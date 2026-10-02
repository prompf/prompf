
const modules = import.meta.glob('./Prompf.v*.svx');

export const availableVersions = Object.keys(modules)
  .map((path) => path.match(/Prompf\.v(\d+)\.svx$/)?.[1])
  .filter((v): v is string => Boolean(v));

export async function loadVersion(v: string) {
  const key = `./Prompf.v${v}.svx`;
  const loader = modules[key];
  if (!loader) throw new Error(`Unknown version: ${v}`);
  return (await loader() as { default: any }).default;
}
type Commit = { sha: string; commit: { committer: { date: string } } };

let latestCommit: Promise<Commit> | undefined;

const ghOrgRepo = 'prompf/prompf'

async function fetchCommit(sha?: string): Promise<Commit> {
  const endpoint = sha
    ? `https://api.github.com/repos/${ghOrgRepo}/commits/${sha}`
    : `https://api.github.com/repos/${ghOrgRepo}/commits?per_page=1`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Could not fetch commit time: ${response.status}`);
  const result = await response.json() as Commit | Commit[];
  return Array.isArray(result) ? result[0] : result;
}

export async function getCommitInfo(version: string): Promise<{ time: string; url: string }> {
  const shaJson: { [key: string]: string } = (await import('./sha.json')).default;
  const sha: string | undefined = shaJson[version];
  const commit = sha
    ? await fetchCommit(sha)
    : await (latestCommit ??= fetchCommit());

  return {
    time: commit.commit.committer.date,
    url: `https://github.com/${ghOrgRepo}/commit/${commit.sha}`,
  };
}
