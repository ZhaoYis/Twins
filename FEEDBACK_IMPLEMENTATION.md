# 反馈功能实现总结

## 改动内容

### 1. 数据库 Schema 更新
**文件:** `src/lib/db/schema.ts`
- 添加了 `feedbacks` 表,包含以下字段:
  - `id`: UUID 主键
  - `email`: 用户邮箱
  - `content`: 反馈内容
  - `status`: 状态 (pending/reviewed/resolved)
  - `createdAt`: 创建时间
  - `updatedAt`: 更新时间

### 2. 前端反馈表单
**文件:** `src/components/landing/FAQ.tsx`
- 将底部的"联系支持"链接改造为反馈表单
- 添加了邮箱输入框和反馈内容文本框
- 实现了表单验证和提交功能
- 添加了提交状态的反馈(成功/失败提示)

### 3. 用户提交反馈 API
**文件:** `src/app/api/feedback/route.ts`
- `POST /api/feedback`: 提交新反馈
  - 验证邮箱格式
  - 验证内容长度(10-2000字符)
  - 无需登录即可提交
- `GET /api/feedback`: 获取所有反馈(供管理员使用)

### 4. 管理员反馈管理
**文件:** `src/app/[locale]/admin/feedback/page.tsx`
- 创建了反馈管理页面
- 显示所有用户提交的反馈
- 可以更改反馈状态(待处理/已查看/已解决)
- 显示邮箱、内容、状态和提交时间

**文件:** `src/app/api/admin/feedback/route.ts`
- `GET /api/admin/feedback`: 获取所有反馈(需管理员权限)

**文件:** `src/app/api/admin/feedback/[id]/route.ts`
- `PATCH /api/admin/feedback/[id]`: 更新反馈状态(需管理员权限)

### 5. UI 组件
**文件:** `src/components/ui/badge.tsx`
- 添加了 Badge 徽章组件

**文件:** `src/components/ui/table.tsx`
- 添加了 Table 表格组件

## 使用说明

### 用户端
1. 访问网站首页,滚动到 FAQ 部分
2. 在底部的反馈表单中输入邮箱和反馈内容
3. 点击"提交反馈"按钮

### 管理员端
1. 登录管理员账号
2. 访问 `/admin/feedback` 页面
3. 查看所有用户提交的反馈
4. 可以更改反馈状态(待处理→已查看→已解决)

## 数据库迁移
反馈表已自动创建,无需手动迁移。

## API 端点
- `POST /api/feedback` - 提交反馈(公开)
- `GET /api/admin/feedback` - 获取所有反馈(管理员)
- `PATCH /api/admin/feedback/[id]` - 更新反馈状态(管理员)
