import { Button, Card, Space, Typography } from 'antd';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'Something went wrong';
    let description = 'An unexpected error occurred while loading this page.';

    if (isRouteErrorResponse(error)) {
        title = `${error.status} ${error.statusText}`;
        description = typeof error.data === 'string' ? error.data : description;
    } else if (error instanceof Error) {
        description = error.message;
    }

    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Card style={{ maxWidth: 640, width: '100%' }}>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Title level={3} style={{ margin: 0 }}>{title}</Title>
                    <Text type="secondary">{description}</Text>
                    <Space>
                        <Button type="primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </Space>
                </Space>
            </Card>
        </div>
    );
}
