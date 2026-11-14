---
title: Sync a docs folder into a Caplo knowledge base
description: Keeps a knowledge base in step with a folder in this repository, by hand or from CI, with caplo knowledge sync.
---
Goal: keep the Caplo knowledge base <KNOWLEDGE_BASE_NAME> in step with the folder <DOCS_DIR> in this repository, so an agent answers from the same documents the team maintains here.

Read these pages first:
- https://docs.caplo.si/agents/knowledge.md
- https://docs.caplo.si/reference/cli/knowledge.md
- https://docs.caplo.si/cli/ci-cd.md (only if you set up CI)

Steps:
1. Check the CLI and the workspace: run `caplo auth status`. If it is not signed in, ask me to run `caplo auth login`; never ask for or handle my password.
2. Check the folder. Supported types are .txt .md .markdown .html .pdf .docx .png .jpg .jpeg .webp, up to 25 MiB each. Every file name must be unique across the whole tree, because the knowledge base names documents by file name. Hidden files and other types are skipped. Report any duplicates or oversized files and stop until I decide.
3. If the knowledge base does not exist yet (`caplo knowledge list`), create it: `caplo knowledge create "<KNOWLEDGE_BASE_NAME>" --owner "<OWNER_TEAM>" --description "<WHAT_IT_COVERS>"`. Add `--audience verified_customer` only if I say the content is for signed-in customers only.
4. Preview the sync: `caplo knowledge sync "<KNOWLEDGE_BASE_NAME>" <DOCS_DIR> --dry-run`. Show me the uploads and removals.
5. After I approve the preview, run the sync without `--dry-run`. Ask me before passing `--approve`, `--publish` or `--yes`: approving skips reviewing the extracted text in the console, publishing makes a new version, and `--yes` removes documents whose files are gone without asking.
6. If I want CI to keep it in sync, add a job that runs on changes under <DOCS_DIR> on the default branch: `caplo knowledge sync "<KNOWLEDGE_BASE_NAME>" <DOCS_DIR> --approve --publish --yes`. Authenticate it with an API key in the CI secret store as CAPLO_API_KEY, and set CAPLO_WORKSPACE to the workspace ID. The key needs the agents:publish scope to approve and publish.

Verify:
- `caplo knowledge get "<KNOWLEDGE_BASE_NAME>"` lists every file from the folder, approved, and a newest version that is ready.
- Tell me that agents already published keep the knowledge version their release pinned; they use the new version only after their next release.

Rules:
- Never paste API keys or tokens into files, commits, logs or this chat. CI reads the key from its secret store.
- Do not publish a knowledge version or remove documents without my explicit go-ahead.
- Do not change agents or publish agent releases as part of this task.
