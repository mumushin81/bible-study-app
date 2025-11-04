#!/bin/bash

echo "🔍 Supabase 환경변수 확인:"
echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:+설정됨}"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:+설정됨}"
echo "SUPABASE_ACCESS_TOKEN: ${SUPABASE_ACCESS_TOKEN:+설정됨}"
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+설정됨}"
echo "SUPABASE_URL: ${SUPABASE_URL:+설정됨}"
echo "SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY:+설정됨}"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:+설정됨}"

echo -e "\n🔍 GitHub 환경변수 확인:"
echo "HOMEBREW_GITHUB_API_TOKEN: ${HOMEBREW_GITHUB_API_TOKEN:+설정됨}"
echo "GITHUB_PAT: ${GITHUB_PAT:+설정됨}"

echo -e "\n🔍 GitHub Secrets 확인:"
echo "GitHub Actions Secrets는 GitHub 웹 인터페이스에서 확인 필요"