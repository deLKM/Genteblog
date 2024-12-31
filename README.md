# Genteblog

Genteblog是一个现代化的Web文章平台，专注于提供优质的写作和阅读体验。

## ✨ 特性

- 🎨 **优雅的界面设计**
  - 现代化的UI/UX设计
  - 响应式布局，支持多端访问
  - 自定义主题和个性化设置

- ✍️ **专业的写作体验**
  - Markdown编辑器
  - 实时预览
  - 自动保存
  - 图片上传和管理
  - 文章封面设计工具

- 👥 **用户系统**
  - 邮箱注册登录
  - 个人主页定制
  - 文章管理
  - 数据统计

- 🔍 **内容发现**
  - 智能推荐
  - 标签分类
  - 搜索功能
  - 热门排行

## 🚀 技术栈

- **前端**
  - React 18
  - Vite
  - TailwindCSS
  - Firebase Auth
  - React Router

- **后端**
  - Firebase
  - Cloud Functions
  - Cloud Storage

## 📦 安装

1. 克隆仓库
```bash
git clone https://github.com/deLKM/Genteblog.git
cd Genteblog
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入你的Firebase配置信息。

4. 启动开发服务器
```bash
npm run dev
```

## 🔧 配置

### Firebase 配置

1. 创建Firebase项目
2. 开启Authentication服务
3. 配置Storage规则
4. 将配置信息添加到环境变量

### 环境变量

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📝 使用指南

### 用户功能

- **注册/登录**：支持邮箱注册和登录
- **个人主页**：自定义个人资料和封面图
- **文章管理**：创建、编辑、删除文章
- **数据统计**：查看阅读量和点赞数据

### 写作功能

- **创建文章**：支持Markdown格式
- **封面设计**：内置封面生成器和上传功能
- **草稿保存**：自动保存草稿
- **发布设置**：控制文章可见性

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [React Router](https://reactrouter.com/)

<p align="center">Made with ❤️ by Your Team</p>