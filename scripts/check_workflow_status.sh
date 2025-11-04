#!/bin/bash

# GitHub 저장소 정보
OWNER="mumushin81"
REPO="bible-study-app"
WORKFLOW_FILE="deploy.yml"

# 최근 워크플로우 실행 정보 가져오기
echo "최근 워크플로우 실행 정보:"
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_FILE/runs" \
  | jq '.workflow_runs[0] | {status: .status, conclusion: .conclusion, created_at: .created_at, html_url: .html_url}'