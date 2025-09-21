import { roles, availableBanks, availableCompanies } from '../../data/sampleData'
import { getRoleDisplayName } from '../../utils/rolePermissions'

const Header = ({ 
  currentRole, 
  selectedBank,
  selectedCompany,
  onRoleChange, 
  onBankSelection,
  onCompanySelection,
  permissions,
  isMarketRunning,
  onStartMarket,
  onStopMarket
}) => {
  const getRoleBadgeClass = (role) => {
    const baseClass = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold capitalize"
    switch (role) {
      case 'company':
        return `${baseClass} bg-primary-100 text-primary-800`
      case 'bank':
        return `${baseClass} bg-success-100 text-success-800`
      case 'admin':
        return `${baseClass} bg-danger-100 text-danger-800`
      case 'guest':
        return `${baseClass} bg-gray-100 text-gray-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Title and Role Indicator */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Agentic Credit Market
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Current Role:</span>
              <span className={getRoleBadgeClass(currentRole)}>
                {getRoleDisplayName(currentRole)}
                {permissions.isAdmin && <span className="text-xs">⭐</span>}
                {permissions.isReadOnly && <span className="text-xs">👁️</span>}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Market Simulation Button (Guest Role Only) */}
            {currentRole === 'guest' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Market Demo:
                </label>
                {!isMarketRunning ? (
                  <button
                    onClick={onStartMarket}
                    className="btn btn-success flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <span>🚀</span>
                    Start Market
                  </button>
                ) : (
                  <button
                    onClick={onStopMarket}
                    className="btn btn-danger flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <span>⏹️</span>
                    Shutdown Market
                  </button>
                )}
              </div>
            )}

            {/* Role Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">
                Select Role:
              </label>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {roles.map(role => (
                  <button
                    key={role.id}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      currentRole === role.id
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => onRoleChange(role.id)}
                    title={role.description}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Selector for Company Role */}
            {currentRole === 'company' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="companySelect" className="text-sm font-semibold text-gray-700">
                  Select Company:
                </label>
                <select
                  id="companySelect"
                  className="form-input min-w-48"
                  value={selectedCompany}
                  onChange={(e) => onCompanySelection(e.target.value)}
                >
                  <option value="">Choose a company...</option>
                  {availableCompanies.map(company => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bank Selector for Bank Role */}
            {currentRole === 'bank' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="bankSelect" className="text-sm font-semibold text-gray-700">
                  Select Bank:
                </label>
                <select
                  id="bankSelect"
                  className="form-input min-w-48"
                  value={selectedBank}
                  onChange={(e) => onBankSelection(e.target.value)}
                >
                  <option value="">Choose a bank...</option>
                  {availableBanks.map(bank => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Admin Controls */}
            {currentRole === 'admin' && (
              <div className="flex flex-col gap-1 text-right">
                <span className="text-sm font-semibold text-danger-600">
                  Admin Mode Active
                </span>
                <span className="text-xs text-gray-600">
                  Full system access enabled
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header