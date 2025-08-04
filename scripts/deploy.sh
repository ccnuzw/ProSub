#!/bin/bash

# 部署脚本 - 删除wrangler.toml以避免UUID冲突

echo "🚀 开始部署..."

# 备份wrangler.toml（如果存在）
if [ -f "wrangler.toml" ]; then
    echo "📦 备份 wrangler.toml..."
    cp wrangler.toml wrangler.toml.backup
fi

# 删除wrangler.toml以避免部署时的UUID冲突
echo "🗑️ 删除 wrangler.toml 以避免UUID冲突..."
rm -f wrangler.toml

# 构建项目
echo "🔨 构建项目..."
npm run build

echo "✅ 部署准备完成！"
echo "📝 请将代码推送到GitHub，然后在Cloudflare Dashboard中配置绑定。"
echo "🔄 部署完成后，可以恢复本地开发配置："
echo "   cp wrangler.toml.backup wrangler.toml" 