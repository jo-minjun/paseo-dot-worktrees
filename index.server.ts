import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PluginServerContext } from "@getpaseo/plugin/server";

const WORKTREES_DIR = ".worktrees";

export default function contribute(server: PluginServerContext) {
  return server.addHook("worktree.create.before", async ({ request }) => {
    // sourceCheckout은 워크트리 안에서 만들 때 그 워크트리를 가리킨다. 중첩되지 않게 원본 저장소 루트를 쓴다
    const worktreesDir = join(request.repoRoot, WORKTREES_DIR);
    await ignoreAll(worktreesDir);
    return { ...request, path: join(worktreesDir, request.slug.replaceAll("/", "-")) };
  });
}

// 저장소의 .gitignore를 고치지 않아도 워크트리가 git status에 나오지 않게 한다
async function ignoreAll(dir: string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, ".gitignore"), "*\n", { flag: "wx" }).catch((error) => {
    if (error.code !== "EEXIST") throw error;
  });
}
