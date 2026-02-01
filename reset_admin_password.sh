#!/bin/bash
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
  echo -e "${COLOR_GREEN}✔${COLOR_RESET} $1"
}
print_warning() {
  echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"
}
print_error() {
  echo -e "${COLOR_RED}✘${COLOR_RESET} $1"
}
usage() {
  cat <<'EOF'
用法:
  ./reset_admin_password.sh [--password <新密码>] [--loginName <管理员登录名>]

说明:
  - 默认重置 loginName=admin 的密码
  - 优先尝试使用 docker compose 的 mongo 容器执行 mongosh
  - 若未检测到 docker compose，则使用本机 mongosh + .env 中的 MONGODB_URI（或 MONGODB_USER/MONGODB_PASS/MONGODB_AUTH_SOURCE）
EOF
}
load_env() {
  if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
}
check_password_strength() {
  local password="$1"
  if [ ${#password} -lt 8 ]; then
    return 1
  fi
  if ! echo "$password" | grep -Eq '[A-Za-z]'; then
    return 1
  fi
  if ! echo "$password" | grep -Eq '[0-9]'; then
    return 1
  fi
  return 0
}
prompt_password() {
  local password=""
  print_step "请输入新密码（至少 8 位，且包含字母 + 数字）"
  if command -v stty >/dev/null 2>&1; then
    stty -echo
    read -r password
    stty echo
    echo ""
  else
    read -r password
  fi
  echo "$password"
}
generate_salt_and_hash() {
  local password="$1"
  if ! command -v node >/dev/null 2>&1; then
    print_error "未找到 node，无法按服务端规则生成 salt 和哈希"
    print_error "请先安装 node，或手动在 MongoDB 中更新 security_users 的 salt/password 字段"
    exit 1
  fi
  node -e "const {createHash,randomInt}=require('crypto');const password=process.argv[1]??'';const salt=String(randomInt(10000,10000000));const hash=createHash('md5').update((password+salt).slice(2)).digest('hex');process.stdout.write(salt+'\\n'+hash+'\\n');" "$password"
}
run_mongosh_docker() {
  local db_name="$1"
  local login_name="$2"
  local salt="$3"
  local hash="$4"
  if [ -z "${MONGO_ROOT_USERNAME:-}" ] || [ -z "${MONGO_ROOT_PASSWORD:-}" ]; then
    print_error "检测到 docker compose，但 .env 缺少 MONGO_ROOT_USERNAME / MONGO_ROOT_PASSWORD"
    exit 1
  fi
  docker compose exec -T mongo mongosh --quiet \
    --username "$MONGO_ROOT_USERNAME" \
    --password "$MONGO_ROOT_PASSWORD" \
    --authenticationDatabase admin \
    --eval "db=db.getSiblingDB('$db_name');const r=db.security_users.updateOne({loginName:'$login_name'},{\$set:{salt:'$salt',password:'$hash',isEnabled:true}});printjson({matched:r.matchedCount,modified:r.modifiedCount});"
}
run_mongosh_local() {
  local db_name="$1"
  local login_name="$2"
  local salt="$3"
  local hash="$4"
  if ! command -v mongosh >/dev/null 2>&1; then
    print_error "未找到 mongosh，无法连接 MongoDB 执行重置"
    print_error "若你使用 docker compose 部署，请在项目根目录运行本脚本，并确保 docker compose 的 mongo 服务在运行"
    exit 1
  fi
  local uri="${MONGODB_URI:-mongodb://localhost:27017/${db_name}}"
  local extra_args=()
  if [ -n "${MONGODB_USER:-}" ]; then
    extra_args+=(--username "$MONGODB_USER")
  fi
  if [ -n "${MONGODB_PASS:-}" ]; then
    extra_args+=(--password "$MONGODB_PASS")
  fi
  if [ -n "${MONGODB_AUTH_SOURCE:-}" ]; then
    extra_args+=(--authenticationDatabase "$MONGODB_AUTH_SOURCE")
  fi
  mongosh --quiet "$uri" "${extra_args[@]}" \
    --eval "db=db.getSiblingDB('$db_name');const r=db.security_users.updateOne({loginName:'$login_name'},{\$set:{salt:'$salt',password:'$hash',isEnabled:true}});printjson({matched:r.matchedCount,modified:r.modifiedCount});"
}

cd "$(cd "$(dirname "$0")" && pwd)"
load_env

LOGIN_NAME="admin"
PASSWORD=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --password)
      PASSWORD="${2:-}"
      shift 2
      ;;
    --loginName)
      LOGIN_NAME="${2:-admin}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      print_error "未知参数: $1"
      usage
      exit 1
      ;;
  esac
done

if [ -z "$PASSWORD" ]; then
  PASSWORD="$(prompt_password)"
fi
if ! check_password_strength "$PASSWORD"; then
  print_warning "密码不满足强度要求（至少 8 位，且包含字母 + 数字），但仍会执行重置"
fi

DB_NAME="${MONGO_DATABASE:-apiflow}"
if [ -n "${MONGODB_URI:-}" ]; then
  uri_db="$(echo "$MONGODB_URI" | sed -E 's#^.+/([^/?]+).*$#\1#' || true)"
  if [ -n "$uri_db" ] && [ "$uri_db" != "$MONGODB_URI" ]; then
    DB_NAME="$uri_db"
  fi
fi

print_step "生成新的 salt 与哈希（按服务端规则）"
SALT_HASH="$(generate_salt_and_hash "$PASSWORD" | tr -d '\r')"
SALT="${SALT_HASH%%$'\n'*}"
HASH="${SALT_HASH#*$'\n'}"
HASH="${HASH%%$'\n'*}"
if [ -z "$SALT" ] || [ -z "$HASH" ]; then
  print_error "生成 salt/哈希失败"
  exit 1
fi

print_step "重置用户密码：loginName=${LOGIN_NAME}，db=${DB_NAME}"
MONGO_CONTAINER_ID=""
if command -v docker >/dev/null 2>&1; then
  MONGO_CONTAINER_ID="$(docker compose ps -q mongo 2>/dev/null || true)"
fi
if [ -n "$MONGO_CONTAINER_ID" ]; then
  RESULT="$(run_mongosh_docker "$DB_NAME" "$LOGIN_NAME" "$SALT" "$HASH" || true)"
else
  RESULT="$(run_mongosh_local "$DB_NAME" "$LOGIN_NAME" "$SALT" "$HASH" || true)"
fi

echo "$RESULT"
if echo "$RESULT" | grep -Eq '"matched"[[:space:]]*:[[:space:]]*1'; then
  print_success "密码已重置完成（请用新密码登录）"
else
  print_warning "未匹配到目标用户（matched!=1），请确认 loginName 是否正确，以及数据库中是否存在该用户"
  exit 2
fi
