# Fork项目部署指南

## 🚀 快速部署步骤

### **步骤1: Fork项目**
1. 访问原项目GitHub页面
2. 点击右上角 "Fork" 按钮
3. 选择您的GitHub账户
4. 等待fork完成

### **步骤2: 克隆到本地**
```bash
git clone https://github.com/你的用户名/ProSub.git
cd ProSub
```

### **步骤3: 安装依赖**
```bash
npm install
```

### **步骤4: 创建Cloudflare资源**

#### **创建D1数据库**
```bash
npx wrangler d1 create prosub-db
```
记录输出的数据库UUID，例如：`12135af2-6981-42ef-b969-44771903e858`

#### **创建KV命名空间**
```bash
npx wrangler kv namespace create "PROSUB_KV"
```
记录输出的命名空间UUID，例如：`3afdd496f196482880762e55b480da4d`

### **步骤5: 更新配置文件**

编辑 `wrangler.toml` 文件，替换为您自己的UUID：

```toml
name = "prosub"
compatibility_date = "2025-07-22"
pages_build_output_dir = "dist"

[[kv_namespaces]]
binding = "KV"
id = "你的KV-UUID"
preview_id = "你的KV-UUID"

[[d1_databases]]
binding = "DB"
database_name = "prosub-db"
database_id = "你的D1-UUID"
```

### **步骤6: 初始化数据库**

#### **本地数据库**
```bash
npx wrangler d1 execute prosub-db --file=schema.sql
```

#### **远程数据库**
```bash
npx wrangler d1 execute prosub-db --remote --file=schema.sql
```

### **步骤7: 创建默认用户**
```bash
npx wrangler d1 execute prosub-db --remote --command="INSERT INTO users (id, username, password, role, created_at, updated_at) VALUES ('admin', 'admin', 'admin123', 'admin', datetime('now'), datetime('now'));"
```

### **步骤8: 部署到Cloudflare Pages**

#### **方法1: 通过GitHub自动部署**
1. 推送代码到GitHub
2. 在Cloudflare Dashboard中连接GitHub仓库
3. 配置构建设置

#### **方法2: 手动部署**
```bash
npm run build
npx wrangler pages deploy dist
```

### **步骤9: 配置Cloudflare Pages绑定**

在Cloudflare Dashboard中：

1. **进入Pages项目设置** → **Settings**
2. **找到Bindings部分** → 点击 **+ 添加**

#### **添加KV绑定**
- **类型**: 选择 **KV Namespace**
- **变量名**: `KV`
- **KV命名空间**: 选择您创建的KV命名空间
- 点击 **Save**

#### **添加D1绑定**
- **类型**: 选择 **D1 Database**
- **变量名**: `DB`
- **D1数据库**: 选择您创建的D1数据库
- 点击 **Save**

### **步骤10: 验证部署**

1. **访问您的Pages域名**
2. **使用默认凭据登录**
   - 用户名: `admin`
   - 密码: `admin123`

## 🔧 常见问题

### **Q: 为什么需要创建自己的资源？**
A: 每个Cloudflare账户的资源都是独立的，不能共享。每个fork者都需要自己的D1数据库和KV命名空间。

### **Q: 如何获取UUID？**
A: 使用以下命令查看：
```bash
# 查看D1数据库
npx wrangler d1 list

# 查看KV命名空间
npx wrangler kv namespace list
```

### **Q: 部署失败怎么办？**
A: 检查以下几点：
1. UUID是否正确
2. 数据库是否已初始化
3. Cloudflare Pages绑定是否正确配置

### **Q: 登录失败怎么办？**
A: 检查以下几点：
1. 默认用户是否已创建
2. D1数据库绑定是否正确
3. 网络请求是否正常

## 📝 注意事项

1. **资源隔离**: 每个fork者都有独立的数据库和缓存
2. **数据安全**: 不要将真实的UUID提交到公共仓库
3. **定期备份**: 建议定期备份重要的配置数据
4. **版本更新**: 关注原项目的更新，及时同步

## 🎉 完成！

配置完成后，您就可以使用自己的ProSub实例了！ 