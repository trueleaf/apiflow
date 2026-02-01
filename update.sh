#!/bin/bash

# Apiflow Docker 更新脚本
# 使用方法: ./update.sh [选项]
# 选项:
#   --no-backup    跳过版本备份
#   --no-prune     跳过镜像清理
#   --no-git       跳过 git pull
#   --cn           使用中国镜像源

set -e
set -o pipefail

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

BACKUP_VERSION=true
PRUNE_IMAGES=true
USE_CN_COMPOSE=false
SKIP_GIT_PULL=false

print_step() {
    echo -e "${COLOR_BLUE}==>${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}✗${COLOR_RESET} $1"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            BACKUP_VERSION=false
            shift
            ;;
        --no-prune)
            PRUNE_IMAGES=false
            shift
            ;;
        --no-git)
            SKIP_GIT_PULL=true
            shift
            ;;
        --cn)
            USE_CN_COMPOSE=true
            shift
            ;;
        --help|-h)
            echo "使用方法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --no-backup    跳过版本备份"
            echo "  --no-prune     跳过镜像清理"
            echo "  --no-git       跳过 git pull"
            echo "  --cn           使用 docker-compose.cn.yml"
            echo "  --help, -h     显示帮助信息"
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
done

COMPOSE_ARGS=(-f docker-compose.yml)
if [ "$USE_CN_COMPOSE" = true ]; then
    COMPOSE_ARGS+=(-f docker-compose.cn.yml)
    print_warning "使用中国镜像源配置"
fi

if [ ! -f "docker-compose.yml" ]; then
    print_error "错误: 未找到 docker-compose.yml 文件"
    print_error "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 加载 .env 文件中的环境变量
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo ""
print_step "🚀 开始更新 Apiflow..."
echo ""

if [ "$SKIP_GIT_PULL" = false ]; then
    if [ -d ".git" ]; then
        print_step "📦 更新代码仓库..."
        if git pull; then
            print_success "代码已更新到最新版本"
        else
            print_warning "Git pull 失败（可能无更新或有冲突）"
        fi
        echo ""
    else
        print_warning "未检测到 .git 目录，跳过代码更新"
        echo ""
    fi
fi

if [ "$BACKUP_VERSION" = true ]; then
    print_step "📝 备份当前镜像信息..."
    BACKUP_FILE="current_versions_$(date +%Y%m%d_%H%M%S).txt"
    BACKUP_DIGEST_FILE="${BACKUP_FILE}.digests"
    : > "$BACKUP_FILE"
    : > "$BACKUP_DIGEST_FILE"
    printf "service\timage\timage_id\trepo_digest\n" >> "$BACKUP_DIGEST_FILE"

    SERVICES=$(docker compose "${COMPOSE_ARGS[@]}" config --services 2>/dev/null || true)
    if [ -z "$SERVICES" ]; then
        print_warning "未能获取 compose 服务列表，跳过版本备份"
    else
        for service in $SERVICES; do
            container_id=$(docker compose "${COMPOSE_ARGS[@]}" ps -q "$service" 2>/dev/null | head -n 1 || true)
            if [ -z "$container_id" ]; then
                continue
            fi
            image_ref=$(docker inspect -f '{{.Config.Image}}' "$container_id" 2>/dev/null || true)
            image_id=$(docker inspect -f '{{.Image}}' "$container_id" 2>/dev/null || true)
            repo_digest=""
            if [ -n "$image_id" ]; then
                repo="${image_ref%:*}"
                digests=$(docker image inspect -f '{{range .RepoDigests}}{{println .}}{{end}}' "$image_id" 2>/dev/null || true)
                if [ -n "$digests" ]; then
                    repo_digest=$(echo "$digests" | grep -m 1 "^${repo}@sha256:" 2>/dev/null || true)
                    if [ -z "$repo_digest" ]; then
                        repo_digest=$(echo "$digests" | head -n 1 || true)
                    fi
                fi
            fi

            if [ -n "$repo_digest" ]; then
                echo "${service}=${repo_digest}" >> "$BACKUP_FILE"
            elif [ -n "$image_ref" ]; then
                echo "${service}=${image_ref}" >> "$BACKUP_FILE"
            fi
            printf "%s\t%s\t%s\t%s\n" "$service" "$image_ref" "$image_id" "$repo_digest" >> "$BACKUP_DIGEST_FILE"
        done
    fi

    if [ ! -s "$BACKUP_FILE" ]; then
        print_warning "未备份到运行中的镜像信息（可能服务未运行）"
    fi
    
    print_success "版本信息已备份到 $BACKUP_FILE"
    echo ""
fi

print_step "⏹️  停止当前服务..."
if docker compose "${COMPOSE_ARGS[@]}" down; then
    print_success "服务已停止"
else
    print_warning "停止服务时出现警告（可能服务未运行）"
fi
echo ""

print_step "📥 拉取最新镜像..."
PULL_OUTPUT=$(mktemp)
if docker compose "${COMPOSE_ARGS[@]}" pull 2>&1 | tee "$PULL_OUTPUT"; then
    # 检查是否有镜像被更新
    if grep -q "Downloaded newer image" "$PULL_OUTPUT" || grep -q "Pulled" "$PULL_OUTPUT"; then
        print_success "检测到新镜像，拉取完成"
    elif grep -q "Image is up to date" "$PULL_OUTPUT" || grep -q "up to date" "$PULL_OUTPUT"; then
        print_warning "所有镜像已是最新版本，无需更新"
    else
        print_success "镜像拉取完成"
    fi
    rm -f "$PULL_OUTPUT"
else
    print_error "镜像拉取失败"
    rm -f "$PULL_OUTPUT"
    exit 1
fi
echo ""

print_step "▶️  启动新服务..."
if docker compose "${COMPOSE_ARGS[@]}" up -d --force-recreate; then
    print_success "服务已启动"
else
    print_error "服务启动失败"
    print_error "正在停止服务并退出..."
    docker compose "${COMPOSE_ARGS[@]}" down || true
    exit 1
fi
echo ""

CONTAINER_TIMEOUT=90
API_HEALTH_TIMEOUT=60
HEALTH_URL=${HEALTH_URL:-http://localhost/api/health}

DEPLOYMENT_TYPE=${DEPLOYMENT_TYPE:-user}
HEALTH_HOST=${HEALTH_HOST:-}
if [ -z "$HEALTH_HOST" ] && [ "$DEPLOYMENT_TYPE" = "official" ]; then
    HEALTH_HOST="app.apiflow.cn"
fi

cleanup_and_exit() {
    print_error "$1"
    echo ""
    print_step "📊 服务状态:"
    docker compose "${COMPOSE_ARGS[@]}" ps || true
    echo ""
    print_step "📋 最近日志:"
    docker compose "${COMPOSE_ARGS[@]}" logs --tail=80 || true
    echo ""
    print_error "正在停止所有服务..."
    docker compose "${COMPOSE_ARGS[@]}" down || true
    exit 1
}

SERVICES=$(docker compose "${COMPOSE_ARGS[@]}" config --services 2>/dev/null || true)
if [ -z "$SERVICES" ]; then
    cleanup_and_exit "未能获取 compose 服务列表，无法校验启动状态"
fi

print_step "⏳ 等待容器健康检查（${CONTAINER_TIMEOUT}s 超时）..."
START_TS=$(date +%s)
DEADLINE_TS=$((START_TS + CONTAINER_TIMEOUT))
while true; do
    all_ready=true
    for service in $SERVICES; do
        container_id=$(docker compose "${COMPOSE_ARGS[@]}" ps -q "$service" 2>/dev/null | head -n 1 || true)
        if [ -z "$container_id" ]; then
            all_ready=false
            continue
        fi

        status=$(docker inspect -f '{{.State.Status}}' "$container_id" 2>/dev/null || true)
        if [ "$status" != "running" ]; then
            cleanup_and_exit "服务 ${service} 状态异常：${status:-unknown}"
        fi

        health=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$container_id" 2>/dev/null || true)
        if [ -n "$health" ] && [ "$health" != "healthy" ]; then
            all_ready=false
            printf "."
        fi
    done

    if [ "$all_ready" = true ]; then
        echo ""
        print_success "所有容器健康检查通过"
        break
    fi

    now_ts=$(date +%s)
    if [ "$now_ts" -ge "$DEADLINE_TS" ]; then
        echo ""
        cleanup_and_exit "容器健康检查超时（${CONTAINER_TIMEOUT}s）"
    fi
    sleep 2
done
echo ""

print_step "🏥 检查 API 健康状态（${API_HEALTH_TIMEOUT}s 超时）: ${HEALTH_URL}${HEALTH_HOST:+ (Host: $HEALTH_HOST)}"
START_TS=$(date +%s)
DEADLINE_TS=$((START_TS + API_HEALTH_TIMEOUT))
ATTEMPT=0
while true; do
    ATTEMPT=$((ATTEMPT + 1))
    now_ts=$(date +%s)
    if [ "$now_ts" -ge "$DEADLINE_TS" ]; then
        echo ""
        cleanup_and_exit "API 健康检查超时（${API_HEALTH_TIMEOUT}s，尝试 ${ATTEMPT} 次）: $HEALTH_URL"
    fi

    if command -v curl >/dev/null 2>&1; then
        curl_args=(-fsS --max-time 5)
        if [ -n "$HEALTH_HOST" ]; then
            curl_args+=(-H "Host: $HEALTH_HOST")
        fi
        health_body=$(curl "${curl_args[@]}" "$HEALTH_URL" 2>/dev/null || true)
    elif command -v wget >/dev/null 2>&1; then
        wget_args=(-qO- --timeout=5)
        if [ -n "$HEALTH_HOST" ]; then
            wget_args+=(--header="Host: $HEALTH_HOST")
        fi
        health_body=$(wget "${wget_args[@]}" "$HEALTH_URL" 2>/dev/null || true)
    else
        cleanup_and_exit "缺少 curl/wget 工具，无法检查 API 健康状态"
    fi

    if echo "$health_body" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
        echo ""
        print_success "API 健康检查通过（尝试 ${ATTEMPT} 次）"
        break
    fi
    printf "."
    sleep 3
done
echo ""

print_step "🏥 检查服务健康状态..."
docker compose "${COMPOSE_ARGS[@]}" ps
echo ""

print_step "📋 查看最近日志..."
docker compose "${COMPOSE_ARGS[@]}" logs --tail=30
echo ""

if [ "$PRUNE_IMAGES" = true ]; then
    print_step "🧹 清理未使用的镜像..."
    PRUNED=$(docker image prune -f --filter "dangling=true" 2>&1)
    if echo "$PRUNED" | grep -q "Total reclaimed space"; then
        SPACE=$(echo "$PRUNED" | grep "Total reclaimed space" | awk '{print $4" "$5}')
        print_success "已清理 $SPACE 空间"
    else
        print_success "没有需要清理的镜像"
    fi
    echo ""
fi

print_success "✅ 更新完成！"
echo ""
print_step "常用命令:"
echo "  查看服务状态: docker compose ps"
echo "  查看实时日志: docker compose logs -f"
echo "  查看特定服务: docker compose logs -f server"
echo "  重启服务:     docker compose restart"
echo "  停止服务:     docker compose down"
echo ""
