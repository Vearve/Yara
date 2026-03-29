import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ConfigProvider, theme } from 'antd'
import 'antd/dist/reset.css'
import { OpenAPI } from './api/core/OpenAPI'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

const qc = new QueryClient()

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
        colorBgBase: '#f6f5f2',
        colorBgContainer: '#ffffff',
        colorBorder: 'rgba(53, 44, 70, 0.12)',
        colorText: '#252033',
        colorTextSecondary: '#625b75',
        borderRadius: 12,
        fontFamily: 'Manrope, Space Grotesk, system-ui, -apple-system, sans-serif',
      },
      components: {
        Layout: {
          siderBg: '#2a163c',
          headerBg: '#ffffff',
          bodyBg: '#f1eee8',
        },
        Menu: {
          itemBg: '#2a163c',
          itemSelectedBg: 'rgba(255, 255, 255, 0.16)',
          itemHoverBg: 'rgba(255, 255, 255, 0.08)',
          itemSelectedColor: '#f3effa',
          itemColor: '#e8e0f5',
        },
        Card: {
          colorBgContainer: '#ffffff',
          colorBorderSecondary: 'rgba(53, 44, 70, 0.12)',
        },
        Table: {
          headerBg: '#f4f0eb',
          rowHoverBg: '#f8f4ef',
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
      <QueryClientProvider client={qc}>
        <AppWithTheme />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
