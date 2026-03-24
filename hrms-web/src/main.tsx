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
        colorPrimary: '#ca8a04',
        colorBgBase: '#ffffff',
        colorBgContainer: '#f9fafb',
        colorBorder: 'rgba(202, 138, 4, 0.15)',
        colorText: '#1f2937',
        colorTextSecondary: '#6b7280',
        borderRadius: 12,
        fontFamily: 'Space Grotesk, system-ui, -apple-system, sans-serif',
      },
      components: {
        Layout: {
          siderBg: '#ffffff',
          headerBg: '#ffffff',
          bodyBg: '#f9fafb',
        },
        Menu: {
          itemBg: '#ffffff',
          itemSelectedBg: 'rgba(202, 138, 4, 0.1)',
          itemHoverBg: 'rgba(202, 138, 4, 0.06)',
        },
        Card: {
          colorBgContainer: 'rgba(243, 244, 246, 0.8)',
          colorBorderSecondary: 'rgba(202, 138, 4, 0.15)',
        },
        Table: {
          headerBg: 'rgba(202, 138, 4, 0.06)',
          rowHoverBg: 'rgba(202, 138, 4, 0.03)',
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
