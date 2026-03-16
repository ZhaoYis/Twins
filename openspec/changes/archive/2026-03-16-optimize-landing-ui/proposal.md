## Why

当前首页的UI设计虽然功能完整，但存在一些视觉细节上的不足，影响了整体的专业感和整洁度。主要问题包括：各区域的视觉层次不够清晰、某些装饰元素过于复杂、间距和排版不够统一。进行一次系统性的UI优化，可以提升用户体验，让页面看起来更加精致和专业。

## What Changes

1. **Hero区域优化**
   - 简化stats卡片的间距和排版，使其更加紧凑整齐
   - 优化trust badges的展示方式，使用更简洁的视觉处理
   - 减少背景装饰元素的层次，降低视觉噪音

2. **Features区域优化**
   - 统一三个主要功能卡片的视觉权重，去除尺寸差异
   - 简化tech features网格的边框处理
   - 优化section header与内容的间距

3. **HowItWorks区域优化**
   - 简化流程步骤之间的连接线，去除复杂的渐变效果
   - 优化demo tabs的整体视觉层次
   - 使输入/输出卡片更加清晰易读

4. **FAQ区域优化**
   - 简化折叠面板的边框处理
   - 优化问答项之间的间距

5. **Footer区域优化**
   - 减少装饰性背景元素
   - 优化链接区域的视觉层次

## Capabilities

### New Capabilities
- `landing-ui-cleanup`: 首页UI细节优化，包括视觉层次、间距、排版和装饰元素的系统性调整

### Modified Capabilities
- 无

## Impact

- 受影响代码：
  - `src/components/landing/Hero.tsx`
  - `src/components/landing/Features.tsx`
  - `src/components/landing/HowItWorks.tsx`
  - `src/components/landing/Pricing.tsx`
  - `src/components/landing/FAQ.tsx`
  - `src/components/landing/Footer.tsx`
  - `src/app/globals.css` (如需新增轻量级样式)

- 无API变更
- 无依赖变更
