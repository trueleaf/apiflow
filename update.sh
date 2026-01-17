#!/bin/bash

# Apiflow Docker 更新脚本
# 使用方法: ./update.sh [选项]
# 选项:
#   --no-backup    跳过版本备份
#   --no-prune     跳过镜像清理
#   --cn           使用中国镜像源

set -e

COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

BACKUP_VERSION=true
PRUNE_IMAGES=true
USE_CN_COMPOSE=false

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

COMPOSE_FILE="docker-compose.yml"
if [ "$USE_CN_COMPOSE" = true ]; then
    COMPOSE_FILE="docker-compose.yml -f docker-compose.cn.yml"
    print_warning "使用中国镜像源配置"
fi

if [ ! -f "docker-compose.yml" ]; then
    print_error "错误: 未找到 docker-compose.yml 文件"
    print_error "请确保在项目根目录下运行此脚本"
    exit 1
fi

echo ""
print_step "🚀 开始更新 Apiflow..."
echo ""

if [ "$BACKUP_VERSION" = true ]; then
    print_step "📝 备份当前版本信息..."
    docker compose -f $COMPOSE_FILE config --images > current_versions_$(date +%Y%m%d_%H%M%S).txt || true
    print_success "版本信息已备份"
    echo ""
fi

print_step "📥 拉取最新镜像..."
if docker compose -f $COMPOSE_FILE pull; then
    print_success "镜像拉取完成"
else
    print_error "镜像拉取失败"
    exit 1
fi
echo ""

print_step "⏹️  停止当前服务..."
if docker compose -f $COMPOSE_FILE down; then
    print_success "服务已停止"
else
    print_warning "停止服务时出现警告（可能服务未运行）"
fi
echo ""

print_step "▶️  启动新服务..."
if docker compose -f $COMPOSE_FILE up -d; then
    print_success "服务已启动"
else
    print_error "服务启动失败"
    print_error "正在尝试回滚..."
    docker compose -f $COMPOSE_FILE down
    exit 1
fi
echo ""

print_step "⏳ 等待服务就绪..."
sleep 5

for i in {1..12}; do
    if docker compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        print_success "服务已就绪"
        break
    fi
    if [ $i -eq 12 ]; then
        print_error "服务启动超时"
        exit 1
    fi
    echo -n "."
    sleep 5
done
echo ""

print_step "🏥 检查服务健康状态..."
docker compose -f $COMPOSE_FILE ps
echo ""

print_step "📋 查看最近日志..."
docker compose -f $COMPOSE_FILE logs --tail=30
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
