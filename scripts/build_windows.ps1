<#
Build Windows release and create installer (placeholder).

Usage: .\scripts\build_windows.ps1
#>
param(
	[string]$ApiBaseUrl = 'http://localhost:3000/api'
)

Write-Host "Building Windows app against $ApiBaseUrl..."
$flutter = (Get-Command flutter -ErrorAction SilentlyContinue).Source
if (-not $flutter -and (Test-Path 'C:\flutter\flutter\bin\flutter.bat')) { $flutter = 'C:\flutter\flutter\bin\flutter.bat' }
if (-not $flutter) { throw 'Flutter SDK not found. Add Flutter to PATH or set its location in this script.' }
Push-Location (Join-Path $PSScriptRoot '..\mobile')
& $flutter pub get
& $flutter build windows --release --dart-define=API_BASE_URL=$ApiBaseUrl
Pop-Location

# Inno Setup or other installer creation steps should go here.
Write-Host "Windows build output in mobile/build/windows/runner/Release/"
