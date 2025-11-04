#!/bin/bash

# AI 생성 이미지 상세 정보 확인 스크립트
IMAGES_DIR="public/images/words"

# 헤더 출력
printf "%-40s %-20s %-15s\n" "파일명" "용량(KB)" "파일 타입"
echo "======================================================================="

# 모든 JPG 파일에 대해 반복
for file in "$IMAGES_DIR"/*.jpg; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        file_size=$(du -k "$file" | cut -f1)
        file_type=$(file -b "$file")

        # 포맷팅된 출력
        printf "%-40s %-20s %-15s\n" "$filename" "$file_size" "$file_type"
    fi
done

# 총 이미지 수 출력
total_images=$(ls "$IMAGES_DIR"/*.jpg 2>/dev/null | wc -l)
echo "======================================================================="
echo "총 이미지 수: $total_images"