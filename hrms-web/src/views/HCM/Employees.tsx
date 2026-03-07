import { useState } from 'react';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import http from '../../lib/http';
import EmployeeForm from '../../components/EmployeeForm';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department?: number;
  employment_status: string;
  hire_date: string;
}

export default function Employees() {
  const queryClient = useQueryClient();
  const [formVisible, setFormVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [workspaceId, setWorkspaceId] = useState<string | null>(() => localStorage.getItem('workspaceId'));

  useEffect(() => {
    const handleWorkspaceChange = () => {
      const newWorkspaceId = localStorage.getItem('workspaceId');
      setWorkspaceId(newWorkspaceId);
      // Invalidate all queries with the correct query key
      queryClient.removeQueries({ exact: false, queryKey: ['employees'] });
    };
    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    return () => window.removeEventListener('workspaceChanged', handleWorkspaceChange);
  }, [queryClient]);

  // Also clear cache whenever workspaceId changes
  useEffect(() => {
    queryClient.removeQueries({ exact: false, queryKey: ['employees'] });
  }, [workspaceId, queryClient]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', workspaceId],
    queryFn: async () => (await http.get('/api/v1/hcm/employees/')).data,
    enabled: !!workspaceId,
  });

  const rows: Employee[] = data?.results ?? data ?? [];

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormVisible(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(undefined);
    setFormVisible(true);
  };

  const handleClose = () => {
    setFormVisible(false);
    setSelectedEmployee(undefined);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Employee
        </Button>
      </Space>
      <Table
        loading={isLoading}
        dataSource={rows}
        rowKey={(r: Employee) => r.id}
        columns={[
          { title: 'ID', dataIndex: 'employee_id' },
          { title: 'Name', render: (_: any, r: Employee) => `${r.first_name} ${r.last_name}` },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Hire Date', dataIndex: 'hire_date' },
          { title: 'Status', dataIndex: 'employment_status', render: (s: string) => <Tag>{s}</Tag> },
          {
            title: 'Actions',
            render: (_: any, r: Employee) => (
              <Button size="small" onClick={() => handleEdit(r)}>
                Edit
              </Button>
            ),
          },
        ]}
      />
      <EmployeeForm
        visible={formVisible}
        onClose={handleClose}
        onSuccess={refetch}
        employee={selectedEmployee}
      />
    </div>
  );
}
