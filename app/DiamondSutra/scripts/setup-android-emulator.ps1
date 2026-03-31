#Requires -Version 5.1
<#
  Standalone Android emulator setup on Windows (no Android Studio UI).
  1) Installs SDK cmdline-tools if missing
  2) Installs emulator + platform-tools + one system image (API 34 x86_64)
  3) Accepts licenses
  4) Creates AVD "DiamondSutra_API34"
  5) Optionally starts the emulator

  Run in PowerShell (user session):
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # once, if scripts are blocked
    .\setup-android-emulator.ps1
    .\setup-android-emulator.ps1 -StartEmulator

  Prerequisites:
  - Enable CPU virtualization in BIOS/UEFI
  - Windows: turn on "Windows Hypervisor Platform" (optional but recommended) in
    Optional Features, or use Intel HAXM for older setups
#>
param(
    [switch] $StartEmulator,
    [string] $SdkRoot = ($env:ANDROID_SDK_ROOT, $env:ANDROID_HOME, "$env:LOCALAPPDATA\Android\Sdk" | Where-Object { $_ } | Select-Object -First 1)
)

$ErrorActionPreference = "Stop"

# sdkmanager needs JDK 11+ (Gradle builds often use 17). PATH may still point to Java 8.
if (-not $env:JAVA_HOME) {
    $candidates = @(
        "C:\jdk-18.0.2",
        "C:\Program Files\Java\jdk-17",
        "C:\Program Files\Java\jdk-21"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $env:JAVA_HOME = $c; break }
    }
    if (-not $env:JAVA_HOME -and (Test-Path "C:\Program Files\Eclipse Adoptium")) {
        $hit = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -Filter "jdk-*" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending | Select-Object -First 1
        if ($hit) { $env:JAVA_HOME = $hit.FullName }
    }
}
if ($env:JAVA_HOME) {
    $env:PATH = (Join-Path $env:JAVA_HOME "bin") + ";" + $env:PATH
    Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
} else {
    Write-Warning "Set JAVA_HOME to JDK 17+ if sdkmanager fails (Java 8 is too old)."
}

$CliToolsZipUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"
$ApiLevel = "34"
$ImagePkg = "system-images;android-$ApiLevel;google_apis;x86_64"
$AvdName = "DiamondSutra_API34"

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

if (-not (Test-Path $SdkRoot)) {
    New-Item -ItemType Directory -Path $SdkRoot -Force | Out-Null
}

$env:ANDROID_SDK_ROOT = $SdkRoot
$env:ANDROID_HOME = $SdkRoot

$sdkmanagerRel = "cmdline-tools\latest\bin\sdkmanager.bat"
$avdmanagerRel = "cmdline-tools\latest\bin\avdmanager.bat"
$sdkmanager = Join-Path $SdkRoot $sdkmanagerRel
$avdmanager = Join-Path $SdkRoot $avdmanagerRel
$emulator = Join-Path $SdkRoot "emulator\emulator.exe"

Write-Step "SDK root: $SdkRoot"

if (-not (Test-Path $sdkmanager)) {
    Write-Step "Installing command-line tools (sdkmanager / avdmanager)"
    $zip = Join-Path $env:TEMP "commandlinetools-win.zip"
    $extract = Join-Path $env:TEMP "android-cmdline-extract"
    if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
    New-Item -ItemType Directory -Path $extract -Force | Out-Null

    Write-Host "Downloading (about 150 MB)..."
    Invoke-WebRequest -Uri $CliToolsZipUrl -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $extract -Force

    $inner = Join-Path $extract "cmdline-tools"
    if (-not (Test-Path $inner)) {
        throw "Unexpected zip layout: expected folder 'cmdline-tools' under $extract"
    }
    $destLatest = Join-Path $SdkRoot "cmdline-tools\latest"
    if (Test-Path $destLatest) { Remove-Item $destLatest -Recurse -Force }
    New-Item -ItemType Directory -Path (Split-Path $destLatest -Parent) -Force | Out-Null
    Move-Item -Path $inner -Destination $destLatest
    Remove-Item $zip -Force -ErrorAction SilentlyContinue
    Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "cmdline-tools installed."
}

if (-not (Test-Path $sdkmanager)) { throw "sdkmanager still missing at $sdkmanager" }

Write-Step "Installing packages (first run may download several GB)"
# Non-interactive license acceptance
$packages = @(
    "platform-tools",
    "emulator",
    "platforms;android-$ApiLevel",
    $ImagePkg
)
$pkgArgs = $packages + @("--sdk_root=$SdkRoot")
& $sdkmanager @pkgArgs

Write-Step "Accepting licenses"
# Pipe 'y' repeatedly for all license prompts
$y = "y`n" * 120
$y | & $sdkmanager --licenses --sdk_root=$SdkRoot

Write-Step "Creating AVD: $AvdName (if it does not exist)"
$existing = & (Join-Path $SdkRoot "emulator\emulator.exe") -list-avds 2>$null
if ($existing -contains $AvdName) {
    Write-Host "AVD already exists."
} else {
    # --force skips interactive device profile questions when possible
    echo no | & $avdmanager create avd -n $AvdName -k $ImagePkg -d "pixel_6" --force --sdk_root=$SdkRoot
}

if (-not (Test-Path $emulator)) { throw "emulator.exe not found at $emulator" }

Write-Step "Done."
Write-Host "List AVDs:  `"$emulator`" -list-avds"
Write-Host "Start:    `"$emulator`" -avd $AvdName"
Write-Host "Install APK after boot:"
Write-Host "  `"$(Join-Path $SdkRoot 'platform-tools\adb.exe')`" install -r path\to\DiamondSutra.apk"

if ($StartEmulator) {
    Write-Step "Starting emulator (close window to stop)"
    Start-Process -FilePath $emulator -ArgumentList @("-avd", $AvdName) -WorkingDirectory (Split-Path $emulator)
}
