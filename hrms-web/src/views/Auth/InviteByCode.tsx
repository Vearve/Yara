import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import http from '../../lib/http';

const { Title, Paragraph, Text } = Typography;

export default function InviteByCode() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (values: { code: string; email?: string }) => {
    setSubmitting(true);
    setStatus(null);
    try {
      await http.post('/api/v1/core/invites/redeem/', values);
      setStatus({ type: 'success', message: 'Invite accepted. You can proceed to set up your account.' });
    } catch (err: any) {
      const detail = err?.response?.data?.detail || 'We could not redeem that code. Please verify and try again.';
      setStatus({ type: 'error', message: detail });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0f1117' }}>
      <Card style={{ width: 420, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.4)' }}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#D4AF37' }}>Accept Invitation</Title>
            <Paragraph type="secondary" style={{ marginBottom: 12 }}>
              Enter the invite code you received to join your workspace. We will verify it and guide you to the next step.
            </Paragraph>
          </div>

          {status && (
            <Alert type={status.type} message={status.message} showIcon />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<Text style={{ color: '#fff' }}>Invite Code</Text>}
              name="code"
              rules={[{ required: true, message: 'Please enter your invite code' }]}
            >
              <Input placeholder="e.g. HRMS-ABCD-1234" allowClear />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: '#fff' }}>Email (optional)</Text>}
              name="email"
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
            >
              <Input placeholder="name@company.com" allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} block>
                Redeem Code
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Having trouble? Contact your administrator to confirm the code or request a new invite.
          </Text>
        </Space>
      </Card>
    </div>
  );
}
