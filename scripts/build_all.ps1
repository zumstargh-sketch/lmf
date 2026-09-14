<#
Build all artifacts: Android APK and Windows app/installer

Usage: .\scripts\build_all.ps1
#>
param()

Write-Host "Building Android APK..."
.\scripts\build_android.ps1

Write-Host "Building Windows app..."
.\scripts\build_windows.ps1

Write-Host "All builds triggered (see individual scripts for output locations)."
