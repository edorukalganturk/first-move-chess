param([Parameter(Mandatory=$true)][string]$PlanPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$plan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $synth.SelectVoice($plan.voice)
    $synth.Rate = [int]$plan.rate
    $synth.Volume = 100
    foreach ($clip in $plan.clips) {
        $synth.SetOutputToWaveFile($clip.path)
        $synth.Speak([string]$clip.text)
        $synth.SetOutputToNull()
    }
} finally {
    $synth.Dispose()
}
