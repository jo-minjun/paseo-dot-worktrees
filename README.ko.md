# paseo-dot-worktrees

[English](README.md) | 한국어

워크트리를 `~/.paseo/worktrees/<해시>/` 대신 각 프로젝트 안의 `.worktrees/`에 만드는 [Paseo](https://paseo.sh) 플러그인입니다.
새 브랜치는 오래됐을 수 있는 로컬 브랜치가 아니라 최신 `origin/<기준 브랜치>`에서 시작합니다.

```
~/Projects/app/
├── .worktrees/
│   ├── .gitignore      # "*", 플러그인이 만든다
│   ├── tidy-fox/
│   └── feature-login/
└── src/
```

## 동작 방식

플러그인은 `worktree.create.before` 훅에서 워크트리 경로를 `<저장소 루트>/.worktrees/<워크트리 이름>`으로 바꿉니다.

- 워크트리 이름은 Paseo가 기본 위치에 쓰는 이름과 같습니다. 슬래시는 하이픈으로 바뀝니다.
- 저장소 루트는 원본 체크아웃입니다. 그래서 워크트리 안에서 새 워크트리를 만들어도 중첩되지 않습니다.
- `.worktrees/.gitignore`가 없으면 플러그인이 `*` 한 줄로 만듭니다. 그래서 워크트리가 `git status`에 나오지 않고, 프로젝트의 `.gitignore`는 바뀌지 않습니다.
- Paseo는 이 워크트리도 기본 위치의 워크트리처럼 목록에 보여 주고, 복원하고, 보관합니다.
- 새 브랜치를 만들 때 `origin/main`이 있으면 플러그인이 기준 `main`을 `origin/main`으로 바꿉니다. 그러면 Paseo가 그 브랜치를 fetch한 뒤 워크트리를 만듭니다. 앱의 기준 브랜치 선택기는 항상 `main`처럼 이름만 보내고, Paseo는 그 이름으로 오래됐을 수 있는 로컬 `main`을 먼저 씁니다. 로컬에만 있는 기준 브랜치는 바꾸지 않습니다.

## 설치

Paseo 0.14.0-beta.1 이상이 필요하고, 플러그인이 켜져 있어야 합니다(**Settings → Plugins → Enable plugins**).

```bash
paseo plugin install git:jo-minjun/paseo-dot-worktrees
```

## 제한

- 새로 만드는 워크트리만 `.worktrees/`를 씁니다. 이미 있는 워크트리는 원래 위치에 남습니다.
- `.gitignore`를 읽지 않는 도구(일부 IDE 인덱서, 테스트 실행기, 빌드 도구)는 `.worktrees/`를 검사할 수 있습니다. 필요하면 그 도구에서 제외하세요.
- Paseo는 이미 있는 경로를 거부합니다. `.worktrees/<이름>`이 남아 있으면 지운 뒤에 같은 이름의 워크트리를 만드세요.
- 플러그인은 로컬 브랜치를 일부러 고른 경우와 기본값을 구분하지 못합니다. `origin/<기준 브랜치>`가 있으면 새 브랜치는 그 원격 브랜치에서 시작하므로, 로컬 브랜치에만 있는 커밋은 들어가지 않습니다. 로컬 브랜치를 쓰려면 CLI에서 `--base refs/heads/<브랜치>`를 넘기세요.

## 라이선스

[MIT](LICENSE)
