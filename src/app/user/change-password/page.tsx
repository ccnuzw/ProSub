
'use client'

import { Form, Input, Button, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ChangePasswordFormValues {
  newPassword?: string;
  confirmNewPassword?: string;
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: ChangePasswordFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me') // Get current user info
      if (!res.ok) {
        throw new Error('无法获取当前用户信息')
      }
      const currentUser = await res.json()

      const updateRes = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.newPassword }),
      })

      if (updateRes.ok) {
        message.success('密码修改成功')
        router.push('/dashboard') // Redirect to dashboard after password change
      } else {
        const errorData = await updateRes.json()
        message.error(errorData.message || '密码修改失败')
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '网络错误，请重试')
      } else {
        message.error(String(error) || '网络错误，请重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>修改密码</h1>
      <Form
        name="change_password"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[{ required: true, message: '请输入新密码!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmNewPassword"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: '请确认新密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致!'))
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
