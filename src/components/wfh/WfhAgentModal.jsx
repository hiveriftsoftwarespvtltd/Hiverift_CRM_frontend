import { useState, useEffect } from 'react';
import { monitoringAPI } from '../../api';
import {
  Laptop, ShieldCheck, Download, Copy, Check, RefreshCw, X, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function WfhAgentModal({ isOpen, onClose, onConnected }) {
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [statusText, setStatusText] = useState('Waiting for HiveRift Agent to connect...');

  useEffect(() => {
    if (!isOpen) return;

    fetchToken();
    const interval = setInterval(checkDeviceStatus, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchToken = async () => {
    setLoading(true);
    try {
      const res = await monitoringAPI.generateToken();
      setTokenData(res.data?.data);
    } catch (err) {
      console.error('Failed to generate pairing token:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDeviceStatus = async () => {
    try {
      const res = await monitoringAPI.getDeviceStatus();
      if (res.data?.data?.isConnected) {
        setIsConnected(true);
        setStatusText('Agent Connected & Active!');
        setTimeout(() => {
          if (onConnected) onConnected();
          if (onClose) onClose();
        }, 2000);
      }
    } catch {}
  };

  const handleCopyToken = () => {
    if (!tokenData?.pairingToken) return;
    navigator.clipboard.writeText(tokenData.pairingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [downloaded, setDownloaded] = useState(false);

  function toUtf16LeBase64(str) {
    const bytes = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      bytes[i * 2] = code & 0xff;
      bytes[i * 2 + 1] = (code >> 8) & 0xff;
    }
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const handleDownloadBatch = () => {
    if (!tokenData?.pairingToken) return;
    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'https://onboarding.hiverift.com/onboarding_api/api/v1';
    // const serverUrl = 'http://localhost:5000/api/v1';

    const psCode = `$serverUrl = '${serverUrl}'
$token = '${token}'
$agentDir = "$env:APPDATA\\HiveRiftAgent"
$configFile = "$agentDir\\config.json"
$psFile = "$agentDir\\hiverift-agent.ps1"
$vbsFile = "$agentDir\\start-silent.vbs"

if (-not (Test-Path $agentDir)) {
    New-Item -ItemType Directory -Path $agentDir -Force | Out-Null
}

Write-Host "[*] Contacting HiveRift CRM Server at $serverUrl..." -ForegroundColor Cyan

# 1. Register device
$compName = $env:COMPUTERNAME
$osDesc = (Get-CimInstance Win32_OperatingSystem).Caption
$regBody = @{ pairingToken = $token; deviceName = $compName; os = $osDesc; agentVersion = '1.0.0' } | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$serverUrl/monitoring/device/register" -Method Post -ContentType 'application/json' -Body $regBody
    $cfg = @{ serverUrl = $serverUrl; deviceId = $res.data.deviceId; deviceSecret = $res.data.deviceSecret; employeeName = $res.data.employeeName; department = $res.data.department }
    $cfg | ConvertTo-Json | Set-Content -Path $configFile -Encoding UTF8
    Write-Host "[✓] Successfully Paired for $($res.data.employeeName) ($($res.data.department))!" -ForegroundColor Green
    Write-Host "[✓] Device ID: $($res.data.deviceId)" -ForegroundColor Green
} catch {
    Write-Host "[*] Pairing note: $($_.Exception.Message)" -ForegroundColor Yellow
    if (Test-Path $configFile) {
        $cfg = Get-Content -Path $configFile -Raw | ConvertFrom-Json
        Write-Host "[*] Using existing paired config for $($cfg.employeeName)" -ForegroundColor Green
    }
}

# 2. Write the Background Agent Daemon script
$daemonCode = @'
$serverUrl = '__SERVER_URL__'
$agentDir = "$env:APPDATA\\HiveRiftAgent"
$configFile = "$agentDir\\config.json"

if (-not (Test-Path $configFile)) { exit 1 }
$cfg = Get-Content -Path $configFile -Raw | ConvertFrom-Json
$deviceId = $cfg.deviceId
$deviceSecret = $cfg.deviceSecret

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class Win32Helper {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    [DllImport("user32.dll")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    [StructLayout(LayoutKind.Sequential)] public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
    public static uint GetIdleSeconds() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        if (GetLastInputInfo(ref lii)) {
            uint tick = (uint)Environment.TickCount;
            return (tick - lii.dwTime) / 1000;
        }
        return 0;
    }
}
"@

function Get-ActiveWindow {
    $hwnd = [Win32Helper]::GetForegroundWindow()
    if ($hwnd -eq [IntPtr]::Zero) { return @{ AppName = 'Desktop'; ProcessName = 'explorer'; Title = ''; Category = 'other' } }
    $sb = New-Object System.Text.StringBuilder 512
    [Win32Helper]::GetWindowText($hwnd, $sb, 512) | Out-Null
    $title = $sb.ToString()
    $pId = 0
    [Win32Helper]::GetWindowThreadProcessId($hwnd, [ref]$pId) | Out-Null
    $procName = 'explorer'
    if ($pId -gt 0) {
        try { $procName = (Get-Process -Id $pId -ErrorAction SilentlyContinue).ProcessName } catch {}
    }
    $appName = $procName
    $cat = 'productivity'

    if ($procName -like '*chrome*' -or $procName -like '*msedge*' -or $procName -like '*firefox*' -or $procName -like '*brave*') {
        if ($title -like '*WhatsApp*') { $appName = 'WhatsApp Web'; $cat = 'communication' }
        elseif ($title -like '*Facebook*' -or $title -like '*fb.com*') { $appName = 'Facebook'; $cat = 'browsing' }
        elseif ($title -like '*YouTube*') { $appName = 'YouTube'; $cat = 'browsing' }
        elseif ($title -like '*Instagram*') { $appName = 'Instagram'; $cat = 'browsing' }
        elseif ($title -like '*LinkedIn*') { $appName = 'LinkedIn'; $cat = 'browsing' }
        elseif ($title -like '*Twitter*' -or $title -like '*X.com*') { $appName = 'Twitter / X'; $cat = 'browsing' }
        elseif ($title -like '*Gmail*' -or $title -like '*Outlook*') { $appName = 'Email (Gmail/Outlook)'; $cat = 'communication' }
        elseif ($title -like '*HiveRift*') { $appName = 'HiveRift CRM'; $cat = 'productivity' }
        elseif ($title -like '*GitHub*' -or $title -like '*GitLab*' -or $title -like '*Stack Overflow*') { $appName = 'Developer Portal'; $cat = 'development' }
        elseif ($title -like '*Canva*') { $appName = 'Canva Design'; $cat = 'productivity' }
        elseif ($procName -like '*msedge*') { $appName = 'Microsoft Edge'; $cat = 'browsing' }
        elseif ($procName -like '*firefox*') { $appName = 'Mozilla Firefox'; $cat = 'browsing' }
        else { $appName = 'Google Chrome'; $cat = 'browsing' }
    }
    elseif ($procName -like '*code*') { $appName = 'Visual Studio Code'; $cat = 'development' }
    elseif ($procName -like '*teams*') { $appName = 'Microsoft Teams'; $cat = 'communication' }
    elseif ($procName -like '*excel*') { $appName = 'Microsoft Excel'; $cat = 'productivity' }
    elseif ($procName -like '*winword*') { $appName = 'Microsoft Word'; $cat = 'productivity' }
    elseif ($procName -like '*slack*') { $appName = 'Slack'; $cat = 'communication' }
    elseif ($procName -like '*notepad*') { $appName = 'Notepad'; $cat = 'productivity' }
    elseif ($procName -like '*postman*') { $appName = 'Postman'; $cat = 'development' }

    return @{ AppName = $appName; ProcessName = $procName; Title = $title; Category = $cat }
}

$lastHb = [DateTime]::MinValue
$lastSync = [DateTime]::MinValue
$sliceStart = [DateTime]::UtcNow

while ($true) {
    try {
        $win = Get-ActiveWindow
        $idleSec = [Win32Helper]::GetIdleSeconds()
        $status = if ($idleSec -gt 300) { 'idle' } else { 'active' }
        $now = [DateTime]::UtcNow

        # 1. Send Heartbeat every 15 seconds
        if (($now - $lastHb).TotalSeconds -ge 15) {
            $hbBody = @{ deviceId = $deviceId; deviceSecret = $deviceSecret; status = $status; currentApp = $win.AppName; windowTitle = $win.Title; idleSeconds = $idleSec } | ConvertTo-Json
            try {
                Invoke-RestMethod -Uri "$serverUrl/monitoring/heartbeat" -Method Post -ContentType 'application/json' -Body $hbBody -TimeoutSec 5 | Out-Null
                $lastHb = $now
            } catch {}
        }

        # 2. Activity session sync every 15-20 seconds for continuous live analytics
        $elapsedSec = ($now - $sliceStart).TotalSeconds
        if ($elapsedSec -ge 15) {
            $durationMins = [Math]::Round($elapsedSec / 60, 2)

            $sessions = @(
                @{
                    appName = $win.AppName
                    processName = $win.ProcessName
                    windowTitle = $win.Title
                    category = $win.Category
                    startTime = $sliceStart.ToString('o')
                    endTime = $now.ToString('o')
                    durationMinutes = $durationMins
                }
            )

            $syncBody = @{ deviceId = $deviceId; deviceSecret = $deviceSecret; sessions = $sessions } | ConvertTo-Json -Depth 5
            try {
                Invoke-RestMethod -Uri "$serverUrl/monitoring/activity/sync" -Method Post -ContentType 'application/json' -Body $syncBody -TimeoutSec 5 | Out-Null
                $sliceStart = $now
            } catch {}
        }
    } catch {}
    Start-Sleep -Seconds 3
}
'@.Replace('__SERVER_URL__', $serverUrl)

[System.IO.File]::WriteAllText($psFile, $daemonCode, [System.Text.Encoding]::UTF8)

# 3. Write VBS Silent Runner with safe newline concatenation
$vbsContent = 'Set WshShell = CreateObject("WScript.Shell")' + [Environment]::NewLine + 'WshShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & WshShell.ExpandEnvironmentStrings("%APPDATA%\HiveRiftAgent\hiverift-agent.ps1") & """", 0, False'
[System.IO.File]::WriteAllText($vbsFile, $vbsContent, [System.Text.Encoding]::UTF8)

# 4. Add to Windows Startup
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'HiveRiftWFHAgent' -Value ('wscript.exe "' + $vbsFile + '"') -ErrorAction SilentlyContinue

# 5. Launch in background silently
Start-Process -FilePath "wscript.exe" -ArgumentList ('"' + $vbsFile + '"')

Write-Host "[✓] Background Monitoring Daemon started successfully!" -ForegroundColor Green
Write-Host "[✓] Status will turn Online in HiveRift CRM Dashboard in 5 seconds." -ForegroundColor Cyan
`;

    const encoded = toUtf16LeBase64(psCode);

    const batContent = `@echo off
title HiveRift WFH Monitoring Agent Setup
color 0A

echo ====================================================
echo        HIVERIFT CRM - WFH MONITORING AGENT
echo ====================================================
echo.
echo [*] Installing and starting HiveRift Monitoring Agent...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}

echo.
echo ====================================================
echo  [SUCCESS] All steps complete! You can close this.
echo ====================================================
echo.
pause
`;

    const blob = new Blob([batContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HiveRift-Agent-Setup-${token}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setStatusText(`Downloaded! Double-click HiveRift-Agent-Setup-${token}.bat to connect.`);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        maxWidth: 540,
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #016139 0%, #0b3b24 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Laptop size={26} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                HiveRift Monitoring Agent Required
              </h2>
              <p style={{ fontSize: 13, color: '#A8C9BE', margin: '4px 0 0 0' }}>
                Work From Home (WFH) Attendance & Activity Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {isConnected ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>
                Agent Connected & Active!
              </h3>
              <p style={{ fontSize: 14, color: '#4b5563', margin: 0 }}>
                Your work activity and attendance are now seamlessly logging to the HiveRift Portal.
              </p>
            </div>
          ) : (
            <>
              {/* Notice Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 20,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <AlertCircle size={20} color="#016139" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  Your account is configured for <strong>Work From Home</strong>. Please connect the lightweight HiveRift Monitoring Agent on your Windows computer to record your work attendance, active hours, and shift duration.
                </p>
              </div>

              {/* Pairing Token Card */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px dashed #86efac',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  YOUR WFH DEVICE PAIRING TOKEN
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  margin: '10px 0 6px 0'
                }}>
                  <span style={{
                    fontSize: 26,
                    fontWeight: 900,
                    letterSpacing: 2,
                    color: '#016139',
                    fontFamily: 'monospace'
                  }}>
                    {loading ? 'GENERATING...' : tokenData?.pairingToken || 'HR-WFH-TOKEN'}
                  </span>

                  <button
                    onClick={handleCopyToken}
                    disabled={loading || !tokenData}
                    style={{
                      padding: '6px 12px',
                      background: copied ? '#16a34a' : '#016139',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Valid for {tokenData?.employeeName || 'your account'} • Expires in 24 hours
                </div>
              </div>

              {/* Steps Guide */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                  Easy 2-Step Setup:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#016139', color: '#fff',
                      fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>1</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      Click <strong>[ ✓ Yes ]</strong> below to download the automatic setup script.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#016139', color: '#fff',
                      fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>2</div>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      Double-click the downloaded <strong>.bat file</strong> on your computer. It will connect silently in 3 seconds!
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Status Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                background: downloaded ? '#f0fdf4' : '#f8fafc',
                borderRadius: 8,
                border: downloaded ? '1px solid #86efac' : '1px solid #e2e8f0',
                fontSize: 12.5,
                color: downloaded ? '#166534' : '#64748b',
                fontWeight: downloaded ? 700 : 500,
                marginBottom: 20
              }}>
                <RefreshCw size={14} className="animate-spin" />
                <span>{statusText}</span>
              </div>
            </>
          )}

          {/* Action Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 700 }}
            >
              Cancel / Continue Later
            </button>

            {!isConnected && (
              <button
                onClick={handleDownloadBatch}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, padding: '8px 20px' }}
              >
                <Check size={15} /> Yes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
