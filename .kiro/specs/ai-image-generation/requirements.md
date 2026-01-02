# AI 生图功能需求文档

## 介绍

本项目需要在现有的 Prompt Fill 应用中集成 AI 生图功能，允许用户使用生成的提示词直接调用 AI 图像生成服务，并提供图片管理、历史记录等完整功能。同时需要优化应用的 UI 布局，重新组织左侧导航栏的功能分布。
还需要开发客户端功能，采用前后端分离架构，后端使用go语言，负责处理不同服务提供商的逻辑。前端调用go语言后端的API 来进行图片生成，对于现有的代码不要进行改动，增量开发。具体的图片生成逻辑由后端处理，需要给出和后端通信的接口规范。需要注意我们是单用户应用，用户配置的apikey统一保存在后端，前端不做处理，后端不需要考虑多用户同时请求，是单用户应用，使用wails打包。使用go+react+wails的路线，同时可以有web端+go，桌面端，两种形式。

## 术语表

- **AI_Generation_System**: AI 图像生成系统，负责处理图像生成请求和管理生成流程
- **Image_Generator**: 图像生成器，调用外部 AI 服务生成图像的核心组件
- **Configuration_Manager**: 配置管理器，管理 AI 服务提供商的配置和设置
- **History_Manager**: 历史记录管理器，管理用户主动保存的生图记录和本地文件（Web版本使用IndexedDB+本地下载，桌面版本使用本地存储+文件系统）
- **File_Manager**: 文件管理器，处理图片的另存为、复制和历史记录保存操作
- **UI_Layout_System**: UI 布局系统，管理应用界面的布局和导航结构
- **Error_Handler**: 错误处理器，统一处理API调用错误并格式化错误信息

## 需求

### 需求 1

**用户故事：** 作为用户，我希望能够使用生成的提示词直接调用 AI 生图服务，以便快速获得图像结果。

#### 验收标准

1. WHEN a user completes prompt editing, THE AI_Generation_System SHALL provide a "生成图片" button
2. WHEN a user clicks the generate button, THE Image_Generator SHALL call the configured AI image generation API
3. WHEN image generation completes successfully, THE AI_Generation_System SHALL display the generated image in a modal dialog
4. IF image generation fails, THEN THE AI_Generation_System SHALL display clear error messages and provide retry options

### 需求 2

**用户故事：** 作为用户，我希望能够配置不同的 AI 生图服务提供商，以便根据需要选择合适的服务。

#### 验收标准

1. WHEN a user enters the settings page, THE Configuration_Manager SHALL provide AI image generation configuration options
2. WHEN a user selects a service provider, THE Configuration_Manager SHALL display corresponding configuration fields (API Key, model, etc.)
3. IF API call fails, THEN THE Error_Handler SHALL extract and display the service provider's error code and message from the response

### 需求 3

**用户故事：** 作为用户，我希望能够将生成的图片保存到本地，以便后续使用和管理。

#### 验收标准

1. WHEN image generation completes successfully, THE File_Manager SHALL provide "另存为", "复制图片", and "保存到历史记录" buttons
2. WHEN a user clicks "另存为", THE File_Manager SHALL open a file save dialog allowing user to choose location and filename
3. WHEN a user clicks "复制图片", THE File_Manager SHALL copy the image to system clipboard
4. WHEN a user clicks "保存到历史记录", THE File_Manager SHALL save both the image and prompt to local storage and add to history records
5. IF any save operation fails, THEN THE File_Manager SHALL display error information and provide retry options

### 需求 4

**用户故事：** 作为用户，我希望能够批量生成多张图片，以便一次性获得多个变体。

#### 验收标准

1. WHEN a user selects batch generation, THE AI_Generation_System SHALL provide quantity selection options (1-10 images)
2. WHILE batch generation is in progress, THE AI_Generation_System SHALL display progress bar and current status
3. WHEN all images complete generation successfully, THE AI_Generation_System SHALL display all results in a grid layout
4. IF partial generation fails, THEN THE AI_Generation_System SHALL display success and failure counts and allow retry of failed portions

### 需求 5

**用户故事：** 作为用户，我希望能够查看已保存的生图记录，以便回顾之前的生成结果。

#### 验收标准

1. WHEN a user accesses the history page, THE History_Manager SHALL display saved records with both images and corresponding prompts
2. WHEN a user selects a specific record, THE History_Manager SHALL display the full prompt and allow image operations
3. THE History_Manager SHALL only store records when user explicitly saves images to history

### 需求 6

**用户故事：** 作为用户，我希望应用的 UI 布局更加合理，左侧导航栏专注于页面切换功能。

#### 验收标准

1. THE UI_Layout_System SHALL display only page switching buttons in the left navigation bar
2. WHEN a user needs sorting functionality, THE UI_Layout_System SHALL relocate sort buttons to the template area
3. WHEN a user needs reset functionality, THE UI_Layout_System SHALL relocate reset buttons to appropriate contextual positions
4. WHEN interface is reorganized, THE UI_Layout_System SHALL maintain accessibility and usability of all functions

### 需求 7

**用户故事：** 作为开发者，我希望 AI 生图功能能够支持多个同步调用的服务提供商，以便为用户提供更多选择。

#### 验收标准

1. WHEN adding new service providers, THE Service_Adapter SHALL enable easy extension through adapter pattern for synchronous APIs
2. WHEN calling different synchronous services, THE Service_Adapter SHALL use unified interfaces for abstraction
3. WHEN synchronous services return different response formats, THE Service_Adapter SHALL correctly parse and process responses
4. IF a synchronous service call fails, THEN THE Error_Handler SHALL extract error code and message from the response

### 需求 8

**用户故事：** 作为用户，我希望生图功能在双平台上都能正常工作，并提供一致的功能体验。

#### 验收标准

1. THE AI_Generation_System SHALL provide identical functionality across Web and desktop platforms
2. THE History_Manager SHALL use IndexedDB for Web version and local storage for desktop version with consistent API
3. THE File_Manager SHALL handle image saving appropriately for each platform (download for Web, save dialog for desktop)
4. THE AI_Generation_System SHALL maintain consistent user interface and behavior across platforms

### 需求 9

**用户故事：** 作为用户，我希望能够管理已保存的历史记录，以便控制本地存储空间的使用。

#### 验收标准

1. WHEN a user views history records, THE History_Manager SHALL provide a delete button for each individual record
2. WHEN a user wants to clear all history, THE History_Manager SHALL provide a "一键清除" button with confirmation dialog
3. WHEN a user deletes records, THE History_Manager SHALL remove both the database record and associated image files
4. THE History_Manager SHALL display current storage usage information and file count to help users manage space