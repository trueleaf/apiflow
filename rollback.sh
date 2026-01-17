#!/bin/bash

# Apiflow Docker 回滚脚本
# 使用方法: ./rollback.sh <版本号>
# 示例: ./rollback.sh v1.2.3

set -e

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

if [ $# -eq 0 ]; then
    print_error "错误: 请指定要回滚的版本号"
    echo ""
    echo "使用方法: $0 <版本号>"
    echo "示例: $0 v1.2.3"
    echo ""
    echo "可用的版本标签示例:"
    echo "  latest              - 最新版本"
    echo "  v1.2.3              - 特定版本号"
    echo "  abc123def456        - Git commit SHA"
    echo ""
    exit 1
fi

VERSION=$1
COMPOSE_FILE="docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "错误: 未找到 docker-compose.yml 文件"
    exit 1
fi

echo ""
print_step "🔄 开始回滚到版本: $VERSION"
echo ""

print_step "📝 创建临时配置文件..."
cp docker-compose.yml docker-compose.rollback.yml

sed -i "s/:latest/:${VERSION}/g" docker-compose.rollback.yml
sed -i "s/:v[0-9]\+\.[0-9]\+\.[0-9]\+/:${VERSION}/g" docker-compose.rollback.yml
sed -i "s/:[a-f0-9]\{12\}/:${VERSION}/g" docker-compose.rollback.yml

print_success "临时配置文件已创建"
echo ""

print_step "⏹️  停止当前服务..."
docker compose -f docker-compose.rollback.yml down
print_success "服务已停止"
echo ""

print_step "📥 拉取指定版本镜像..."
if docker compose -f docker-compose.rollback.yml pull; then
    print_success "镜像拉取完成"
else
    print_error "镜像拉取失败，请检查版本号是否正确"
    rm -f docker-compose.rollback.yml
    exit 1
fi
echo ""

print_step "▶️  启动服务..."
if docker compose -f docker-compose.rollback.yml up -d; then
    print_success "服务已启动"
else
    print_error "服务启动失败"
    rm -f docker-compose.rollback.yml
    exit 1
fi
echo ""

print_step "⏳ 等待服务就绪..."
sleep 10
print_success "服务已就绪"
echo ""

print_step "🏥 检查服务状态..."
docker compose -f docker-compose.rollback.yml ps
echo ""

print_success "✅ 回滚完成！"
echo ""
print_step "如果回滚成功，可以删除临时文件:"
echo "  rm docker-compose.rollback.yml"
echo ""
print_step "如果需要恢复到最新版本，运行:"
echo "  ./update.sh"
echo ""
