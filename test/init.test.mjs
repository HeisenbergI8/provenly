// The installer's one hard requirement: NEVER CLOBBER. A target repo may already carry the user's own
// hooks, permissions and settings, and an installer that replaces them is worse than one that does
// nothing — because the damage is silent and only shows up the next time a guard fails to fire.

import { strict as assert } from 'node:assert'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { after, test } from 'node:test'
import { join } from 'node:path'

import { REPO, makeRepo } from './helpers.mjs'
import { ensureGitignore, mergeSettings, scriptOf } from '../bin/harness-init.mjs'

const repos = []
const fresh = options => {
  const repo = makeRepo(options)

  repos.push(repo)

  return repo
}

after(() => repos.forEach(repo => repo.cleanup()))

const install = (root, ...args) =>
  execFileSync('node', [join(REPO, 'bin/harness-init.mjs'), root, ...args], { encoding: 'utf8', stdio: 'pipe' })

// ── mergeSettings ──────────────────────────────────────────────────────────────

const INCOMING = {
  hooks: {
    Stop: [{ hooks: [{ type: 'command', command: 'node', args: ['.claude/harness/claim-check.mjs'] }] }],
    PostToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node', args: ['.claude/harness/loop-breaker.mjs'] }] }]
  }
}

test('scriptOf reads both hook spellings', () => {
  assert.equal(scriptOf({ args: ['.claude/harness/a.mjs'] }), '.claude/harness/a.mjs')
  assert.equal(scriptOf({ command: 'node .claude/harness/b.mjs' }), '.claude/harness/b.mjs')
  assert.equal(scriptOf({ command: 'echo hi' }), null)
})

test('merging into an empty settings file installs everything', () => {
  const merged = mergeSettings(null, INCOMING)

  assert.equal(merged.hooks.Stop[0].hooks.length, 1)
  assert.equal(merged.hooks.PostToolUse[0].matcher, 'Bash')
})

test('merging is IDEMPOTENT — running the installer twice adds nothing', () => {
  const once = mergeSettings(null, INCOMING)
  const twice = mergeSettings(once, INCOMING)

  assert.deepEqual(twice, once)
})

test("an existing user hook on the same event is preserved, not replaced", () => {
  const existing = {
    hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node', args: ['.claude/scripts/my-own-hook.mjs'] }] }] }
  }

  const merged = mergeSettings(existing, INCOMING)
  const scripts = merged.hooks.Stop[0].hooks.map(scriptOf)

  assert.deepEqual(scripts, ['.claude/scripts/my-own-hook.mjs', '.claude/harness/claim-check.mjs'])
})

test('a different matcher gets its own group rather than being merged in', () => {
  const existing = {
    hooks: { PostToolUse: [{ matcher: 'Write', hooks: [{ type: 'command', command: 'node', args: ['.claude/x.mjs'] }] }] }
  }

  const merged = mergeSettings(existing, INCOMING)

  assert.equal(merged.hooks.PostToolUse.length, 2)
  assert.deepEqual(merged.hooks.PostToolUse.map(group => group.matcher), ['Write', 'Bash'])
})

test('everything outside hooks is left exactly as the user had it', () => {
  const existing = {
    permissions: { deny: ['Bash(sudo:*)'] },
    includeCoAuthoredBy: false,
    hooks: {}
  }

  const merged = mergeSettings(existing, { ...INCOMING, includeCoAuthoredBy: true, model: 'opus' })

  assert.deepEqual(merged.permissions, { deny: ['Bash(sudo:*)'] })
  assert.equal(merged.includeCoAuthoredBy, false, 'an existing key is never overridden')
  assert.equal(merged.model, 'opus', 'a key the user does not have may be added')
})

// ── gitignore ──────────────────────────────────────────────────────────────────

test('the state directory is ignored, once', () => {
  const first = ensureGitignore('node_modules\n', '.claude/.harness/')

  assert.match(first, /\.claude\/\.harness\//)
  assert.equal(ensureGitignore(first, '.claude/.harness/'), null, 'already present means no change')
})

test('gitignore handles a missing trailing newline and an empty file', () => {
  assert.match(ensureGitignore('node_modules', '.claude/.harness/'), /node_modules\n/)
  assert.match(ensureGitignore('', '.claude/.harness/'), /\.claude\/\.harness\//)
})

// ── End to end ─────────────────────────────────────────────────────────────────

test('a fresh install lands the scripts, a config and the hooks', () => {
  const repo = fresh({ packageJson: { name: 'x', scripts: { verify: 'jest', typecheck: 'tsc --noEmit' } } })

  for (const file of ['config.mjs', 'record-activity.mjs', 'claim-check.mjs', 'verify-gate.mjs', 'loop-breaker.mjs']) {
    assert.ok(existsSync(repo.path(`.claude/harness/${file}`)), `missing ${file}`)
  }

  const config = JSON.parse(repo.read('harness.config.json'))

  assert.equal(config.commands.verify, 'npm run verify')
  assert.equal(config.commands.verifyFast, 'npm run typecheck')

  assert.match(repo.read('.gitignore'), /\.claude\/\.harness\//)
  assert.ok(JSON.parse(repo.read('.claude/settings.json')).hooks.Stop)
})

test('a fresh install lands the agents, skills and the conventions scaffold', () => {
  const repo = fresh({ config: null })

  for (const file of [
    '.claude/agents/architect.md',
    '.claude/agents/tester.md',
    '.claude/agents/auditor.md',
    '.claude/agents/change-auditor.md',
    '.claude/skills/implement-plan/SKILL.md',
    '.claude/skills/debug-ladder/SKILL.md',
    '.claude/skills/lesson-keeper/SKILL.md',
    '.claude/skills/grill-me/SKILL.md',
    'CONVENTIONS.md'
  ]) {
    assert.ok(existsSync(repo.path(file)), `missing ${file}`)
  }
})

// Prompts get tuned in place. Overwriting a file somebody adjusted three weeks ago is INVISIBLE damage:
// nothing errors, and behaviour drifts back to stock without anyone noticing.
test('agents, skills and CONVENTIONS.md are NEVER overwritten, even with --force', () => {
  const repo = fresh({ config: null })

  writeFileSync(repo.path('.claude/agents/architect.md'), 'MY TUNED ARCHITECT')
  writeFileSync(repo.path('.claude/skills/debug-ladder/SKILL.md'), 'MY TUNED SKILL')
  writeFileSync(repo.path('CONVENTIONS.md'), 'MY REAL CONVENTIONS')

  install(repo.root, '--force')
  install(repo.root, '--upgrade')

  assert.equal(repo.read('.claude/agents/architect.md'), 'MY TUNED ARCHITECT')
  assert.equal(repo.read('.claude/skills/debug-ladder/SKILL.md'), 'MY TUNED SKILL')
  assert.equal(repo.read('CONVENTIONS.md'), 'MY REAL CONVENTIONS')
})

test('every shipped agent and skill has the frontmatter that makes it loadable', () => {
  for (const [dir, file] of [
    ['agents', 'architect.md'],
    ['agents', 'tester.md'],
    ['agents', 'auditor.md'],
    ['agents', 'change-auditor.md'],
    ['agents', 'merge-conflict-resolver.md'],
    ['skills/implement-plan', 'SKILL.md'],
    ['skills/lean-code', 'SKILL.md'],
    ['skills/debug-ladder', 'SKILL.md'],
    ['skills/lesson-keeper', 'SKILL.md'],
    ['skills/lessons-review', 'SKILL.md'],
    ['skills/build', 'SKILL.md'],
    ['skills/git-committer', 'SKILL.md'],
    ['skills/ticket-writer', 'SKILL.md'],
    ['skills/grill-me', 'SKILL.md'],
    ['skills/wait-what', 'SKILL.md'],
    ['skills/ui-ux-design', 'SKILL.md']
  ]) {
    const text = readFileSync(join(REPO, 'template/.claude', dir, file), 'utf8')

    assert.match(text, /^---\n/, `${dir}/${file} has no frontmatter block`)
    assert.match(text, /\nname: [\w-]+\n/, `${dir}/${file} has no name`)
    assert.match(text, /\ndescription: /, `${dir}/${file} has no description`)
  }
})

// The read-only agents must have no write tools at all — that is what makes "an auditor cannot edit
// what it audits" structural rather than a promise.
test('both auditors ship without Edit or Write', () => {
  for (const agent of ['auditor.md', 'change-auditor.md']) {
    const frontmatter = readFileSync(join(REPO, 'template/.claude/agents', agent), 'utf8').split('---')[1]
    const tools = frontmatter.match(/\ntools: (.+)/)?.[1] ?? ''

    assert.ok(tools, `${agent} must declare a tools list`)
    assert.ok(!/\b(Edit|Write|NotebookEdit)\b/.test(tools), `${agent} must not have write tools: ${tools}`)
  }
})

test('detection reads the real package.json and picks a runner', () => {
  const repo = fresh({ packageJson: { name: 'x', packageManager: 'pnpm@9', scripts: { check: 'vitest run' } } })

  writeFileSync(repo.path('pnpm-lock.yaml'), '')
  install(repo.root, '--force')

  assert.equal(JSON.parse(repo.read('harness.config.json')).commands.verify, 'pnpm run check')
})

test('an existing config is kept unless --force is given', () => {
  const repo = fresh({ config: { commands: { verify: 'MINE', verifyFast: 'MINE' } }, packageJson: { name: 'x', scripts: { verify: 'jest' } } })

  install(repo.root)
  assert.equal(JSON.parse(repo.read('harness.config.json')).commands.verify, 'MINE')

  install(repo.root, '--force')
  assert.equal(JSON.parse(repo.read('harness.config.json')).commands.verify, 'npm run verify')
})

test('--dry-run writes nothing', () => {
  const repo = fresh({ config: null })
  const before = repo.read('.claude/settings.json')

  install(repo.root, '--dry-run')

  assert.ok(!existsSync(repo.path('harness.config.json')), '--dry-run must not create the config')
  assert.equal(repo.read('.claude/settings.json'), before)
})

test('--upgrade refreshes scripts and leaves config and settings alone', () => {
  const repo = fresh({ config: { commands: { verify: 'MINE', verifyFast: 'MINE' } } })

  writeFileSync(repo.path('.claude/harness/config.mjs'), '// stale\n')

  const settingsBefore = repo.read('.claude/settings.json')

  install(repo.root, '--upgrade')

  assert.ok(repo.read('.claude/harness/config.mjs').length > 100, 'the stale script must be replaced')
  assert.equal(JSON.parse(repo.read('harness.config.json')).commands.verify, 'MINE')
  assert.equal(repo.read('.claude/settings.json'), settingsBefore)
})

test('an unknown project type installs cleanly with null commands', () => {
  const repo = fresh({ config: null })

  const output = install(repo.root, '--force')
  const config = JSON.parse(repo.read('harness.config.json'))

  assert.equal(config.commands.verify, null)
  assert.match(output, /Could not identify the project type|Detected project type/)
})

test('the shipped template settings are valid JSON and register every gate', () => {
  const settings = JSON.parse(readFileSync(join(REPO, 'template/.claude/settings.json'), 'utf8'))
  const scripts = Object.values(settings.hooks)
    .flat()
    .flatMap(group => group.hooks ?? [])
    .map(scriptOf)

  for (const expected of ['record-activity', 'claim-check', 'verify-gate', 'loop-breaker']) {
    assert.ok(
      scripts.some(script => script?.includes(expected)),
      `${expected} is not registered in the shipped settings.json`
    )
  }
})

// ── The npx entry path ─────────────────────────────────────────────────────────
//
// `npx github:HeisenbergI8/provenly init` is the documented install, and both halves of it were
// broken in ways that produced NO OUTPUT AT ALL: the bin file was not executable, so npx could not
// launch it, and `init` was parsed as the target directory, so a working invocation installed into a
// new subdirectory called `init` while the repo the user was standing in got nothing.
//
// Both failures are silent, which is why they are pinned here rather than left to a manual check.

// The first line is `provenly -> <target>  (dry run — ...)`, which is the only place the
// resolved target is observable from outside.
const resolvedTarget = (cwd, ...args) => {
  const out = execFileSync('node', [join(REPO, 'bin/harness-init.mjs'), '--dry-run', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  })

  return /provenly -> (.+?)\s{2}/.exec(out)?.[1] ?? null
}

test('a bare `init` is a subcommand, and installs into the current directory', () => {
  const repo = fresh()

  assert.equal(resolvedTarget(repo.root, 'init'), repo.root)
  assert.notEqual(resolvedTarget(repo.root, 'init'), join(repo.root, 'init'))
})

test('with no arguments at all the target is still the current directory', () => {
  const repo = fresh()

  assert.equal(resolvedTarget(repo.root), repo.root)
})

test('an explicit path is still the target, not swallowed as a subcommand', () => {
  const repo = fresh()
  const other = fresh()

  assert.equal(resolvedTarget(repo.root, other.root), other.root)
})

// The escape hatch: only a BARE `init` is the subcommand. Someone whose target really is called `init`
// can still say so with a path.
test('an explicit path that happens to be named init is a target', () => {
  const repo = fresh()

  assert.equal(resolvedTarget(repo.root, './init'), join(repo.root, 'init'))
})

test('a target given after `init` wins over the current directory', () => {
  const repo = fresh()
  const other = fresh()

  assert.equal(resolvedTarget(repo.root, 'init', other.root), other.root)
})

// THE COMMITTED MODE IS WHAT SHIPS. npx installs from a clone, so the mode in the index is the mode the
// user gets — and without the executable bit npx exits silently with no output and no error, which is
// the least diagnosable failure this project can have.
test('the bin file is committed executable, or npx cannot launch it', () => {
  const entry = execFileSync('git', ['ls-files', '--stage', 'bin/harness-init.mjs'], {
    cwd: REPO,
    encoding: 'utf8',
    stdio: 'pipe'
  })

  assert.match(entry, /^100755 /, `bin/harness-init.mjs is committed as ${entry.split(' ')[0]}, not 100755`)
})

// THE SILENT ONE. npm links a bin as `node_modules/.bin/<name>`, so under npx `process.argv[1]` is
// that symlink rather than this file. An entrypoint guard that compares FILENAMES is false there:
// main() never runs, nothing is written, and the process exits 0 having printed nothing — which is
// indistinguishable from a successful install right up until you look for the .claude directory.
//
// Driven through a symlink because that is the only way the bug is visible; running the file directly
// passes either way, which is exactly why it survived.
test('the installer runs when invoked through a symlinked bin, as npx does', () => {
  const repo = fresh()
  const link = join(repo.root, 'provenly')

  symlinkSync(join(REPO, 'bin/harness-init.mjs'), link)

  const out = execFileSync(link, ['--dry-run', 'init'], { cwd: repo.root, encoding: 'utf8', stdio: 'pipe' })

  assert.match(out, /provenly ->/, 'invoked through a bin symlink, the installer printed nothing')
  // `update` rather than `create`, because the fixture has the harness installed already. Either verb
  // proves the same thing: main() ran and walked the template.
  assert.match(out, /(create|update)\s+\.claude\/harness\//)
})

// The other half of the same guard: being imported must NOT install anything. This file imports the
// module at the top, so a guard that fired on import would have run an install into the repo on every
// test run.
test('importing the module does not run an install', async () => {
  const module = await import('../bin/harness-init.mjs')

  assert.ok(typeof module.mergeSettings === 'function')
  assert.ok(!existsSync(join(REPO, 'init')), 'importing the installer created a stray directory')
})

// ── The optional ui-ux-design skill ────────────────────────────────────────────
//
// Installed only where there is a UI to design. Its description triggers on any screen work, so in a CLI
// it is a prompt loaded every session for nothing — and in a UI project, skipping it is a missing skill
// nobody notices. Both halves are tested, on repos built by the real installer.

const UI_SKILL = '.claude/skills/ui-ux-design/SKILL.md'
const UI_CARD = '.claude/skills/ui-ux-design/references/project.md'

test('a React app gets the ui-ux-design skill', () => {
  const repo = fresh({ packageJson: { name: 'x', dependencies: { react: '^19.0.0' } } })

  assert.ok(existsSync(repo.path(UI_SKILL)))
  assert.ok(existsSync(repo.path(UI_CARD)))
})

test('a UI framework in devDependencies counts too', () => {
  const repo = fresh({ packageJson: { name: 'x', devDependencies: { svelte: '^5.0.0' } } })

  assert.ok(existsSync(repo.path(UI_SKILL)))
})

// The project this skill was written in: React lives in apps/web, and the root package.json has none.
test('a pnpm monorepo with the UI in a workspace gets the skill', () => {
  const repo = fresh({ packageJson: { name: 'mono', private: true } })

  execFileSync('mkdir', ['-p', repo.path('apps/web'), repo.path('packages/shared')])
  writeFileSync(repo.path('pnpm-workspace.yaml'), 'packages:\n  - "apps/*"\n  - "packages/*"\n')
  writeFileSync(repo.path('apps/web/package.json'), JSON.stringify({ dependencies: { next: '15.0.0' } }))
  writeFileSync(repo.path('packages/shared/package.json'), JSON.stringify({ dependencies: { zod: '3.0.0' } }))

  assert.ok(!existsSync(repo.path(UI_SKILL)), 'precondition: the first install saw no workspace')

  install(repo.root, '--no-probe')

  assert.ok(existsSync(repo.path(UI_SKILL)))
})

test('npm workspaces are read as well', () => {
  const repo = fresh({ packageJson: { name: 'mono', private: true, workspaces: ['site'] } })

  execFileSync('mkdir', ['-p', repo.path('site')])
  writeFileSync(repo.path('site/package.json'), JSON.stringify({ dependencies: { vue: '3.0.0' } }))
  install(repo.root, '--no-probe')

  assert.ok(existsSync(repo.path(UI_SKILL)))
})

test('a Node project with no UI framework does NOT get the skill', () => {
  const repo = fresh({ packageJson: { name: 'cli', dependencies: { commander: '^12.0.0', reactor: '1.0.0' } } })

  assert.ok(!existsSync(repo.path('.claude/skills/ui-ux-design')))
  // ...and the other skills are unaffected by the skip.
  assert.ok(existsSync(repo.path('.claude/skills/lean-code/SKILL.md')))
})

test('a repo with no package.json at all does NOT get the skill', () => {
  const repo = fresh({ config: null })

  assert.ok(!existsSync(repo.path('.claude/skills/ui-ux-design')))
})

test('the skip is reported, with the flag that overrides it', () => {
  const repo = fresh({ packageJson: { name: 'cli' } })
  const out = install(repo.root, '--dry-run')

  assert.match(out, /skip\s+\.claude\/skills\/ui-ux-design\/.*--ui/)
})

test('--ui installs it where nothing was detected; --no-ui withholds it where something was', () => {
  const forced = fresh({ config: null })

  install(forced.root, '--no-probe', '--ui')
  assert.ok(existsSync(forced.path(UI_SKILL)))

  const withheld = fresh({ config: null })

  writeFileSync(withheld.path('package.json'), JSON.stringify({ dependencies: { react: '19.0.0' } }))
  install(withheld.root, '--no-probe', '--no-ui')
  assert.ok(!existsSync(withheld.path('.claude/skills/ui-ux-design')))
})

// A tailored copy — the pedia-dental case — must not be topped up with the stock scaffold. Placeholder
// text beside someone's real answers is worse than either alone, because the skill follows both.
test('an existing ui-ux-design directory is kept WHOLE — nothing is added to it', () => {
  const repo = fresh({ packageJson: { name: 'x', dependencies: { react: '19.0.0' } } })

  execFileSync('rm', ['-rf', repo.path('.claude/skills/ui-ux-design')])
  execFileSync('mkdir', ['-p', repo.path('.claude/skills/ui-ux-design')])
  writeFileSync(repo.path(UI_SKILL), 'MY TAILORED DESIGN SKILL')

  install(repo.root, '--force', '--no-probe')
  install(repo.root, '--upgrade')

  assert.equal(repo.read(UI_SKILL), 'MY TAILORED DESIGN SKILL')
  assert.ok(!existsSync(repo.path(UI_CARD)), 'the stock project card was added beside a tailored skill')
})

// The point of the generic skill is that it carries no project in it. This is the regression that would
// quietly undo that: one copied paragraph from the project it was extracted from.
test('the shipped ui-ux-design skill names no project, stack path or domain', () => {
  const dir = join(REPO, 'template/.claude/skills/ui-ux-design')
  const files = ['SKILL.md', ...['project', 'heuristics-and-laws', 'visual-system', 'interaction-patterns', 'accessibility', 'audit-rubric', 'domain-risk'].map(name => `references/${name}.md`)]
  const leak = /pnpm (dev|run)|apps\/web|globals\.css|form-field\.tsx|app-shell|formatPeso|₱|\bpeso\b|pedia|figtree|sonner|react-big-calendar|\bmsw\b|ComingSoon|patient|tooth|teeth|dental|dentist|clinic|chairside|allerg|guardian/i

  for (const file of files) {
    const text = readFileSync(join(dir, file), 'utf8')

    assert.ok(!leak.test(text), `${file} mentions "${text.match(leak)?.[0]}"`)
  }
})

test('the selftest warns while the design card is still the scaffold, and stops once it is filled', () => {
  const repo = fresh({ packageJson: { name: 'x', dependencies: { react: '19.0.0' } } })
  const selftest = () => spawnSync('node', ['.claude/harness/selftest.mjs'], { cwd: repo.root, encoding: 'utf8' }).stdout

  assert.match(selftest(), /ui-ux-design\/references\/project\.md is still the scaffold/)

  writeFileSync(repo.path(UI_CARD), '# Project\n\n## Users and contexts\n\nSupport agents, on calls.\n')

  assert.doesNotMatch(selftest(), /ui-ux-design\/references\/project\.md/)
})
