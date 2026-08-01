# ADB Shared Snippets
Reference before writing a new ADB tool. Copy, don't reinvent.

## Resolve adb path (bundled first, PATH fallback)
```csharp
string adb = File.Exists(Path.Combine(AppContext.BaseDirectory, "platform-tools", "adb.exe"))
    ? Path.Combine(AppContext.BaseDirectory, "platform-tools", "adb.exe")
    : "adb"; // relies on PATH
```

## Safe device check before any command
```csharp
var r = RunAdb("devices -l");
if (!r.Contains("device ")) throw new Exception("No authorized device connected.");
```

## Reversible debloat (user 0 uninstall, not full remove)
```
adb shell pm uninstall -k --user 0 <package>
# restore:
adb shell cmd package install-existing <package>
```

## Run adb with timeout (prevents UI hang)
```csharp
var psi = new ProcessStartInfo("adb", args) { RedirectStandardOutput = true, UseShellExecute = false };
var proc = Process.Start(psi)!;
if (!proc.WaitForExit(15000)) { proc.Kill(); throw new TimeoutException("adb timed out"); }
```

## Confirm-before-destructive pattern (UI)
Require the user to type the device model or "ERASE" before enabling: `wipe`, `fastboot flash`, `fastboot erase`, `format`.

## Known-safe debloat lists
Keep OEM-specific lists (Samsung/Xiaomi/Oppo) in `debloat/<oem>.json` — never a single generic list, they differ hard.
