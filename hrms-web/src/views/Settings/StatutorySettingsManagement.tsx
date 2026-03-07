import React, { useState } from 'react';
import {
  Card,
  Form,
  Button,
  Space,
  Table,
  message,
  Modal,
  InputNumber,
  Divider,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '../../lib/http';
import { canPerformAction } from '../../lib/permissions';

interface PayeTaxBand {
  id: number;
  min_amount: string;
  max_amount: string;
  rate: string;
  order: number;
  effective_date: string;
}

interface StatutorySettings {
  id: number;
  workspace: number;
  napsa_rate: string;
  napsa_ceiling_monthly: string;
  nhima_rate: string;
  effective_date: string;
  paye_bands: PayeTaxBand[];
}

const StatutorySettingsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [bandsForm] = Form.useForm();
  const [bandModalVisible, setBandModalVisible] = useState(false);
  const [editingBand, setEditingBand] = useState<PayeTaxBand | null>(null);
  const workspaceId = localStorage.getItem('workspaceId');
  const canManageSettings = canPerformAction('can_manage_settings');

  // Fetch statutory settings for current workspace
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['statutory-settings', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      try {
        const response = await http.get(`/api/v1/payroll/statutory-settings/?workspace=${workspaceId}`);
        // Handle both single object and paginated response
        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        return data as StatutorySettings;
      } catch {
        return null;
      }
    },
    enabled: !!workspaceId,
  });

  // Update statutory settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => {
      if (settings?.id) {
        return http.patch(`/api/v1/payroll/statutory-settings/${settings.id}/`, data);
      } else {
        return http.post('/api/v1/payroll/statutory-settings/', { workspace: workspaceId, ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutory-settings'] });
      message.success('Statutory settings updated successfully');
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Failed to update settings');
    },
  });

  // Create/Update PAYE band mutation
  const saveBandMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingBand?.id) {
        return http.patch(`/api/v1/payroll/paye-tax-bands/${editingBand.id}/`, data);
      } else {
        return http.post('/api/v1/payroll/paye-tax-bands/', {
          workspace: workspaceId,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutory-settings'] });
      message.success(editingBand ? 'Tax band updated' : 'Tax band created');
      setBandModalVisible(false);
      bandsForm.resetFields();
      setEditingBand(null);
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Failed to save tax band');
    },
  });

  // Delete PAYE band mutation
  const deleteBandMutation = useMutation({
    mutationFn: (bandId: number) => http.delete(`/api/v1/payroll/paye-tax-bands/${bandId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statutory-settings'] });
      message.success('Tax band deleted');
      refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'Failed to delete tax band');
    },
  });

  const handleSaveSettings = async () => {
    try {
      const values = await form.validateFields();
      updateSettingsMutation.mutate(values);
    } catch {
      // Form validation failed
    }
  };

  const handleOpenBandModal = (band?: PayeTaxBand) => {
    if (band) {
      setEditingBand(band);
      bandsForm.setFieldsValue({
        min_amount: parseFloat(band.min_amount),
        max_amount: parseFloat(band.max_amount),
        rate: parseFloat(band.rate),
        order: band.order,
      });
    } else {
      setEditingBand(null);
      bandsForm.resetFields();
    }
    setBandModalVisible(true);
  };

  const handleSaveBand = async () => {
    try {
      const values = await bandsForm.validateFields();
      saveBandMutation.mutate(values);
    } catch {
      // Form validation failed
    }
  };

  // Initialize form with settings data
  React.useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        napsa_rate: parseFloat(settings.napsa_rate) * 100, // Convert to percentage
        napsa_ceiling_monthly: parseFloat(settings.napsa_ceiling_monthly),
        nhima_rate: parseFloat(settings.nhima_rate) * 100, // Convert to percentage
      });
    }
  }, [settings, form]);

  const bandColumns = [
    {
      title: 'Min Amount',
      dataIndex: 'min_amount',
      key: 'min_amount',
      width: 130,
      render: (val: string) => `K${parseFloat(val).toFixed(2)}`,
    },
    {
      title: 'Max Amount',
      dataIndex: 'max_amount',
      key: 'max_amount',
      width: 130,
      render: (val: string) => `K${parseFloat(val).toFixed(2)}`,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      width: 80,
      render: (val: string) => `${(parseFloat(val) * 100).toFixed(2)}%`,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Effective',
      dataIndex: 'effective_date',
      key: 'effective_date',
      width: 120,
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: PayeTaxBand) => (
        <Space size="small">
          {canManageSettings && (
            <>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleOpenBandModal(record)}
              />
              <Popconfirm
                title="Delete tax band?"
                onConfirm={() => deleteBandMutation.mutate(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  loading={deleteBandMutation.isPending}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (!canManageSettings) {
    return (
      <Card>
        <p>You don't have permission to manage statutory settings</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Statutory Settings Management" loading={isLoading}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="NAPSA Employee Rate (%)"
                name="napsa_rate"
                rules={[
                  { required: true, message: 'NAPSA rate is required' },
                  { type: 'number', min: 0, max: 100, message: 'Rate must be between 0 and 100' },
                ]}
              >
                <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="NAPSA Monthly Ceiling (K)"
                name="napsa_ceiling_monthly"
                rules={[{ required: true, message: 'NAPSA ceiling is required' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="K" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="NHIMA Employee Rate (%)"
                name="nhima_rate"
                rules={[
                  { required: true, message: 'NHIMA rate is required' },
                  { type: 'number', min: 0, max: 100, message: 'Rate must be between 0 and 100' },
                ]}
              >
                <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: '32px' }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveSettings}
                  loading={updateSettingsMutation.isPending}
                  block
                >
                  Save Settings
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        <Divider />

        <div style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>PAYE Tax Bands</h3>
            {canManageSettings && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenBandModal()}
              >
                Add Tax Band
              </Button>
            )}
          </div>

          {settings?.paye_bands && settings.paye_bands.length > 0 ? (
            <Table
              columns={bandColumns}
              dataSource={settings.paye_bands}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <p style={{ color: '#666' }}>No tax bands configured. Add one to get started.</p>
          )}
        </div>
      </Card>

      {/* Tax Band Modal */}
      <Modal
        title={editingBand ? 'Edit Tax Band' : 'Add Tax Band'}
        open={bandModalVisible}
        onCancel={() => {
          setBandModalVisible(false);
          setEditingBand(null);
          bandsForm.resetFields();
        }}
        onOk={handleSaveBand}
        confirmLoading={saveBandMutation.isPending}
      >
        <Form form={bandsForm} layout="vertical">
          <Form.Item
            label="Minimum Amount (K)"
            name="min_amount"
            rules={[{ required: true, message: 'Minimum amount is required' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="K" />
          </Form.Item>

          <Form.Item
            label="Maximum Amount (K)"
            name="max_amount"
            rules={[{ required: true, message: 'Maximum amount is required' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="K" />
          </Form.Item>

          <Form.Item
            label="Tax Rate (%)"
            name="rate"
            rules={[
              { required: true, message: 'Tax rate is required' },
              { type: 'number', min: 0, max: 100, message: 'Rate must be between 0 and 100' },
            ]}
          >
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Order"
            name="order"
            initialValue={0}
            rules={[{ required: true, message: 'Order is required' }]}
          >
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StatutorySettingsManagement;
