@echo off
echo ===================================================
echo   Deploying AlgoMind Backend to Hugging Face Space
echo ===================================================
echo.
echo Please make sure you have generated a Hugging Face "Write" Access Token.
echo You can get one here: https://huggingface.co/settings/tokens
echo.
cd /d "%~dp0\backend"
git init
git remote remove hf 2>nul
git remote add hf https://huggingface.co/spaces/zihad2003/algomind-backend
git add .
git commit -m "Deploy backend to Hugging Face Space"
git branch -M main
echo.
echo Git is ready to push. When prompted:
echo - Username: zihad2003
echo - Password: [Your Hugging Face Write Token]
echo.
git push -f hf main
echo.
echo ===================================================
echo Done! Please check https://huggingface.co/spaces/zihad2003/algomind-backend
echo ===================================================
pause
