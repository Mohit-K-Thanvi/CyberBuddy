$WshShell = New-Object -comObject WScript.Shell
$StartupDir = $WshShell.SpecialFolders.Item("Startup")
$ShortcutPath = "$StartupDir\CyberBuddy-Server.lnk"
$TargetFile = "c:\Final_year_project\START_CYBERBUDDY.bat"
$WorkingDir = "c:\Final_year_project"

Write-Host "configuring autostart..."
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.WindowStyle = 7 
$Shortcut.Description = "CyberBuddy AI Server - AutoStart"
$Shortcut.Save()

Write-Host "Success! CyberBuddy will now start automatically in the background when you turn on your PC."
