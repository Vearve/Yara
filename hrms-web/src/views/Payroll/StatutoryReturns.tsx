import { useState } from 'react';
import { Card, Row, Col, Select, Button, Space, Typography, message, Tooltip } from 'antd';
import { FileExcelOutlined, CloudDownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import http from '../../lib/http';

const { Title, Paragraph } = Typography;

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

export default function StatutoryReturns() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState<{ napsa: boolean; nhima: boolean; paye: boolean }>({ napsa: false, nhima: false, paye: false });

  const downloadReturn = async (type: 'napsa' | 'nhima') => {
    try {
      setLoading((s) => ({ ...s, [type]: true }));
      const endpoint = type === 'napsa' ? '/api/v1/payroll/payslips/napsa_return/' : '/api/v1/payroll/payslips/nhima_return/';
      const response = await http.get(endpoint, {
        params: { year, month },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-return-${year}-${String(month).padStart(2, '0')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success(`${type.toUpperCase()} return downloaded`);
    } catch (error) {
      message.error('Download failed. Please check the selected period.');
    } finally {
      setLoading((s) => ({ ...s, [type]: false }));
    }
  };

  const handlePayeReturn = async () => {
    try {
      setLoading((s) => ({ ...s, paye: true }));

      // Step 1: Find the payroll period for this month/year
      const periodResponse = await http.get('/api/v1/payroll/periods/', {
        params: { start_month: month, start_year: year, limit: 1 },
      });

      const periods = periodResponse.data.results || periodResponse.data;
      if (!periods || periods.length === 0) {
        message.error('No payroll period found for the selected month/year. Please ensure the period exists.');
        setLoading((s) => ({ ...s, paye: false }));
        return;
      }

      const periodId = periods[0].id;

      // Step 2: Generate PAYE return for this period
      const generateResponse = await http.post('/api/v1/payroll/paye-returns/generate/', {
        period: periodId,
      });

      const payeReturnId = generateResponse.data.id;
      message.success('PAYE return generated successfully');

      // Step 3: Export as CSV
      const csvResponse = await http.get(`/api/v1/payroll/paye-returns/${payeReturnId}/export_csv/`, {
        responseType: 'blob',
      });

      const blob = new Blob([csvResponse.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paye-return-${year}-${String(month).padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('PAYE return CSV exported successfully');
    } catch (error: any) {
      console.error('PAYE export error:', error);
      message.error(error.response?.data?.detail || 'PAYE export failed. Please check the selected period.');
    } finally {
      setLoading((s) => ({ ...s, paye: false }));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>Statutory Returns</Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Export monthly NHIMA, NAPSA, and PAYE tax returns as Excel/CSV files for filing. Select the period and download the required return.
        </Paragraph>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" style={{ marginBottom: 12 }}>
          <Select style={{ width: 140 }} value={month} onChange={setMonth} options={months} />
          <Select style={{ width: 120 }} value={year} onChange={setYear} options={years.map((y) => ({ value: y, label: y }))} />
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" title="NAPSA Return" bordered>
              <Space>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => downloadReturn('napsa')}
                  loading={loading.napsa}
                >
                  Download Excel
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="NHIMA Return" bordered>
              <Space>
                <Button
                  type="primary"
                  icon={<CloudDownloadOutlined />}
                  onClick={() => downloadReturn('nhima')}
                  loading={loading.nhima}
                >
                  Download Excel
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="PAYE Return (ZRA)" bordered>
              <Space>
                <Tooltip title="Generates and exports PAYE tax return with employee details (TPIN, gross pay, tax credit, tax payable)">
                  <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={handlePayeReturn}
                    loading={loading.paye}
                  >
                    Generate & Download CSV
                  </Button>
                </Tooltip>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
