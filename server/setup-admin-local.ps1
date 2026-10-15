$ErrorActionPreference = 'Stop'

$securePassword = $null
$passwordPointer = [IntPtr]::Zero
$plainPassword = $null

try {
  $serverDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
  Set-Location -LiteralPath $serverDirectory

  if (-not (Test-Path -LiteralPath '.env')) {
    throw 'server/.env is missing. Configure ADMIN_EMAIL before provisioning the local admin.'
  }

  $envContent = [System.IO.File]::ReadAllText((Join-Path $serverDirectory '.env'))
  if ($envContent -notmatch '(?m)^ADMIN_EMAIL=\S+@\S+\.\S+\s*$') {
    throw 'Set a valid ADMIN_EMAIL in server/.env before provisioning the local admin.'
  }

  $securePassword = Read-Host 'Enter your 8-digit local admin password' -AsSecureString
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  if ($plainPassword -notmatch '^\d{8}$') {
    throw 'The local admin password must contain exactly 8 digits.'
  }

  $env:ADMIN_PASSWORD = $plainPassword

  & node '.\provision-admin-local.js'
  if ($LASTEXITCODE -ne 0) {
    throw 'Admin provisioning failed. Review the message above and try again.'
  }
} finally {
  Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
  if ($passwordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
  $plainPassword = $null
  if ($securePassword) {
    $securePassword.Dispose()
  }
}
