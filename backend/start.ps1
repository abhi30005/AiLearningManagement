$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
  throw "Backend virtual environment not found. Create it first, then install backend/requirements.txt."
}

$reloadExcludes = @(
  ".venv\*",
  ".venv/*",
  "__pycache__\*",
  "__pycache__/*",
  ".logs\*",
  ".logs/*",
  "*.pyc"
)

$uvicornArgs = @("main:app", "--reload", "--host", "127.0.0.1", "--port", "8000")
foreach ($pattern in $reloadExcludes) {
  $uvicornArgs += @("--reload-exclude", $pattern)
}

& ".\.venv\Scripts\python.exe" -m uvicorn @uvicornArgs
