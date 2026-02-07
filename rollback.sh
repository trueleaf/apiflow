#!/bin/bash

# Apiflow Docker 回滚脚本
# 
# 使用方法:
#   方式一：回滚到最近一次快照（推荐）
#     ./rollback.sh --previous [--cn]
#     示例: ./rollback.sh --previous
#          ./rollback.sh --previous --cn
#
#   方式二：回滚到指定快照文件（推荐）
#     ./rollback.sh --file <current_versions_*.txt> [--cn]
#     示例: ./rollback.sh --file current_versions_20260122_120000.txt
#          ./rollback.sh --file current_versions_20260122_120000.txt --cn
#
#   方式三：按版本标签或Git SHA回滚（兼容模式）
#     ./rollback.sh <tag|sha> [--cn]
#     示例: ./rollback.sh v1.2.3
#          ./rollback.sh 0.9.81
#          ./rollback.sh 7f3a2b1c4d5e
#          ./rollback.sh v1.2.3 --cn
#
# 参数说明:
#   --previous/-p  : 使用最近一次update.sh备份的快照
#   --file         : 指定快照文件路径
#   --cn           : 使用中国镜像源配置（叠加docker-compose.cn.yml）
#   --help/-h      : 显示详细帮助信息
#
# 注意事项:
#   - 快照文件由update.sh生成，格式为current_versions_YYYYMMDD_HHMMSS.txt
#   - 推荐使用快照方式回滚，可确保精确回滚到之前的版本
#   - 按tag/sha回滚不保证精确，适合紧急场景

set -e
set -o pipefail

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

print_step() {
    echo -e "${COLOR_BLUE}==>${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}✗${COLOR_RESET} $1"
}

USE_CN_COMPOSE=false
SNAPSHOT_FILE=""
VERSION=""
USE_PREVIOUS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --cn)
            USE_CN_COMPOSE=true
            shift
            ;;
        --previous|-p)
            USE_PREVIOUS=true
            shift
            ;;
        --file)
            SNAPSHOT_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "用法:"
            echo "  1) 推荐：按快照（精确回滚，优先使用）"
            echo "     $0 --previous [--cn]"
            echo "     $0 --file <current_versions_*.txt> [--cn]"
            echo ""
            echo "  2) 兼容：按 tag/sha（不保证精确回滚，适合紧急场景）"
            echo "     $0 <tag|sha> [--cn]"
            echo "     例如：$0 v1.2.3"
            echo "          $0 0.9.81"
            echo "          $0 7f3a2b1c4d5e"
            echo ""
            echo "说明:"
            echo "  - 快照文件由 ./update.sh 生成（不要加 --no-backup），位于当前目录，形如：current_versions_YYYYMMDD_HHMMSS.txt"
            echo "  - --cn 会叠加 docker-compose.cn.yml（中国镜像源配置）"
            echo "  - 脚本会生成临时文件 docker-compose.rollback.yml；确认回滚成功后可手动删除"
            exit 0
            ;;
        *)
            if [ -z "$VERSION" ]; then
                VERSION="$1"
                shift
            else
                print_error "未知参数: $1"
                exit 1
            fi
            ;;
    esac
done

if [ -z "$VERSION" ] && [ -z "$SNAPSHOT_FILE" ] && [ "$USE_PREVIOUS" = false ]; then
    print_error "错误: 请指定回滚目标"
    echo "使用 --help 查看详细用法"
    echo ""
    echo "使用方法:"
    echo "  $0 --previous [--cn]"
    echo "  $0 --file <current_versions_*.txt> [--cn]"
    echo "  $0 v1.2.3 [--cn]"
    echo ""
    echo "推荐方式: 使用 update.sh 生成的 current_versions_*.txt 快照进行精确回滚"
    echo ""
    exit 1
fi

COMPOSE_ARGS=(-f docker-compose.yml)
if [ "$USE_CN_COMPOSE" = true ]; then
    COMPOSE_ARGS+=(-f docker-compose.cn.yml)
fi

if [ ! -f "docker-compose.yml" ]; then
    print_error "错误: 未找到 docker-compose.yml 文件"
    exit 1
fi
if [ "$USE_CN_COMPOSE" = true ] && [ ! -f "docker-compose.cn.yml" ]; then
    print_error "错误: 指定了 --cn，但未找到 docker-compose.cn.yml"
    exit 1
fi

if [ "$USE_PREVIOUS" = true ]; then
    print_step "🔍 正在查找上一个备份快照..."
    SNAPSHOT_FILE=$(ls -t current_versions_*.txt 2>/dev/null | head -n 1 || true)
    if [ -z "$SNAPSHOT_FILE" ]; then
        print_error "错误: 未找到上一个备份快照文件（current_versions_*.txt）"
        exit 1
    fi
fi

print_step "📝 创建临时配置文件..."
ROLLBACK_COMPOSE_FILE="docker-compose.rollback.yml"

if [ -n "$SNAPSHOT_FILE" ]; then
    if [ ! -f "$SNAPSHOT_FILE" ]; then
        print_error "错误: 未找到快照文件 $SNAPSHOT_FILE"
        exit 1
    fi
    print_step "📦 使用快照回滚: $SNAPSHOT_FILE"
    echo "services:" > "$ROLLBACK_COMPOSE_FILE"
    while IFS= read -r line || [ -n "$line" ]; do
        if [ -z "$line" ]; then
            continue
        fi
        if [[ "$line" == \#* ]]; then
            continue
        fi
        if [[ "$line" == *"="* ]]; then
            service="${line%%=*}"
            image="${line#*=}"
        else
            service=""
            image="$line"
            if echo "$image" | grep -q "apiflow-server"; then
                service="server"
            elif echo "$image" | grep -q "apiflow-web"; then
                service="web"
            elif echo "$image" | grep -q "apiflow-website"; then
                service="website"
            elif echo "$image" | grep -q "apiflow-mongo" || echo "$image" | grep -q "mongo:6"; then
                service="mongo"
            fi
        fi

        if [ -z "$service" ] || [ -z "$image" ]; then
            continue
        fi
        echo "  ${service}:" >> "$ROLLBACK_COMPOSE_FILE"
        echo "    image: ${image}" >> "$ROLLBACK_COMPOSE_FILE"
    done < "$SNAPSHOT_FILE"

    if [ "$(wc -l < "$ROLLBACK_COMPOSE_FILE" | tr -d ' ')" -le 1 ]; then
        print_error "错误: 快照文件未解析出任何服务镜像，请确认快照内容格式"
        rm -f "$ROLLBACK_COMPOSE_FILE"
        exit 1
    fi
else
    echo ""
    print_step "🔄 开始回滚到版本: $VERSION"
    echo ""
    SOURCE_COMPOSE_FOR_VERSION="docker-compose.yml"
    if [ "$USE_CN_COMPOSE" = true ]; then
        SOURCE_COMPOSE_FOR_VERSION="docker-compose.cn.yml"
    fi
    cp "$SOURCE_COMPOSE_FOR_VERSION" "$ROLLBACK_COMPOSE_FILE"
    sed -i "s/:latest/:${VERSION}/g" "$ROLLBACK_COMPOSE_FILE"
    sed -i "s/:v[0-9]\+\.[0-9]\+\.[0-9]\+/:${VERSION}/g" "$ROLLBACK_COMPOSE_FILE"
    sed -i "s/:[a-f0-9]\{12\}/:${VERSION}/g" "$ROLLBACK_COMPOSE_FILE"
fi

print_success "临时配置文件已创建"
echo ""

print_step "⏹️  停止当前服务..."
ROLLBACK_ARGS=("${COMPOSE_ARGS[@]}" -f "$ROLLBACK_COMPOSE_FILE")
docker compose "${ROLLBACK_ARGS[@]}" down
print_success "服务已停止"
echo ""

print_step "📥 拉取指定版本镜像..."
if docker compose "${ROLLBACK_ARGS[@]}" pull; then
    print_success "镜像拉取完成"
else
    print_error "镜像拉取失败，请检查版本号是否正确"
    rm -f "$ROLLBACK_COMPOSE_FILE"
    exit 1
fi
echo ""

print_step "▶️  启动服务..."
if docker compose "${ROLLBACK_ARGS[@]}" up -d --force-recreate --pull never; then
    print_success "服务已启动"
else
    print_error "服务启动失败"
    rm -f "$ROLLBACK_COMPOSE_FILE"
    exit 1
fi
echo ""

print_step "⏳ 等待服务就绪..."
sleep 10
print_success "服务已就绪"
echo ""

print_step "🏥 检查服务状态..."
docker compose "${ROLLBACK_ARGS[@]}" ps
echo ""

print_success "✅ 回滚完成！"
echo ""
print_step "如果回滚成功，可以删除临时文件:"
echo "  rm $ROLLBACK_COMPOSE_FILE"
echo ""
print_step "如果需要恢复到最新版本，运行:"
echo "  ./update.sh"
echo ""
