# UTF-8 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LC_ALL = 'ko_KR.UTF-8'

param (
    [Parameter(Mandatory=$true)]
    [string]$commitMessage
)

# Git 명령어 실행
Write-Host "Git 변경사항 추가 중..." -ForegroundColor Cyan
git add .

Write-Host "커밋 메시지: '$commitMessage'로 커밋 중..." -ForegroundColor Cyan
git commit -m "$commitMessage" --no-verify

# Git 설정에서 인코딩 관련 설정 추가
git config --local core.quotepath off
git config --local i18n.commitEncoding utf-8
git config --local i18n.logOutputEncoding utf-8

Write-Host "원격 저장소로 푸시 중..." -ForegroundColor Cyan
git push

Write-Host "완료되었습니다!" -ForegroundColor Green
