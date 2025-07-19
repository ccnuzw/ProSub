// src/app/layout.tsx

import './globals.css'
import AntdRegistry from '@/components/AntdRegistry'
import ClientLayout from '@/components/ClientLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ProSub - 节点订阅管理',
  description: '轻量级机场订阅和自建节点管理分享项目',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      {/* --- 这是关键的修改 --- */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      {/* --- 修改结束 --- */}
      <body>
        <AntdRegistry>
          <ClientLayout>{children}</ClientLayout>
        </AntdRegistry>
      </body>
    </html>
  )
}