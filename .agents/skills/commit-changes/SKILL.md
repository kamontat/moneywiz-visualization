---
name: commit-changes
description: Create Git commits from local repository changes using Conventional Commits. Use when asked to commit changes, write commit messages, split a diff into multiple commits, or keep each commit scoped to a single functionality.
---

# Commit Changes

Create clear, reviewable commits from the current working tree.

## Workflow

1. Map current changes.
- Run `git status --short`.
- Run `git diff --name-only`.
- If staged files exist, inspect both staged and unstaged changes:
  `git diff --cached --name-only` and `git diff --name-only`.

2. Define commit groups by functionality.
- Group files by independent behavior or technical purpose.
- Use one group only when all changes serve one cohesive outcome.
- Split into multiple groups when changes are unrelated or only loosely
  related.
- If uncertain, prefer multiple smaller commits.

3. Draft Conventional Commit messages.
- Use `<type>(<scope>): <subject>` or `<type>: <subject>`.
- Keep subjects imperative and concise (target 72 chars max).
- Pick types from `references/conventional-commit-guide.md`.

4. Commit each group non-interactively.
- Stage one group at a time with `git add <file...>`.
- Verify staging with `git diff --cached --name-only` and
  `git diff --cached`.
- Commit with `git commit -m "<header>"` and optional body in a second
  `-m`.
- Repeat for each group until all intended changes are committed.

5. Verify and report.
- Run `git status --short` to confirm leftovers.
- Show created commits with `git log --oneline -n <count>`.
- Report commit hashes, subjects, and remaining files.

## Decision Rules

- Create more than one commit when the diff contains multiple
  functionality changes.
- Keep refactors separate from behavior changes when possible.
- Keep formatting-only changes separate unless inseparable.
- Do not create empty commits.
- Ask for confirmation before committing if grouping intent is
  ambiguous.

## Output Format

Return:

1. Commit plan (group -> files -> message)
2. Commands executed
3. Created commits (hash + subject)
4. Remaining changes

## References

- Conventional commit types and examples:
  `references/conventional-commit-guide.md`
