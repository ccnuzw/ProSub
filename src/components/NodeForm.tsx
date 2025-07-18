'use client'

import { Form, Input, Button, Select, InputNumber, message } from 'antd'
import { useRouter } from 'next/navigation'
import { Node } from '@/types'
import { useState, useEffect } from 'react'

const { Option } = Select

interface NodeFormProps {
  node?: Node
}

export default function NodeForm({ node }: NodeFormProps) {
  const [form] = Form.useForm()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 监听 'type' 字段的变化，以便动态渲染表单项
  const nodeType = Form.useWatch('type', form)

  useEffect(() => {
    if (node) {
      // 设置表单的初始值，如果存在 params，则将其 JSON.stringify
      form.setFieldsValue({
        ...node,
        params: node.params ? JSON.stringify(node.params, null, 2) : '',
      })
    } else {
      // 为新节点设置默认类型
      form.setFieldsValue({ type: 'ss' })
    }
  }, [node, form])

  const onFinish = async (values: Node) => {
    setLoading(true)
    const method = node ? 'PUT' : 'POST'
    const url = node ? `/api/nodes/${node.id}` : '/api/nodes'

    let parsedParams = null
    if (values.params) {
      try {
        parsedParams = JSON.parse(values.params)
      } catch (e) {
        console.error('Failed to parse params:', e)
        message.error('协议特定参数格式不正确，请输入有效的 JSON。')
        setLoading(false)
        return
      }
    }

    const dataToSend = {
      ...values,
      params: parsedParams,
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (res.ok) {
        message.success(node ? '节点更新成功' : '节点创建成功')
        router.push('/nodes')
      } else {
        throw new Error('操作失败')
      }
    } catch (error) {
      console.error('Node operation failed:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="名称"
        rules={[{ required: true, message: '请输入节点名称' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="type"
        label="类型"
        rules={[{ required: true, message: '请选择节点类型' }]}
      >
        <Select>
          <Option value="ss">Shadowsocks</Option>
          <Option value="ssr">ShadowsocksR</Option>
          <Option value="vmess">V2Ray (VMess)</Option>
          <Option value="vless">Vless</Option>
          <Option value="vless-reality">Vless Reality</Option>
          <Option value="trojan">Trojan</Option>
          <Option value="socks5">SOCKS5</Option>
          <Option value="anytls">AnyTLS</Option>
          <Option value="tuic">TUIC</Option>
          <Option value="hysteria">Hysteria</Option>
          <Option value="hysteria2">Hysteria2</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="server"
        label="服务器地址"
        rules={[{ required: true, message: '请输入服务器地址' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="port"
        label="端口"
        rules={[{ required: true, message: '请输入端口号' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="password"
        label="密码或认证信息"
        // 密码字段不再强制要求，因为某些协议可能不需要或使用 params 字段
      >
        <Input />
      </Form.Item>

      {/* 根据节点类型动态渲染协议特定参数字段 */}
      {(nodeType && [
        'vmess',
        'vless',
        'vless-reality',
        'trojan',
        'ssr',
        'anytls',
        'tuic',
        'hysteria',
        'hysteria2',
      ].includes(nodeType)) && (
        <Form.Item
          name="params"
          label="协议特定参数 (JSON 格式)"
          tooltip="请输入协议特有的配置参数，例如 VLESS 的 flow、Trojan 的 sni 等，格式为 JSON。"
        >
          <Input.TextArea rows={4} placeholder='例如: { "flow": "xtls-rprx-vision", "sni": "example.com" }' />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {node ? '更新' : '创建'}
        </Button>
      </Form.Item>
    </Form>
  )
}
