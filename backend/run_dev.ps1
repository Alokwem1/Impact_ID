# PowerShell helper to run backend in development mode with .env.dev
# Ensure we run from the script directory so Python can import the local 'app' package
Set-Location -Path $PSScriptRoot

$env:ENVIRONMENT='development'
$env:DEBUG='true'
# Make sure Python can import the backend 'app' package from this folder
$env:PYTHONPATH = $(if ($env:PYTHONPATH) { "$PSScriptRoot;$env:PYTHONPATH" } else { "$PSScriptRoot" })
# Load additional variables from .env.dev if present
if (Test-Path .env.dev) {
  Get-Content .env.dev | ForEach-Object {
    if ($_ -match '^(?<key>[A-Za-z_][A-Za-z0-9_]*)=(?<val>.*)$') {
      $k = $Matches['key']
      $v = $Matches['val']
      if ($v) {
        # Correctly set environment variable using dynamic name
        Set-Item -Path "Env:$k" -Value $v
      }
    }
  }
}
Write-Host 'Running Impact ID API in development mode using .env.dev'
# Prefer the specific Python path if it exists; otherwise fall back to py/python
if (Test-Path "C:/Users/SIXTUS/AppData/Local/Programs/Python/Python313/python.exe") {
  & "C:/Users/SIXTUS/AppData/Local/Programs/Python/Python313/python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}
elseif (Get-Command py -ErrorAction SilentlyContinue) {
  py -3.13 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}
else {
  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}
