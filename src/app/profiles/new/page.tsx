'use client'

import ProfileForm from '@/components/ProfileForm'
import { Card, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'

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