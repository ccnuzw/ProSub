'use client'

import { Card, Button, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 動態導入 UserForm 組件
const UserForm = dynamic(() => import('@/components/UserForm'), { 
    loading: () => <Spin tip="正在加载表单..." />,
    ssr: false 
});

export default function NewUserPage() {
    return (
      <Card
        title="添加新用戶"
        extra={
          <Link href="/user">
            <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
          </Link>
        }
      >
        <UserForm />
      </Card>
    )
}