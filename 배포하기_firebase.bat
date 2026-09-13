@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================================================
echo   🔥 [오늘의 감사 - 감사일기] Firebase 웹 호스팅 자동 배포 도구
echo ================================================================
echo.
echo  학생들이 언제 어디서나 접속할 수 있는 인터넷 웹 링크를 생성/배포합니다.
echo.

echo 1단계: 최신 웹앱 빌드(Build) 진행 중...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo.
    echo [오류] 빌드에 실패했습니다. 코드를 확인해 주세요.
    pause
    exit /b %errorlevel%
)

echo.
echo 2단계: Firebase 호스팅 서버로 배포 진행 중...
echo (처음 실행하시는 경우 구글 로그인 창이 뜰 수 있습니다.)
echo.

call npx.cmd firebase-tools deploy --only hosting

if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------------------
    echo [안내] Firebase 로그인이 필요하거나 프로젝트 설정이 필요할 수 있습니다.
    echo 아래 명령어로 로그인 후 프로젝트를 연결해 주세요:
    echo    npx firebase-tools login
    echo    npx firebase-tools use --add
    echo ----------------------------------------------------------------
    echo.
) else (
    echo.
    echo ================================================================
    echo   🎉 배포가 성공적으로 완료되었습니다!
    echo   출력된 Hosting URL 주소를 복사하여 학생들에게 공유해 주세요.
    echo ================================================================
)

pause
