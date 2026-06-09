import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import { OpenAPI } from './api/core/OpenAPI'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { queryClient } from './lib/queryClient'

OpenAPI.TOKEN = async () => localStorage.getItem('access') || ''
OpenAPI.HEADERS = async () => {
  const workspaceId = localStorage.getItem('workspaceId')
  return workspaceId ? { 'X-Workspace-ID': workspaceId } : {}
}

// Wrapper component to apply theme-aware Ant Design config
const AppWithTheme = () => {
  const { theme: currentTheme } = useTheme()

  const isDark = currentTheme === 'dark'
  const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm

  const themeConfig = isDark
    ? {
      algorithm,
      token: {
        colorPrimary: '#f5c400',
        colorBgBase: '#05060a',
        colorBgContainer: '#0b0f1a',
        colorBorder: 'rgba(255, 227, 122, 0.25)',
        colorText: '#f7f8fb',
        colorTextSecondary: '#c4c8d4',
        borderRadius: 12,
        fontFamily: 'Space Grotesk, system-ui, -apple-system, sans-serif',
      },
      components: {
        Layout: {
          siderBg: '#05060a',
          headerBg: '#05060a',
          bodyBg: '#0b0f1a',
        },
        Menu: {
          darkItemBg: '#05060a',
          darkItemSelectedBg: 'rgba(245, 196, 0, 0.16)',
          darkItemHoverBg: 'rgba(245, 196, 0, 0.08)',
        },
        Card: {
          colorBgContainer: 'rgba(15, 22, 40, 0.8)',
          colorBorderSecondary: 'rgba(255, 227, 122, 0.25)',
        },
        Table: {
          headerBg: 'rgba(245, 196, 0, 0.08)',
          rowHoverBg: 'rgba(245, 196, 0, 0.05)',
        },
        Button: {
          controlHeight: 40,
          borderRadius: 12,
        },
      },
    }
    : {
      algorithm,
      token: {
        colorPrimary: '#4a3fcf',
        colorBgBase: '#ccc9c3',
        colorBgContainer: '#d9d6d0',
        colorBgElevated: '#e2dfd9',
        colorBorder: 'rgba(53, 44, 70, 0.16)',
        colorText: '#1e1a2b',
        colorTextSecondary: '#4e4863',
        borderRadius: 12,
        fontFamily: 'Manrope, Space Grotesk, system-ui, -apple-system, sans-serif',
      },
      components: {
        Layout: {
          siderBg: '#2a163c',
          headerBg: '#dedad4',
          bodyBg: '#ccc9c3',
        },
        Menu: {
          itemBg: '#2a163c',
          itemSelectedBg: 'rgba(255, 255, 255, 0.16)',
          itemHoverBg: 'rgba(255, 255, 255, 0.08)',
          itemSelectedColor: '#f3effa',
          itemColor: '#e8e0f5',
        },
        Card: {
          colorBgContainer: '#d9d6d0',
          colorBorderSecondary: 'rgba(53, 44, 70, 0.14)',
        },
        Table: {
          colorBgContainer: '#d9d6d0',
          headerBg: '#c2bfb9',
          rowHoverBg: '#cac7c1',
        },
        Modal: {
          contentBg: '#dedad4',
          headerBg: '#dedad4',
        },
        Drawer: {
          colorBgElevated: '#dedad4',
        },
        Select: {
          colorBgContainer: '#d9d6d0',
        },
        Input: {
          colorBgContainer: '#d9d6d0',
        },
        DatePicker: {
          colorBgContainer: '#d9d6d0',
        },
        Button: {
          controlHeight: 40,
          borderRadius: 12,
        },
      },
    }

  return (
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppWithTheme />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
