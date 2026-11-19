param([int]$QaProcessId)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient,UIAutomationTypes,System.Windows.Forms,System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class TodoQaWindow {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int w, int h, uint flags);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] private static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] private static extern IntPtr GetAncestor(IntPtr hwnd, uint type);
    [DllImport("user32.dll")] private static extern IntPtr WindowFromPoint(Point point);
    [DllImport("user32.dll")] private static extern void mouse_event(uint flags, uint x, uint y, uint data, IntPtr extra);
    [StructLayout(LayoutKind.Sequential)] private struct Point { public int X; public int Y; }
    public static bool Click(IntPtr root, int x, int y) {
        if (GetAncestor(WindowFromPoint(new Point { X = x, Y = y }), 2) != root || !SetCursorPos(x, y)) return false;
        mouse_event(2, 0, 0, 0, IntPtr.Zero);
        mouse_event(4, 0, 0, 0, IntPtr.Zero);
        return true;
    }
}
'@
[void][TodoQaWindow]::SetProcessDPIAware()
$qaDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../artifacts/todo-qa')).Path
$exe = Join-Path $qaDir 'WorkMemo-Todo-QA.exe'
$profile = (Get-Content -Raw -LiteralPath (Join-Path $qaDir 'identifier.txt')).Trim()
if ($profile -notmatch '^com\.workmemo\.test\.todo\d{10}$' -or
    -not [Text.Encoding]::ASCII.GetString([IO.File]::ReadAllBytes($exe)).Contains($profile)) {
    throw 'The executable must contain the isolated todo QA identifier.'
}
$database = Join-Path (Join-Path $env:LOCALAPPDATA $profile) 'workmemo.sqlite3'
$appearance = Join-Path (Join-Path $env:APPDATA $profile) 'appearance.json'
if ($QaProcessId) {
    $process = Get-Process -Id $QaProcessId
    if ($process.Path -ne $exe) { throw 'The running process must be the isolated QA executable.' }
} else {
    if (Test-Path -LiteralPath $database) { throw 'Build with an unused QA identifier before running.' }
    $process = Start-Process -FilePath $exe -WindowStyle Hidden -PassThru
}

$desktop = [Windows.Automation.AutomationElement]::RootElement
$processFilter = [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ProcessIdProperty, $process.Id)
function Wait-For($check, [string]$description) {
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try { $match = & $check } catch [Windows.Automation.ElementNotAvailableException] { $match = $null }
        if ($match) { return $match }
        Start-Sleep -Milliseconds 150
    }
    throw "Timed out: $description"
}

function Window([string]$name) {
    Wait-For {
        $desktop.FindAll([Windows.Automation.TreeScope]::Children, $processFilter) |
            Where-Object { $_.Current.Name -eq $name } | Select-Object -First 1
    } $name
}

function Control($container, [string]$name, $type) {
    $filter = [Windows.Automation.AndCondition]::new(
        [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty, $name),
        [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::ControlTypeProperty, $type))
    Wait-For { $container.FindFirst([Windows.Automation.TreeScope]::Descendants, $filter) } $name
}

function Click($container, [string]$name) {
    $element = Control $container $name ([Windows.Automation.ControlType]::Button)
    Click-Element $container $element $name
}

function Click-Element($container, $element, [string]$name) {
    $window = [IntPtr]$container.Current.NativeWindowHandle
    [void][TodoQaWindow]::SetWindowPos($window, [IntPtr]::Zero, 0, 0, 0, 0, 19)
    [void](Wait-For {
        $rect = $element.Current.BoundingRectangle
        $rect.Width -gt 0 -and [TodoQaWindow]::Click($window, [int]($rect.X + $rect.Width / 2), [int]($rect.Y + $rect.Height / 2))
    } "click $name")
}

function Background-Samples($main, [string]$theme) {
    $window = [IntPtr]$main.Current.NativeWindowHandle
    $rect = $main.Current.BoundingRectangle
    $area = [Drawing.Rectangle]::new([int]$rect.X, [int]$rect.Y, [int]$rect.Width, [int]$rect.Height)
    $underlay = [Windows.Forms.Form]::new()
    $underlay.FormBorderStyle = 'None'
    $underlay.StartPosition = 'Manual'
    $underlay.ShowInTaskbar = $false
    $underlay.Bounds = $area
    try {
        $underlay.Show()
        # Place the temporary solid-color reference immediately behind this QA window.
        if (-not [TodoQaWindow]::SetWindowPos($underlay.Handle, $window, 0, 0, 0, 0, 19)) { throw 'Cannot place test background.' }
        foreach ($sample in @('Magenta', 'Lime')) {
            $expected = [Drawing.Color]::FromName($sample)
            $underlay.BackColor = $expected
            $underlay.Refresh()
            [Windows.Forms.Application]::DoEvents()
            Start-Sleep -Milliseconds 250
            $image = [Drawing.Bitmap]::new($area.Width, $area.Height)
            $graphics = [Drawing.Graphics]::FromImage($image)
            try {
                $graphics.CopyFromScreen($area.Location, [Drawing.Point]::Empty, $area.Size)
                $actual = $image.GetPixel(3, 3)
                # The checklist uses an 18% black modal backdrop across the transparent window.
                $distance = [math]::Abs($expected.R * 0.82 - $actual.R) + [math]::Abs($expected.G * 0.82 - $actual.G) + [math]::Abs($expected.B * 0.82 - $actual.B)
                if ($distance -gt 25) { throw "$theme native corner expected dimmed $sample, got $actual" }
                $image.Save((Join-Path $qaDir "$theme-$sample.png"), [Drawing.Imaging.ImageFormat]::Png)
            } finally {
                $graphics.Dispose()
                $image.Dispose()
            }
        }
    } finally {
        $underlay.Dispose()
    }
}

$text = [Windows.Automation.ControlType]::Text
$edit = [Windows.Automation.ControlType]::Edit
$check = [Windows.Automation.ControlType]::CheckBox
$island = Window 'WorkMemo 工作提醒'
$collapseFilter = [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty, '收起展开区域')
if ($island.FindFirst([Windows.Automation.TreeScope]::Descendants, $collapseFilter)) { Click $island '收起展开区域' }
Click $island '打开WorkMemo'
$main = Window 'WorkMemo Todo QA'
$mainHandle = [IntPtr]$main.Current.NativeWindowHandle
if (-not (Test-Path -LiteralPath $database)) { throw 'Isolated SQLite database was not created.' }
$closeFilter = [Windows.Automation.PropertyCondition]::new([Windows.Automation.AutomationElement]::NameProperty, '关闭待办清单')
if ($main.FindFirst([Windows.Automation.TreeScope]::Descendants, $closeFilter)) { Click $main '关闭待办清单' }

Click $main '关闭到后台'
[void](Wait-For { -not [TodoQaWindow]::IsWindowVisible($mainHandle) } 'main hidden')
[void](Control $island '待机' $text)
Click $island '展开任务与提醒'
Click $island '待办'
[void](Wait-For { [TodoQaWindow]::IsWindowVisible($mainHandle) } 'main restored')
[void](Control $main '待办清单' $text)
Write-Output 'Native inactive island opened the shared checklist in the hidden main window.'

$todoTitle = '检查记录 ' + (Get-Date -Format 'HHmmss')
$title = Control $main '待办标题' $edit
$valuePattern = $title.GetCurrentPattern([Windows.Automation.ValuePattern]::Pattern)
$valuePattern.SetValue($todoTitle)
Click $main '添加'
[void](Control $main $todoTitle $check)

Click $main '关闭待办清单'
Click $main '设置'
$settings = Window 'WorkMemo 设置'
Click $settings '外观'
foreach ($theme in @('Glass', 'Cream', 'Dark', 'Neon')) {
    $choice = Wait-For {
        $settings.FindAll([Windows.Automation.TreeScope]::Descendants, [Windows.Automation.Condition]::TrueCondition) |
            Where-Object { $_.Current.ControlType -eq [Windows.Automation.ControlType]::Button -and $_.Current.Name -like "$theme*" } | Select-Object -First 1
    } "$theme theme"
    Click-Element $settings $choice $theme
    Click $settings '保存外观'
    [void](Wait-For {
        (Test-Path -LiteralPath $appearance) -and
            (Get-Content -Raw -LiteralPath $appearance | ConvertFrom-Json).theme -eq $theme.ToLowerInvariant()
    } "$theme saved")
    Click $main '待办'
    [void](Control $main $todoTitle $check)
    Background-Samples $main $theme
    Click $main '关闭待办清单'
}
Write-Output 'Four native skins rendered the checklist, with two desktop background colors verified through each window corner.'

Click $main '待办'
Click $main "开始计时：$todoTitle"
$category = Control $main '工作类别' ([Windows.Automation.ControlType]::ComboBox)
Click-Element $main $category '工作类别'
if ([TodoQaWindow]::GetForegroundWindow() -ne $mainHandle) { throw 'QA category control is not foreground.' }
[Windows.Forms.SendKeys]::SendWait('{HOME}{DOWN 3}{ENTER}')
Click $main '开始工作'
[void](Control $main $todoTitle $text)
Click $main '暂停'
Click $main '继续工作'
[void](Control $main '暂停' ([Windows.Automation.ControlType]::Button))
Click $main '结束'
[void](Control $main '自动监测未启用' $text)
Start-Sleep -Milliseconds 400
Click $main '待办'
$item = Control $main $todoTitle $check
[void][TodoQaWindow]::SetForegroundWindow($mainHandle)
$item.SetFocus()
if ([TodoQaWindow]::GetForegroundWindow() -ne $mainHandle) { throw 'QA main window must have foreground focus for keyboard testing.' }
[Windows.Forms.SendKeys]::SendWait(' ')
[void](Control $main '已完成 1' ([Windows.Automation.ControlType]::Button))
[Windows.Forms.SendKeys]::SendWait('{ESC}')
[void](Control $main '待办' ([Windows.Automation.ControlType]::Button))
Write-Output "Native timer, pause, resume, manual completion and keyboard dismissal passed ($profile)."
