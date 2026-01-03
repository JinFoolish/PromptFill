import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from './routes/RouterProvider'
import './index.css'
import { initThemeAndDarkMode } from './utils/themeManager'

// 初始化主题和暗色模式
initThemeAndDarkMode()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider />
  </React.StrictMode>,
)

