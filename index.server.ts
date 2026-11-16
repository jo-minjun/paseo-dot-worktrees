import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import type { PluginServerContext } from "@getpaseo/plugin/server";

const WORKTREES_DIR = ".worktrees";
const REMOTE = "origin";

const run = promisify(execFile);

export default function contribute(server: PluginServerContext) {
  return server.addHook("worktree.create.before", async ({ request }) => {
    // sourceCheckout은 워크트리 안에서 만들 때 그 워크트리를 가리킨다. 중첩되지 않게 원본 저장소 루트를 쓴다
    const worktreesDir = join(request.repoRoot, WORKTREES_DIR);
    await ignoreAll(worktreesDir);
    const placed = { ...request, path: join(worktreesDir, request.slug.replaceAll("/", "-")) };
    if (placed.kind !== "branch-off") return placed;
    return { ...placed, baseRef: await preferRemote(request.repoRoot, placed.baseRef) };
  });
}

// 저장소의 .gitignore를 고치지 않아도 워크트리가 git status에 나오지 않게 한다
async function ignoreAll(dir: string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, ".gitignore"), "*\n", { flag: "wx" }).catch((error) => {
    if (error.code !== "EEXIST") throw error;
  });
}

// 앱의 기준 브랜치 선택기는 origin/을 떼고 보내고, Paseo는 같은 이름의 로컬 브랜치를 먼저 쓴다.
// origin/<브랜치>로 넘기면 Paseo가 그 브랜치를 fetch한 뒤 원격의 최신 커밋에서 만든다
async function preferRemote(repoRoot: string, baseRef: string) {
  if (baseRef.startsWith("refs/") || baseRef.startsWith(`${REMOTE}/`)) return baseRef;
  try {
    await run("git", ["rev-parse", "--verify", "--quiet", `refs/remotes/${REMOTE}/${baseRef}`], {
      cwd: repoRoot,
    });
    return `${REMOTE}/${baseRef}`;
  } catch {
    return baseRef;
  }
}
