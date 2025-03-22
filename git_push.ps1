param (
    [Parameter(Mandatory=$true)]
    [string]$commitMessage
)

# Git 명령어 실행
Write-Host "Git 변경사항 추가 중..." -ForegroundColor Cyan
git add .

Write-Host "커밋 메시지: '$commitMessage'로 커밋 중..." -ForegroundColor Cyan
git commit -m "$commitMessage"

Write-Host "원격 저장소로 푸시 중..." -ForegroundColor Cyan
git push

Write-Host "완료되었습니다!" -ForegroundColor Green
