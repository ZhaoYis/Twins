# 权限管理系统配置说明

## 环境变量配置

在 `.env.local` 文件中添加管理员邮箱配置：

```env
# Admin Configuration
ADMIN_EMAIL=your-admin@example.com
```

## 初始化权限系统

运行初始化脚本：

```bash
npm run init-permissions
# 或
npx tsx scripts/init-permissions.ts
```

## 功能说明

### 1. 自动创建的系统角色

- **超级管理员 (admin)**：拥有所有权限（17个）
- **编辑者 (editor)**：可管理内容和反馈（5个权限）
- **查看者 (viewer)**：只能查看数据（只读权限）

### 2. 管理员账号自动分配

如果配置了 `ADMIN_EMAIL` 环境变量：

- 初始化脚本会查找该邮箱对应的用户
- 如果用户存在，自动分配超级管理员角色
- 如果用户不存在，会提示稍后手动分配

**注意**：用户需要先登录一次（通过 Google 或 GitHub OAuth），系统才会创建用户记录。之后可以手动分配管理员角色。

### 3. 手动分配管理员角色

如果初始化时用户还未创建，可以：

1. 让用户先登录系统
2. 管理员访问 `/admin/roles` 页面
3. 在用户管理页面为用户分配角色（功能待实现）

## 权限列表

### 用户管理
- `users:read` - 查看用户列表
- `users:write` - 创建/编辑用户
- `users:delete` - 删除用户
- `users:manage` - 管理用户权限

### 内容管理
- `content:read` - 查看内容
- `content:write` - 创建/编辑内容
- `content:delete` - 删除内容

### 反馈管理
- `feedback:read` - 查看用户反馈
- `feedback:write` - 处理用户反馈

### Provider 管理
- `providers:read` - 查看 Provider 配置
- `providers:write` - 配置 Provider
- `providers:delete` - 删除 Provider

### 订阅管理
- `subscriptions:read` - 查看订阅
- `subscriptions:write` - 管理订阅

### 角色权限管理
- `roles:read` - 查看角色
- `roles:write` - 管理角色
- `roles:delete` - 删除角色

## API 端点

### 角色管理
- `GET /api/admin/roles` - 获取所有角色
- `POST /api/admin/roles` - 创建新角色
- `PATCH /api/admin/roles/[id]` - 更新角色
- `DELETE /api/admin/roles/[id]` - 删除角色

### 权限管理
- `GET /api/admin/permissions` - 获取所有权限

## 访问管理界面

管理员登录后访问：`/admin/roles`
