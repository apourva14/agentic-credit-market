import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { MESSAGE_TYPES } from '../../schemas/wfapSchemas'

const WFAPEnterprise = ({ 
  organization,
  users = [],
  roles = [],
  permissions = {},
  onUserManagement,
  onRoleManagement,
  onSystemConfiguration,
  onAuditLogging
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemMetrics, setSystemMetrics] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [systemHealth, setSystemHealth] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadSystemMetrics()
    loadAuditLogs()
    checkSystemHealth()
  }, [])

  const loadSystemMetrics = async () => {
    setIsLoading(true)
    try {
      // Simulate loading system metrics
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const metrics = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isActive).length,
        totalMessages: 1250,
        messagesToday: 45,
        averageResponseTime: 150,
        systemUptime: 99.9,
        storageUsed: 2.5, // GB
        storageLimit: 100, // GB
        apiCallsToday: 1250,
        apiCallsLimit: 10000,
        errorRate: 0.1,
        performanceScore: 95
      }
      
      setSystemMetrics(metrics)
    } catch (error) {
      console.error('Error loading system metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      // Simulate loading audit logs
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const logs = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          user: 'admin@company.com',
          action: 'User Login',
          resource: 'System',
          status: 'Success',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: 'Successful login from office network'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: 'bank.user@wellsfargo.com',
          action: 'Message Created',
          resource: 'WFAP Message',
          status: 'Success',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0...',
          details: 'Created new offer message for intent #1001'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: 'company.user@techcorp.com',
          action: 'Message Validation',
          resource: 'WFAP Message',
          status: 'Failed',
          ipAddress: '203.0.113.25',
          userAgent: 'Mozilla/5.0...',
          details: 'Message validation failed due to invalid signature'
        },
        {
          id: 4,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          user: 'admin@company.com',
          action: 'User Management',
          resource: 'User Account',
          status: 'Success',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          details: 'Updated user permissions for bank.user@wellsfargo.com'
        },
        {
          id: 5,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          user: 'system@company.com',
          action: 'System Maintenance',
          resource: 'System',
          status: 'Success',
          ipAddress: '127.0.0.1',
          userAgent: 'System',
          details: 'Scheduled database optimization completed'
        }
      ]
      
      setAuditLogs(logs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
  }

  const checkSystemHealth = async () => {
    try {
      // Simulate system health check
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const health = {
        status: 'Healthy',
        services: {
          database: { status: 'Online', responseTime: 25 },
          api: { status: 'Online', responseTime: 45 },
          authentication: { status: 'Online', responseTime: 15 },
          messageQueue: { status: 'Online', responseTime: 30 },
          fileStorage: { status: 'Online', responseTime: 20 }
        },
        alerts: [
          {
            id: 1,
            type: 'Warning',
            message: 'High memory usage detected',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            resolved: false
          },
          {
            id: 2,
            type: 'Info',
            message: 'Scheduled maintenance in 2 hours',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            resolved: false
          }
        ],
        lastChecked: new Date().toISOString()
      }
      
      setSystemHealth(health)
    } catch (error) {
      console.error('Error checking system health:', error)
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages Today</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics?.messagesToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics?.averageResponseTime || 0}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Score</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics?.performanceScore || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(systemHealth.services).map(([service, data]) => (
              <div key={service} className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                  data.status === 'Online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-sm font-medium text-gray-900 capitalize">{service}</div>
                <div className="text-xs text-gray-600">{data.responseTime}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{log.action}</div>
                  <div className="text-xs text-gray-600">{log.user} • {log.resource}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(log.timestamp), 'HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUserManagementTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button className="btn btn-primary">+ Add User</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastActive ? format(new Date(user.lastActive), 'MMM dd, yyyy') : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderAuditLogTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
        <div className="flex items-center gap-3">
          <select className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option>All Actions</option>
            <option>User Management</option>
            <option>Message Operations</option>
            <option>System Events</option>
          </select>
          <button className="btn btn-secondary">Export Logs</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.resource}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSystemConfigTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">WFAP Protocol Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protocol Version</label>
              <input type="text" value="WFAP/1.0" disabled className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Timeout (seconds)</label>
              <input type="number" defaultValue="300" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Retry Attempts</label>
              <input type="number" defaultValue="3" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Security Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input type="number" defaultValue="30" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
              <input type="number" defaultValue="5" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <label className="text-sm text-gray-700">Require Two-Factor Authentication</label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cache TTL (minutes)</label>
              <input type="number" defaultValue="60" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Requests</label>
              <input type="number" defaultValue="100" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database Pool Size</label>
              <input type="number" defaultValue="20" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Monitoring Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option>DEBUG</option>
                <option>INFO</option>
                <option>WARN</option>
                <option>ERROR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metrics Collection Interval (seconds)</label>
              <input type="number" defaultValue="30" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <label className="text-sm text-gray-700">Enable Performance Monitoring</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-primary">Save Configuration</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enterprise Management</h2>
            <p className="text-gray-600">
              {organization?.name || 'Organization'} • System Administration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              🏢 Enterprise
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {systemHealth?.status || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'User Management', icon: '👥' },
              { id: 'audit', label: 'Audit Logs', icon: '📋' },
              { id: 'config', label: 'Configuration', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'users' && renderUserManagementTab()}
          {activeTab === 'audit' && renderAuditLogTab()}
          {activeTab === 'config' && renderSystemConfigTab()}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800 font-medium">Loading system data...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WFAPEnterprise
