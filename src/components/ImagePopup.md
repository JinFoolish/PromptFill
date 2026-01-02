# ImagePopup 组件

一个可复用的图片弹窗组件，支持 3D 效果、多图片浏览、移动端手势操作等功能。

## 功能特性

- 🖼️ 支持单张或多张图片浏览
- 📱 移动端友好，支持手势操作
- 🎨 3D 视觉效果（桌面端鼠标跟随，移动端陀螺仪）
- 📝 可选的模板信息显示
- 🎯 自定义操作按钮支持
- 🌙 深色/浅色主题支持

## 基本用法

### 简单图片预览

```jsx
import { ImagePopup } from './components';

function MyComponent() {
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <ImagePopup
      isOpen={showPopup}
      onClose={() => setShowPopup(false)}
      imageUrl="https://example.com/image.jpg"
      showTemplateInfo={false}
    />
  );
}
```

### 多图片浏览

```jsx
<ImagePopup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  imageUrl="https://example.com/image1.jpg"
  imageUrls={[
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ]}
  showTemplateInfo={false}
/>
```

### 带模板信息的预览

```jsx
<ImagePopup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  imageUrl="https://example.com/image.jpg"
  template={{
    name: "模板名称",
    author: "作者",
    content: "模板内容描述...",
    tags: ["tag1", "tag2"]
  }}
  language="cn"
  t={(key) => translations[key]}
  displayTag={(tag) => tagLabels[tag]}
  onUseTemplate={(template) => {
    console.log('使用模板:', template);
  }}
  showTemplateInfo={true}
/>
```

### 自定义操作按钮

```jsx
<ImagePopup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  imageUrl="https://example.com/image.jpg"
  customActions={(currentImageUrl, currentIndex, allImages) => (
    <div className="flex gap-3">
      <button onClick={() => downloadImage(currentImageUrl)}>
        下载
      </button>
      <button onClick={() => shareImage(currentImageUrl)}>
        分享
      </button>
    </div>
  )}
  showTemplateInfo={false}
/>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isOpen` | `boolean` | - | 是否显示弹窗 |
| `onClose` | `function` | - | 关闭弹窗的回调函数 |
| `imageUrl` | `string` | - | 当前显示的图片URL |
| `imageUrls` | `string[]` | `[]` | 所有图片URL数组（用于多图浏览） |
| `template` | `object` | `null` | 模板信息对象 |
| `language` | `string` | `'cn'` | 界面语言 |
| `t` | `function` | `(key) => key` | 翻译函数 |
| `displayTag` | `function` | `(tag) => tag` | 标签显示函数 |
| `onUseTemplate` | `function` | `null` | 使用模板的回调函数 |
| `isDarkMode` | `boolean` | `false` | 是否为深色模式 |
| `showTemplateInfo` | `boolean` | `true` | 是否显示模板信息 |
| `className` | `string` | `""` | 自定义CSS类名 |
| `customActions` | `function` | `null` | 自定义操作按钮渲染函数 |

## 模板对象结构

```javascript
{
  name: "模板名称", // string 或 多语言对象 {cn: "中文", en: "English"}
  author: "作者名称", // string
  content: "模板内容", // string 或 多语言对象
  tags: ["tag1", "tag2"], // string[]
  // 其他自定义字段...
}
```

## 移动端特性

- **手势操作**: 向上滑动展开详情，向下滑动收起
- **陀螺仪支持**: 设备倾斜时图片会有 3D 效果
- **触摸友好**: 优化的触摸交互体验
- **自适应布局**: 响应式设计，适配不同屏幕尺寸

## 桌面端特性

- **鼠标跟随**: 鼠标移动时图片有 3D 视差效果
- **键盘导航**: 支持左右箭头键切换图片
- **高分辨率**: 支持大尺寸图片显示

## 样式定制

组件使用 Tailwind CSS 构建，可以通过 `className` 参数添加自定义样式：

```jsx
<ImagePopup
  className="custom-image-popup"
  // ... 其他props
/>
```

## 注意事项

1. 确保图片URL可访问，避免跨域问题
2. 大图片可能影响加载性能，建议使用适当的图片尺寸
3. 移动端陀螺仪功能需要HTTPS环境
4. 自定义操作按钮函数会在每次图片切换时重新调用