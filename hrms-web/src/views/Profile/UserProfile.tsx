import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../../lib/http';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  job_title?: string;
  bio?: string;
  personality_type?: string;
}

export default function UserProfile() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const nav = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await http.get('/api/v1/auth/profile/');
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile);
      if (profile.profile_picture) {
        setPhotoPreview(profile.profile_picture);
      }
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const formData = new FormData();
      formData.append('first_name', values.first_name || '');
      formData.append('last_name', values.last_name || '');
      formData.append('email', values.email || '');
      formData.append('job_title', values.job_title || '');
      formData.append('bio', values.bio || '');
      formData.append('personality_type', values.personality_type || '');
      if (photoFile) formData.append('profile_picture', photoFile);
      return http.patch('/api/v1/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      message.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-header'] });
    },
    onError: () => {
      message.error('Failed to update profile');
    },
  });

  const handlePhotoChange = (info: any) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const accentColor = isDark ? '#f5c400' : '#4a3fcf';
  const cardBg = isDark ? 'rgba(15, 22, 40, 0.82)' : 'var(--bg-card)';
  const cardBorder = isDark ? '1px solid rgba(245,196,0,0.18)' : '1px solid var(--border)';
  const labelColor = isDark ? '#f5c400' : '#4a3fcf';

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
    : '';

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => nav(-1)}
        style={{ color: accentColor, paddingLeft: 0, marginBottom: 16 }}
      >
        Back
      </Button>

      <Row gutter={24}>
        {/* Left panel — avatar + identity */}
        <Col xs={24} md={8}>
          <Card style={{ background: cardBg, border: cardBorder, textAlign: 'center' }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={photoPreview}
              style={{
                backgroundColor: photoPreview ? 'transparent' : accentColor,
                border: `3px solid ${accentColor}`,
                marginBottom: 12,
              }}
            />
            <Title level={4} style={{ color: 'var(--text)', marginBottom: 2 }}>
              {displayName || '—'}
            </Title>
            {profile?.job_title && (
              <Tag color={isDark ? 'gold' : 'geekblue'} style={{ marginBottom: 8 }}>
                {profile.job_title}
              </Tag>
            )}
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={{ marginRight: 4 }} />
                {profile?.email || '—'}
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <IdcardOutlined style={{ marginRight: 4 }} />
                @{profile?.username || '—'}
              </Text>
            </div>
            <Upload
              beforeUpload={() => false}
              onChange={handlePhotoChange}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} style={{ color: accentColor, borderColor: accentColor }}>
                Change Photo
              </Button>
            </Upload>
          </Card>
        </Col>

        {/* Right panel — editable form */}
        <Col xs={24} md={16}>
          <Card style={{ background: cardBg, border: cardBorder }}>
            <Title level={4} style={{ color: accentColor, marginBottom: 20 }}>
              Edit Profile
            </Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => updateMutation.mutate(values)}
              disabled={isLoading}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="first_name"
                    label={<span style={{ color: labelColor }}>First Name</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="last_name"
                    label={<span style={{ color: labelColor }}>Last Name</span>}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label={<span style={{ color: labelColor }}>Email</span>}
                rules={[
                  { required: true, message: 'Required' },
                  { type: 'email', message: 'Invalid email' },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="job_title"
                label={<span style={{ color: labelColor }}>Job Title</span>}
              >
                <Input placeholder="e.g. HR Manager, Senior Consultant" />
              </Form.Item>

              <Divider style={{ borderColor: isDark ? 'rgba(245,196,0,0.15)' : 'var(--border)' }} />

              <Form.Item
                name="bio"
                label={<span style={{ color: labelColor }}>Bio</span>}
              >
                <TextArea
                  rows={3}
                  placeholder="Your experience, background, what you do..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="personality_type"
                label={<span style={{ color: labelColor }}>About You</span>}
              >
                <TextArea
                  rows={2}
                  placeholder="Work style, hobbies, anything fun..."
                  maxLength={300}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updateMutation.isPending}
                  style={{
                    width: '100%',
                    background: isDark
                      ? 'linear-gradient(135deg, #f5c400 0%, #d4a800 100%)'
                      : 'linear-gradient(135deg, #4a3fcf 0%, #6055e1 100%)',
                    border: 'none',
                    height: 40,
                    color: isDark ? '#05060a' : '#fff',
                  }}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
