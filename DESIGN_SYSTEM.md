# ProSub 设计系统

## 概述

ProSub 采用了现代化的设计系统，灵感来源于 Cursor 编辑器的优雅界面。这个设计系统注重用户体验、视觉层次和交互反馈，为管理平台提供了专业而美观的界面。

## 设计原则

### 1. 现代简约
- 清晰的视觉层次
- 简洁的界面布局
- 减少视觉噪音

### 2. 一致性
- 统一的设计语言
- 一致的交互模式
- 标准化的组件库

### 3. 可访问性
- 良好的对比度
- 清晰的字体层级
- 直观的导航结构

### 4. 响应式设计
- 移动端优先
- 自适应布局
- 流畅的交互体验

## 色彩系统

### 主色调
```css
--primary-color: #00d4aa;      /* 主色 - 青绿色 */
--primary-light: #00f5c4;      /* 浅色变体 */
--primary-dark: #00b894;       /* 深色变体 */
```

### 辅助色
```css
--secondary-color: #6366f1;    /* 次要色 - 靛蓝色 */
--success-color: #10b981;      /* 成功色 - 绿色 */
--warning-color: #f59e0b;      /* 警告色 - 橙色 */
--error-color: #ef4444;        /* 错误色 - 红色 */
--info-color: #3b82f6;         /* 信息色 - 蓝色 */
```

### 中性色
```css
--background-color: #fafafa;   /* 背景色 */
--surface-color: #ffffff;      /* 表面色 */
--card-bg: #ffffff;            /* 卡片背景 */
--text-primary: #0f172a;       /* 主要文字 */
--text-secondary: #475569;     /* 次要文字 */
--text-tertiary: #94a3b8;      /* 第三级文字 */
--border-color: #e2e8f0;       /* 边框色 */
```

## 字体系统

### 字体族
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### 字体大小
```css
--font-size-xs: 0.75rem;       /* 12px */
--font-size-sm: 0.875rem;      /* 14px */
--font-size-base: 1rem;        /* 16px */
--font-size-lg: 1.125rem;      /* 18px */
--font-size-xl: 1.25rem;       /* 20px */
--font-size-2xl: 1.5rem;       /* 24px */
--font-size-3xl: 1.875rem;     /* 30px */
--font-size-4xl: 2.25rem;      /* 36px */
--font-size-5xl: 3rem;         /* 48px */
```

## 间距系统

```css
--space-1: 0.25rem;            /* 4px */
--space-2: 0.5rem;             /* 8px */
--space-3: 0.75rem;            /* 12px */
--space-4: 1rem;               /* 16px */
--space-5: 1.25rem;            /* 20px */
--space-6: 1.5rem;             /* 24px */
--space-8: 2rem;               /* 32px */
--space-10: 2.5rem;            /* 40px */
--space-12: 3rem;              /* 48px */
--space-16: 4rem;              /* 64px */
--space-20: 5rem;              /* 80px */
--space-24: 6rem;              /* 96px */
```

## 圆角系统

```css
--radius-xs: 0.125rem;         /* 2px */
--radius-sm: 0.25rem;          /* 4px */
--radius-md: 0.375rem;         /* 6px */
--radius-lg: 0.5rem;           /* 8px */
--radius-xl: 0.75rem;          /* 12px */
--radius-2xl: 1rem;            /* 16px */
--radius-3xl: 1.5rem;          /* 24px */
```

## 阴影系统

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## 动画系统

### 过渡时间
```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

### 缓动函数
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 组件设计

### 按钮
- 主要按钮：渐变背景，悬停时上移效果
- 次要按钮：边框样式，悬停时边框变色
- 文字按钮：无背景，悬停时背景色变化

### 卡片
- 圆角设计
- 轻微阴影
- 悬停时阴影加深和上移效果

### 输入框
- 圆角边框
- 聚焦时边框变色和阴影
- 图标前缀支持

### 导航
- 顶部导航：固定定位，毛玻璃效果
- 底部导航：移动端优化，活跃状态突出显示

## 深色模式

深色模式采用深灰色调，保持与浅色模式相同的视觉层次：

```css
.dark {
  --background-color: #0a0a0a;
  --surface-color: #1a1a1a;
  --card-bg: #1a1a1a;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --border-color: #27272a;
  --border-light: #3f3f46;
  --divider-color: #27272a;
}
```

## 响应式断点

```css
/* 移动端 */
@media (max-width: 768px) { }

/* 平板 */
@media (max-width: 1024px) { }

/* 桌面端 */
@media (min-width: 1025px) { }
```

## 使用指南

### 1. 引入样式
确保在项目中引入了 `src/globals.css` 文件，其中包含了完整的设计系统。

### 2. 使用 CSS 变量
```css
.my-component {
  background-color: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

### 3. 使用工具类
```html
<div class="fade-in">淡入动画</div>
<div class="slide-up">上滑动画</div>
<div class="scale-in">缩放动画</div>
```

### 4. 深色模式切换
```javascript
// 切换深色模式
document.documentElement.classList.toggle('dark');
localStorage.setItem('theme', 'dark');
```

## 最佳实践

1. **保持一致性**：使用设计系统中定义的颜色、字体和间距
2. **渐进增强**：确保基本功能在所有设备上都能正常工作
3. **性能优化**：合理使用动画，避免过度装饰
4. **可访问性**：确保足够的对比度和清晰的焦点状态
5. **用户反馈**：提供清晰的交互反馈和状态指示

## 更新日志

### v2.0.0 (当前版本)
- 全新设计系统，灵感来源于 Cursor
- 现代化的色彩方案和组件设计
- 完善的深色模式支持
- 优化的移动端体验
- 统一的动画和过渡效果

### v1.0.0
- 初始版本设计
- 基于 Ant Design Vue 的基础样式
- 简单的响应式布局 