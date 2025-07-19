'use client'

import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 ProfileForm 組件
const ProfileForm = dynamic(() => import('@/components/ProfileForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function NewProfilePage() {
  return (
    <Card
      title="添加新配置文件"
      extra={
        <Link href="/profiles">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      }
    >
      <ProfileForm />
    </Card>
  )
}