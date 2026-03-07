import { Button, Card, Descriptions, List, Space, Spin, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import http from '../../lib/http';

const { Title, Text } = Typography;

export default function WorkspaceDebug() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['workspace-debug', localStorage.getItem('workspaceId')],
        queryFn: async () => {
            const res = await http.get('/api/v1/core/workspaces/current_workspace_debug/');
            return res.data;
        },
    });

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <div className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Debug</div>
                <Title level={3} style={{ margin: 0 }}>Workspace Access Debug</Title>
                <Text type="secondary">Use this page to confirm active workspace header/context and your memberships.</Text>
            </div>

            <Card extra={<Button onClick={() => refetch()}>Refresh</Button>}>
                {isLoading ? (
                    <Spin />
                ) : (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="User">{data?.user || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Header (X-Workspace-ID)">{data?.header_sent || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Backend Workspace ID">{data?.backend_workspace_id || '-'}</Descriptions.Item>
                        <Descriptions.Item label="Backend Workspace Name">{data?.backend_workspace_name || '-'}</Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            <Card title="All Assigned Workspaces">
                <List
                    dataSource={data?.all_user_workspaces || []}
                    renderItem={(item: any) => (
                        <List.Item>
                            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                <Text strong>{item.name}</Text>
                                <Space>
                                    <Tag>ID: {item.id}</Tag>
                                    {item.is_default ? <Tag color="gold">Default</Tag> : <Tag>Non-default</Tag>}
                                </Space>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
}
