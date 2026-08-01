# Windows Shared Snippets
Reference before writing a new Windows tool. Copy, don't reinvent.

## Admin check (C#)
```csharp
using var id = System.Security.Principal.WindowsIdentity.GetCurrent();
var p = new System.Security.Principal.WindowsPrincipal(id);
bool isAdmin = p.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
if (!isAdmin) { /* relaunch with runas or show message */ }
```

## Registry backup before edit (PowerShell)
```powershell
$backupPath = "$env:LOCALAPPDATA\<ToolName>\backups\$(Get-Date -Format yyyyMMdd_HHmmss).reg"
New-Item -ItemType Directory -Force -Path (Split-Path $backupPath) | Out-Null
reg export "HKCU\Path\To\Key" $backupPath /y
```

## Registry backup before edit (C#)
```csharp
Process.Start("reg.exe", $"export \"{keyPath}\" \"{backupFile}\" /y").WaitForExit();
```

## Logger (drop-in, C#)
```csharp
static class Log
{
    static readonly string Path = System.IO.Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "<ToolName>", "log.txt");
    public static void Write(string msg)
    {
        System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(Path)!);
        System.IO.File.AppendAllText(Path, $"[{DateTime.Now:u}] {msg}\n");
    }
}
```

## Restore point before a batch of changes (PowerShell, needs admin)
```powershell
Checkpoint-Computer -Description "<ToolName> pre-change" -RestorePointType MODIFY_SETTINGS
```

## Self-contained single-file publish
```
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true
```
