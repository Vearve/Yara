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
  Divider 
} from 'antd';
import { UserOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../../lib/http';
import { useNavigate } from 'react-router-dom';

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
      
      if (photoFile) {
        formData.append('profile_picture', photoFile);
      }
      
      return http.patch('/api/v1/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      message.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
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
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card
        style={{
          background: 'rgba(10, 10, 10, 0.6)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => nav(-1)}
            style={{ color: '#D4AF37', alignSelf: 'flex-start', paddingLeft: 0 }}
          >
            Back
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ color: '#D4AF37', marginBottom: 8 }}>
              My Profile
            </Title>
            <Text type="secondary">
              Manage your personal information and preferences
            </Text>
          </div>

          <Divider style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

          <div style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={photoPreview}
              style={{
                backgroundColor: photoPreview ? 'transparent' : '#D4AF37',
                border: '3px solid #D4AF37',
              }}
            />
            <div style={{ marginTop: 16 }}>
              <Upload
                beforeUpload={() => false}
                onChange={handlePhotoChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} style={{ color: '#D4AF37', borderColor: '#D4AF37' }}>
                  Change Photo
                </Button>
              </Upload>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => updateMutation.mutate(values)}
            disabled={isLoading}
          >
            <Form.Item
              name="first_name"
              label={<span style={{ color: '#D4AF37' }}>First Name</span>}
              rules={[{ required: true, message: 'First name is required' }]}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label={<span style={{ color: '#D4AF37' }}>Last Name</span>}
              rules={[{ required: true, message: 'Last name is required' }]}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={{ color: '#D4AF37' }}>Email</span>}
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="your.email@example.com" />
            </Form.Item>

            <Form.Item
              name="job_title"
              label={<span style={{ color: '#D4AF37' }}>Job Title</span>}
            >
              <Input placeholder="e.g., HR Manager, Senior Consultant" />
            </Form.Item>

            <Form.Item
              name="bio"
              label={<span style={{ color: '#D4AF37' }}>Bio / Description</span>}
            >
              <TextArea
                rows={4}
                placeholder="Tell us about yourself, your experience, and what you do..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="personality_type"
              label={<span style={{ color: '#D4AF37' }}>Type of Person You Are</span>}
            >
              <TextArea
                rows={3}
                placeholder="Describe your personality, work style, hobbies, or anything fun! (e.g., 'Problem solver who loves coffee and spreadsheets')"
                maxLength={300}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateMutation.isPending}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
                  border: 'none',
                  height: 40,
                }}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}
