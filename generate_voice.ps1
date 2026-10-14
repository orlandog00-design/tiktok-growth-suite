param(
    [string]$text = "Stop using your current class in Warzone right now. This broken SMG melts in 420 milliseconds.",
    [string]$output = "sample\test_voice.wav",
    [string]$gender = "Male"
)

$outDir = Split-Path -Parent $output
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
if ($gender -eq "Female") {
    $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
} else {
    $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Male)
}
$synth.Rate = 1 # Slightly faster pace for TikTok
$synth.SetOutputToWaveFile($output)
$synth.Speak($text)
$synth.Dispose()
Write-Host "Audio generated successfully: $output ($( (Get-Item $output).Length ) bytes)"
