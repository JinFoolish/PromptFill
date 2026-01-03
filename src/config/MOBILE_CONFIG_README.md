# 移动端适配配置说明

## 概述

移动端适配功能已通过配置接口进行管理。默认情况下，移动端适配已禁用，所有组件将使用桌面端视图。

## 配置文件

配置文件位置：`src/config/mobileConfig.js`

## 配置选项

### ENABLE_MOBILE_ADAPTATION

控制是否启用移动端适配功能。

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 设置为 `true` 时启用移动端适配，设置为 `false` 时禁用

### MOBILE_BREAKPOINT

移动端断点宽度（像素）。

- **类型**: `number`
- **默认值**: `768`
- **说明**: 当屏幕宽度小于此值时，视为移动设备

## 使用方法

### 启用移动端适配

1. 打开 `src/config/mobileConfig.js`
2. 将 `ENABLE_MOBILE_ADAPTATION` 设置为 `true`：

```javascript
export const ENABLE_MOBILE_ADAPTATION = true;
```

3. 保存文件并重新加载应用

### 自定义断点

如果需要自定义移动端断点，可以修改 `MOBILE_BREAKPOINT` 的值：

```javascript
export const MOBILE_BREAKPOINT = 1024; // 例如：将断点设置为 1024px
```

## 在代码中使用

### 检测移动设备

```javascript
import { isMobileDevice, isMobileUserAgent } from '../config/mobileConfig';

// 基于屏幕宽度检测
const isMobile = isMobileDevice();

// 基于用户代理检测
const isMobileUA = isMobileUserAgent();
```

### 注意事项

1. 当 `ENABLE_MOBILE_ADAPTATION` 为 `false` 时，`isMobileDevice()` 和 `isMobileUserAgent()` 始终返回 `false`
2. 移动端专用组件（如 `MobileAnimatedSlogan`、`MobileSettingsView`、`MobileTabBar`）已保留在代码库中，但默认不会被使用
3. 如需重新启用移动端功能，除了修改配置外，可能还需要：
   - 恢复相关组件中的移动端检测逻辑
   - 恢复条件渲染代码
   - 确保移动端组件正确导入和使用

## 移动端组件

以下移动端专用组件已保留，但默认未使用：

- `src/components/MobileAnimatedSlogan.jsx` - 移动端动态 Slogan
- `src/components/MobileSettingsView.jsx` - 移动端设置视图
- `src/components/MobileTabBar.jsx` - 移动端底部导航栏

这些组件可以在重新启用移动端适配时使用。

## 已移除的功能

以下移动端相关功能已被移除或禁用：

1. 移动端底部导航栏（已注释，可通过配置重新启用）
2. 移动端设置模态框（已注释，可通过配置重新启用）
3. 移动端特定的样式和布局（已移除条件渲染）
4. 移动端检测逻辑（已替换为配置接口）

## 恢复移动端适配

如果需要完全恢复移动端适配功能，建议：

1. 启用配置接口中的 `ENABLE_MOBILE_ADAPTATION`
2. 检查并恢复相关组件中的移动端检测逻辑
3. 恢复 `App.jsx` 中的移动端条件渲染
4. 确保移动端组件正确导入和使用
5. 测试移动端功能是否正常工作

