<#
Build Android APK (release) script placeholder.

Usage: .\scripts\build_android.ps1
#>
param(
	[string]$ApiBaseUrl = 'http://10.0.2.2:3000/api'
)

Write-Host "Building Android APK against $ApiBaseUrl..."
$flutter = (Get-Command flutter -ErrorAction SilentlyContinue).Source
if (-not $flutter -and (Test-Path 'C:\flutter\flutter\bin\flutter.bat')) { $flutter = 'C:\flutter\flutter\bin\flutter.bat' }
if (-not $flutter) { throw 'Flutter SDK not found. Add Flutter to PATH or set its location in this script.' }
Push-Location (Join-Path $PSScriptRoot '..\mobile')
& $flutter pub get
& $flutter build apk --release --dart-define=API_BASE_URL=$ApiBaseUrl
Pop-Location

Write-Host "APK output in mobile/build/app/outputs/flutter-apk/"
