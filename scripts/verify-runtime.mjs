import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function listSkillNames() {
  return fs.readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((skillName) => fs.existsSync(path.join(ROOT, 'skills', skillName, 'SKILL.md')))
    .sort();
}

const pluginManifest = readJson('plugin.json');
const pluginName = pluginManifest.name;
const skillNames = listSkillNames();

function executableNames(command) {
  if (process.platform !== 'win32' || /\.[^./\\]+$/.test(command)) {
    return [command];
  }

  const pathExt = (process.env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM')
    .split(';')
    .filter(Boolean);

  return [command, ...pathExt.map((extension) => `${command}${extension}`)];
}

function hasCommand(command) {
  for (const directory of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const candidate of executableNames(command)) {
      const executablePath = path.join(directory, candidate);

      try {
        fs.accessSync(executablePath, fs.constants.X_OK);
        return true;
      } catch {
        if (process.platform === 'win32' && fs.existsSync(executablePath)) {
          return true;
        }
      }
    }
  }

  return false;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

function outputIncludesToken(output, expectedToken) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => line.split(/\s+/).includes(expectedToken));
}

function outputIncludesQualifiedSkill(output, qualifiedSkillName) {
  return (
    outputIncludesToken(output, qualifiedSkillName) ||
    outputIncludesToken(output, `/${qualifiedSkillName}`)
  );
}

function verifyCopilotRuntime() {
  if (!hasCommand('copilot')) {
    console.log('Skipping Copilot runtime verification: `copilot` is not installed.');
    return;
  }

  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-runtime-'));

  try {
    console.log('Verifying Copilot plugin install/list/uninstall in an isolated config dir...');

    run('copilot', ['plugin', 'install', '--config-dir', configDir, ROOT]);

    const installed = run('copilot', ['plugin', 'list', '--config-dir', configDir]);
    assert.ok(
      outputIncludesToken(installed, pluginName),
      `Expected Copilot plugin list to include ${pluginName}.\n${installed}`,
    );

    const loadedSkills = run('copilot', [
      '-p',
      'List the plugin-qualified skill names loaded from this plugin, one per line and nothing else.',
      '--plugin-dir',
      ROOT,
      '--allow-all-tools',
      '--output-format',
      'text',
    ]);

    for (const skillName of skillNames) {
      const qualifiedSkillName = `${pluginName}:${skillName}`;
      assert.ok(
        outputIncludesQualifiedSkill(loadedSkills, qualifiedSkillName),
        `Expected Copilot runtime output to include ${qualifiedSkillName}.\n${loadedSkills}`,
      );
    }

    run('copilot', ['plugin', 'uninstall', '--config-dir', configDir, pluginName]);
  } finally {
    fs.rmSync(configDir, { recursive: true, force: true });
  }
}

function verifyClaudePlugin() {
  if (!hasCommand('claude')) {
    console.log('Skipping Claude plugin validation: `claude` is not installed.');
    return;
  }

  console.log('Validating Claude plugin manifest and structure...');
  run('claude', ['plugin', 'validate', ROOT], { stdio: 'inherit' });

  console.log('Verifying Claude plugin loading in session-only mode...');
  const loadedSkills = run('claude', [
    '-p',
    '--plugin-dir',
    ROOT,
    '--output-format',
    'text',
    'List the plugin-qualified skill names loaded from this plugin, one per line and nothing else.',
  ]);

  for (const skillName of skillNames) {
    const qualifiedSkillName = `${pluginName}:${skillName}`;
    assert.ok(
      outputIncludesQualifiedSkill(loadedSkills, qualifiedSkillName),
      `Expected Claude runtime output to include ${qualifiedSkillName}.\n${loadedSkills}`,
    );
  }
}

verifyCopilotRuntime();
verifyClaudePlugin();

console.log('Runtime verification completed.');
