import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  VideoCameraOutlined,
  BarChartOutlined,
  SettingOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import AdDataPage from './pages/AdDataPage';
import ROITrendPage from './pages/ROITrendPage';
import MaterialListPage from './pages/MaterialListPage';
import './App.css';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: 'materials',
    icon: <VideoCameraOutlined />,
    label: '素材管理',
  },
  {
    key: 'ad-data',
    icon: <DollarOutlined />,
    label: '投放数据',
  },
  {
    key: 'roi',
    icon: <BarChartOutlined />,
    label: 'ROI 分析',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('materials');
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
      >
        <div className="logo">
          <span className="logo-text">
            {collapsed ? '豆' : '微信豆投放'}
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0 }}>视频号微信豆投放素材筛选系统</h2>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {selectedKey === 'materials' && (
            <MaterialListPage />
          )}
          {selectedKey === 'ad-data' && (
            <AdDataPage />
          )}
          {selectedKey === 'roi' && (
            <ROITrendPage />
          )}
          {selectedKey === 'settings' && (
            <div>系统设置页面（待开发）</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
