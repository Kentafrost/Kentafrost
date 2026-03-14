@echo off
setlocal
chcp 65001 >nul

set "ROOT_DIR=%~dp0.."
cd /d "%ROOT_DIR%"

:menu
cls
echo ===============================================
echo Kentafrost Content Tools Menu
echo ===============================================
echo.
echo [1] content status確認 (content:status)
echo [2] career editor起動 (career:editor)
echo [3] career include更新 (career:update)
echo [4] blog生成 (blog:generate)
echo [5] blog生成 ^(verbose^) (blog:generate:verbose)
echo [6] blog dry-run確認 (blog:check)
echo [7] 終了
echo.
set /p CHOICE=選択肢を入力してください ^(1-7^): 

if "%CHOICE%"=="1" goto run_content_status
if "%CHOICE%"=="2" goto run_career_editor
if "%CHOICE%"=="3" goto run_career_update
if "%CHOICE%"=="4" goto run_blog_generate
if "%CHOICE%"=="5" goto run_blog_generate_verbose
if "%CHOICE%"=="6" goto run_blog_check
if "%CHOICE%"=="7" goto end

echo.
echo [WARN] 1-7 の数字を入力してください。
timeout /t 2 >nul
goto menu

:run_content_status
call npm run content:status
goto wait_and_back

:run_career_editor
echo.
echo [INFO] career editorはサーバーとして起動します。
echo        停止するには Ctrl+C を押してください。
call npm run career:editor
goto wait_and_back

:run_career_update
call npm run career:update
goto wait_and_back

:run_blog_generate
call npm run blog:generate
goto wait_and_back

:run_blog_generate_verbose
call npm run blog:generate:verbose
goto wait_and_back

:run_blog_check
call npm run blog:check
goto wait_and_back

:wait_and_back
echo.
pause
goto menu

:end
echo.
echo Bye.
endlocal
exit /b 0
