import { spawn, spawnSync } from 'node:child_process'
import process from 'node:process'

const isWindows = process.platform === 'win32'
const npmCommand = isWindows ? 'npm.cmd' : 'npm'

function commandExists(command) {
  const checker = isWindows ? 'where' : 'which'
  const result = spawnSync(checker, [command], { stdio: 'ignore' })
  return result.status === 0
}

function detectPython() {
  const candidates = ['py', 'python', 'python3']
  for (const candidate of candidates) {
    if (commandExists(candidate)) {
      return candidate
    }
  }

  console.error('No Python executable found (tried: py, python, python3).')
  console.error('Install Python and retry, or run frontend only with: npm run dev:frontend')
  process.exit(1)
}

const pythonCommand = detectPython()

function startProcess(command, args, options = {}) {
  if (isWindows) {
    const commandLine = [command, ...args].join(' ')
    return spawn('cmd.exe', ['/d', '/s', '/c', commandLine], {
      ...options,
      stdio: 'inherit',
    })
  }

  return spawn(command, args, {
    ...options,
    stdio: 'inherit',
  })
}

const frontend = startProcess(npmCommand, ['run', 'dev:frontend'])

const backend = startProcess(
  pythonCommand,
  ['-m', 'uvicorn', 'api.main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'],
  {
    cwd: 'ai',
  }
)

let shuttingDown = false

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) return
  shuttingDown = true

  if (!frontend.killed) {
    frontend.kill(signal)
  }
  if (!backend.killed) {
    backend.kill(signal)
  }

  setTimeout(() => process.exit(0), 300)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

frontend.on('exit', (code) => {
  if (!shuttingDown) {
    if (!backend.killed) backend.kill('SIGTERM')
    process.exit(code ?? 0)
  }
})

backend.on('exit', (code) => {
  if (!shuttingDown) {
    if (!frontend.killed) frontend.kill('SIGTERM')
    process.exit(code ?? 0)
  }
})
