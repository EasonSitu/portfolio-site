$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$pnpmPath = "C:\Users\Eason\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
$nodePath = "C:\Users\Eason\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

if (-not (Test-Path -LiteralPath $pnpmPath)) {
  throw "找不到 Codex bundled pnpm：$pnpmPath"
}

if (-not (Test-Path -LiteralPath (Join-Path $nodePath "node.exe"))) {
  throw "找不到 Codex bundled Node：$nodePath"
}

$env:PATH = "$nodePath;$env:PATH"

Push-Location $projectRoot
try {
  & $pnpmPath dev @args
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
  Pop-Location
}
