const { useState, useEffect, useCallback } = React;

// Sample data
const initialData = {
  intents: [
    {
      id: 1001,
      companyName: "TechStart Solutions",
      amount: 500000,
      duration: 12,
      purpose: "Equipment purchase and expansion",
      status: "open",
      timestamp: "2025-09-20T01:30:00Z"
    },
    {
      id: 1002,
      companyName: "Green Energy Corp",
      amount: 2000000,
      duration: 24,
      purpose: "Solar panel manufacturing facility",
      status: "open",
      timestamp: "2025-09-20T01:15:00Z"
    },
    {
      id: 1003,
      companyName: "HealthTech Innovations",
      amount: 750000,
      duration: 18,
      purpose: "Medical device development",
      status: "open",
      timestamp: "2025-09-20T02:00:00Z"
    }
  ],
  ongoingDeals: [
    {
      intentId: 1001,
      companyName: "TechStart Solutions",
      bankName: "Alpha Bank",
      timestamp: "2025-09-20T01:35:00Z"
    },
    {
      intentId: 1002,
      companyName: "Green Energy Corp",
      bankName: "Beta Financial",
      timestamp: "2025-09-20T01:25:00Z"
    },
    {
      intentId: 1002,
      companyName: "Green Energy Corp",
      bankName: "Gamma Capital",
      timestamp: "2025-09-20T01:28:00Z"
    },
    {
      intentId: 1003,
      companyName: "HealthTech Innovations",
      bankName: "Delta Bank",
      timestamp: "2025-09-20T02:05:00Z"
    }
  ],
  closedDeals: [
    {
      id: 1000,
      companyName: "Manufacturing Plus",
      winningBank: "Delta Bank",
      amount: 750000,
      timestamp: "2025-09-19T15:45:00Z"
    },
    {
      id: 999,
      companyName: "Retail Dynamics",
      winningBank: "Alpha Bank",
      amount: 300000,
      timestamp: "2025-09-19T10:30:00Z"
    }
  ]
};

const availableBanks = ["Alpha Bank", "Beta Financial", "Gamma Capital", "Delta Bank", "Epsilon Trust", "Zeta Commercial"];

const roles = [
  { id: "company", name: "Company", description: "Create intents and close deals" },
  { id: "bank", name: "Bank", description: "Express interest and manage deals" },
  { id: "admin", name: "Admin", description: "Full system access and management" },
  { id: "guest", name: "Guest", description: "View-only access to all data" }
];

// Utility function
const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Role permissions utility
const getRolePermissions = (role) => {
  return {
    canCreateIntents: role === 'company' || role === 'admin',
    canExpressInterest: role === 'bank' || role === 'admin',
    canCloseDeals: role === 'company' || role === 'admin',
    canDeleteIntents: role === 'admin',
    canViewAll: true,
    isReadOnly: role === 'guest'
  };
};

// Notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return React.createElement('div', { className: 'notification' },
    React.createElement('div', { className: `status status--${type}` }, message)
  );
};

// Header component
const Header = ({ currentRole, onRoleChange }) => {
  const handleRoleClick = (roleId) => {
    onRoleChange(roleId);
  };

  return React.createElement('header', { className: 'app-header' }, [
    React.createElement('h1', { key: 'title' }, 'Credit Line Request Board'),
    React.createElement('div', { key: 'selector', className: 'role-selector' },
      roles.map(role => 
        React.createElement('button', {
          key: role.id,
          className: `btn btn--outline role-btn ${currentRole === role.id ? 'active' : ''}`,
          onClick: () => handleRoleClick(role.id),
          title: role.description
        }, [
          role.name,
          role.id === 'admin' && React.createElement('span', { key: 'badge', className: 'role-badge' }, 'ADMIN'),
          role.id === 'guest' && React.createElement('span', { key: 'badge', className: 'role-badge guest-badge' }, 'VIEW')
        ])
      )
    )
  ]);
};

// Intent form component
const IntentForm = ({ onCreateIntent, permissions }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    amount: '',
    duration: '',
    purpose: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const intent = {
      id: Date.now(),
      companyName: formData.companyName,
      amount: parseInt(formData.amount),
      duration: parseInt(formData.duration),
      purpose: formData.purpose,
      status: 'open',
      timestamp: new Date().toISOString()
    };

    onCreateIntent(intent);
    setFormData({ companyName: '', amount: '', duration: '', purpose: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!permissions.canCreateIntents || permissions.isReadOnly) {
    return null;
  }

  return React.createElement('section', { className: 'form-section' },
    React.createElement('div', { className: 'card' }, [
      React.createElement('div', { key: 'header', className: 'card__header' },
        React.createElement('h3', null, 'Create New Intent')
      ),
      React.createElement('div', { key: 'body', className: 'card__body' },
        React.createElement('form', { onSubmit: handleSubmit }, [
          React.createElement('div', { key: 'row1', className: 'form-row' }, [
            React.createElement('div', { key: 'company', className: 'form-group' }, [
              React.createElement('label', { key: 'label', className: 'form-label' }, 'Company Name'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                className: 'form-control',
                value: formData.companyName,
                onChange: (e) => handleInputChange('companyName', e.target.value),
                required: true
              })
            ]),
            React.createElement('div', { key: 'amount', className: 'form-group' }, [
              React.createElement('label', { key: 'label', className: 'form-label' }, 'Amount ($)'),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                className: 'form-control',
                min: '1000',
                value: formData.amount,
                onChange: (e) => handleInputChange('amount', e.target.value),
                required: true
              })
            ])
          ]),
          React.createElement('div', { key: 'row2', className: 'form-row' }, [
            React.createElement('div', { key: 'duration', className: 'form-group' }, [
              React.createElement('label', { key: 'label', className: 'form-label' }, 'Duration (months)'),
              React.createElement('input', {
                key: 'input',
                type: 'number',
                className: 'form-control',
                min: '1',
                max: '120',
                value: formData.duration,
                onChange: (e) => handleInputChange('duration', e.target.value),
                required: true
              })
            ]),
            React.createElement('div', { key: 'purpose', className: 'form-group' }, [
              React.createElement('label', { key: 'label', className: 'form-label' }, 'Purpose'),
              React.createElement('input', {
                key: 'input',
                type: 'text',
                className: 'form-control',
                value: formData.purpose,
                onChange: (e) => handleInputChange('purpose', e.target.value),
                required: true
              })
            ])
          ]),
          React.createElement('button', { key: 'submit', type: 'submit', className: 'btn btn--primary btn--full-width' },
            'Create Intent'
          )
        ])
      )
    ])
  );
};

// Bank selector component
const BankSelector = ({ selectedBank, onBankChange, permissions }) => {
  if (!permissions.canExpressInterest || permissions.isReadOnly) {
    return null;
  }

  const handleBankChange = (e) => {
    onBankChange(e.target.value);
  };

  const selectOptions = [
    React.createElement('option', { key: 'default', value: '' }, 'Choose your bank...')
  ];

  availableBanks.forEach(bank => {
    selectOptions.push(
      React.createElement('option', { key: bank, value: bank }, bank)
    );
  });

  return React.createElement('section', { className: 'form-section' },
    React.createElement('div', { className: 'card' }, [
      React.createElement('div', { key: 'header', className: 'card__header' },
        React.createElement('h3', null, 'Select Your Bank')
      ),
      React.createElement('div', { key: 'body', className: 'card__body' },
        React.createElement('select', {
          className: 'form-control',
          value: selectedBank,
          onChange: handleBankChange
        }, selectOptions)
      )
    ])
  );
};

// Admin panel component
const AdminPanel = ({ currentRole, onDeleteAllIntents, onDeleteAllDeals }) => {
  if (currentRole !== 'admin') return null;

  return React.createElement('section', { className: 'admin-panel' }, [
    React.createElement('h3', { key: 'title' }, 'Admin Controls'),
    React.createElement('div', { key: 'actions', className: 'admin-actions' }, [
      React.createElement('button', {
        key: 'intents',
        className: 'btn btn--outline btn--sm',
        onClick: onDeleteAllIntents
      }, 'Clear All Intents'),
      React.createElement('button', {
        key: 'deals',
        className: 'btn btn--outline btn--sm',
        onClick: onDeleteAllDeals
      }, 'Clear All Deals')
    ])
  ]);
};

// Guest notice component
const GuestNotice = ({ currentRole }) => {
  if (currentRole !== 'guest') return null;

  return React.createElement('section', { className: 'guest-notice' }, [
    React.createElement('h3', { key: 'title' }, '👁️ Guest View Mode'),
    React.createElement('p', { key: 'desc' }, 'You are viewing the application in read-only mode. All interactive features are disabled.')
  ]);
};

// Intent card component
const IntentCard = ({ intent, permissions, currentRole, selectedBank, onExpressInterest, onDeleteIntent }) => {
  const canShowExpressInterest = permissions.canExpressInterest && selectedBank && !permissions.isReadOnly;
  const canDelete = permissions.canDeleteIntents && !permissions.isReadOnly;
  const showJson = currentRole === 'company' || currentRole === 'admin';

  const actions = [];
  if (canShowExpressInterest) {
    actions.push(
      React.createElement('button', {
        key: 'express',
        className: 'btn btn--card btn--express-interest',
        onClick: () => onExpressInterest(intent.id)
      }, 'Express Interest')
    );
  }
  if (canDelete) {
    actions.push(
      React.createElement('button', {
        key: 'delete',
        className: 'btn btn--card btn--delete',
        onClick: () => onDeleteIntent(intent.id)
      }, 'Delete')
    );
  }

  const fields = [
    React.createElement('div', { key: 'company', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, 'Company'),
      React.createElement('div', { key: 'value', className: 'field-value company-name' }, intent.companyName)
    ]),
    React.createElement('div', { key: 'amount', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, 'Amount'),
      React.createElement('div', { key: 'value', className: 'field-value amount' }, `$${intent.amount.toLocaleString()}`)
    ]),
    React.createElement('div', { key: 'duration', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, 'Duration'),
      React.createElement('div', { key: 'value', className: 'field-value' }, `${intent.duration} months`)
    ]),
    React.createElement('div', { key: 'purpose', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, 'Purpose'),
      React.createElement('div', { key: 'value', className: 'field-value' }, intent.purpose)
    ])
  ];

  if (showJson) {
    fields.push(
      React.createElement('div', { key: 'json', className: 'card-field' }, [
        React.createElement('div', { key: 'label', className: 'field-label' }, 'JSON Format'),
        React.createElement('div', { key: 'value', className: 'json-display' },
          JSON.stringify({
            amount: intent.amount,
            duration: intent.duration,
            purpose: intent.purpose
          }, null, 2)
        )
      ])
    );
  }

  return React.createElement('div', { className: 'intent-card open' }, [
    React.createElement('div', { key: 'header', className: 'card-header' }, [
      React.createElement('span', { key: 'number', className: 'intent-number' }, `#${intent.id}`),
      React.createElement('span', { key: 'time', className: 'timestamp' }, formatTimestamp(intent.timestamp))
    ]),
    React.createElement('div', { key: 'content', className: 'card-content' }, fields),
    actions.length > 0 && React.createElement('div', { key: 'actions', className: 'card-actions' }, actions)
  ]);
};

// Deal card component
const DealCard = ({ deal, permissions, onCloseDeal, isOngoing = true }) => {
  const canCloseDeal = permissions.canCloseDeals && !permissions.isReadOnly && isOngoing;

  const fields = [
    React.createElement('div', { key: 'company', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, 'Company'),
      React.createElement('div', { key: 'value', className: 'field-value company-name' }, deal.companyName)
    ]),
    React.createElement('div', { key: 'bank', className: 'card-field' }, [
      React.createElement('div', { key: 'label', className: 'field-label' }, isOngoing ? 'Bank' : 'Winning Bank'),
      React.createElement('div', { 
        key: 'value', 
        className: `field-value ${isOngoing ? 'bank-name' : 'winning-bank'}` 
      }, isOngoing ? deal.bankName : deal.winningBank)
    ])
  ];

  if (!isOngoing && deal.amount) {
    fields.push(
      React.createElement('div', { key: 'amount', className: 'card-field' }, [
        React.createElement('div', { key: 'label', className: 'field-label' }, 'Amount'),
        React.createElement('div', { key: 'value', className: 'field-value amount' }, `$${deal.amount.toLocaleString()}`)
      ])
    );
  }

  const actions = canCloseDeal ? [
    React.createElement('button', {
      key: 'close',
      className: 'btn btn--card btn--close-deal',
      onClick: () => onCloseDeal(deal.intentId, deal.bankName)
    }, 'Close Deal')
  ] : [];

  return React.createElement('div', { className: `deal-card ${isOngoing ? 'ongoing' : 'closed'}` }, [
    React.createElement('div', { key: 'header', className: 'card-header' }, [
      React.createElement('span', { key: 'number', className: 'intent-number' }, `#${isOngoing ? deal.intentId : deal.id}`),
      React.createElement('span', { key: 'time', className: 'timestamp' }, formatTimestamp(deal.timestamp))
    ]),
    React.createElement('div', { key: 'content', className: 'card-content' }, fields),
    actions.length > 0 && React.createElement('div', { key: 'actions', className: 'card-actions' }, actions)
  ]);
};

// Kanban board component
const KanbanBoard = ({ 
  intents, 
  ongoingDeals, 
  closedDeals, 
  currentRole, 
  selectedBank, 
  permissions,
  onExpressInterest,
  onCloseDeal,
  onDeleteIntent
}) => {
  const filteredOngoingDeals = currentRole === 'bank' && selectedBank
    ? ongoingDeals.filter(deal => deal.bankName === selectedBank)
    : ongoingDeals;

  return React.createElement('main', { className: 'kanban-board' }, [
    // Open Intents Column
    React.createElement('div', { key: 'open', className: 'kanban-column' }, [
      React.createElement('div', { key: 'header', className: 'column-header' }, [
        React.createElement('h2', { key: 'title' }, 'Open Intents'),
        React.createElement('span', { key: 'count', className: 'count-badge' }, intents.length)
      ]),
      React.createElement('div', { key: 'container', className: 'card-container' },
        intents.length === 0 
          ? React.createElement('div', { className: 'empty-state' }, 'No open intents')
          : intents.map(intent =>
              React.createElement(IntentCard, {
                key: intent.id,
                intent,
                permissions,
                currentRole,
                selectedBank,
                onExpressInterest,
                onDeleteIntent
              })
            )
      )
    ]),

    // Ongoing Deals Column
    React.createElement('div', { key: 'ongoing', className: 'kanban-column' }, [
      React.createElement('div', { key: 'header', className: 'column-header' }, [
        React.createElement('h2', { key: 'title' }, 'Ongoing Deals'),
        React.createElement('span', { key: 'count', className: 'count-badge' }, filteredOngoingDeals.length)
      ]),
      React.createElement('div', { key: 'container', className: 'card-container' },
        filteredOngoingDeals.length === 0
          ? React.createElement('div', { className: 'empty-state' }, 'No ongoing deals')
          : filteredOngoingDeals.map((deal, index) =>
              React.createElement(DealCard, {
                key: `${deal.intentId}-${deal.bankName}-${index}`,
                deal,
                permissions,
                onCloseDeal,
                isOngoing: true
              })
            )
      )
    ]),

    // Closed Deals Column
    React.createElement('div', { key: 'closed', className: 'kanban-column' }, [
      React.createElement('div', { key: 'header', className: 'column-header' }, [
        React.createElement('h2', { key: 'title' }, 'Closed Deals'),
        React.createElement('span', { key: 'count', className: 'count-badge' }, closedDeals.length)
      ]),
      React.createElement('div', { key: 'container', className: 'card-container' },
        closedDeals.length === 0
          ? React.createElement('div', { className: 'empty-state' }, 'No closed deals')
          : closedDeals.map(deal =>
              React.createElement(DealCard, {
                key: deal.id,
                deal,
                permissions,
                onCloseDeal,
                isOngoing: false
              })
            )
      )
    ])
  ]);
};

// Main App component
const App = () => {
  const [currentRole, setCurrentRole] = useState('company');
  const [selectedBank, setSelectedBank] = useState('');
  const [intents, setIntents] = useState(initialData.intents);
  const [ongoingDeals, setOngoingDeals] = useState(initialData.ongoingDeals);
  const [closedDeals, setClosedDeals] = useState(initialData.closedDeals);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const permissions = getRolePermissions(currentRole);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification({ message: '', type: '' });
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role !== 'bank' && role !== 'admin') {
      setSelectedBank('');
    }
    showNotification(`Switched to ${role} role`, 'info');
  };

  const handleCreateIntent = (intent) => {
    setIntents(prev => [...prev, intent]);
    showNotification('Intent created successfully!');
  };

  const handleExpressInterest = (intentId) => {
    if (!selectedBank) {
      showNotification('Please select your bank first', 'error');
      return;
    }

    const intent = intents.find(i => i.id === intentId);
    if (!intent) {
      showNotification('Intent not found', 'error');
      return;
    }

    const existingDeal = ongoingDeals.find(d => d.intentId === intentId && d.bankName === selectedBank);
    if (existingDeal) {
      showNotification('You have already expressed interest in this intent', 'warning');
      return;
    }

    const newDeal = {
      intentId,
      companyName: intent.companyName,
      bankName: selectedBank,
      timestamp: new Date().toISOString()
    };

    setOngoingDeals(prev => [...prev, newDeal]);
    showNotification('Interest expressed successfully!');
  };

  const handleCloseDeal = (intentId, bankName) => {
    const intent = intents.find(i => i.id === intentId);
    if (!intent) {
      showNotification('Intent not found', 'error');
      return;
    }

    const closedDeal = {
      id: intentId,
      companyName: intent.companyName,
      winningBank: bankName,
      amount: intent.amount,
      timestamp: new Date().toISOString()
    };

    setClosedDeals(prev => [...prev, closedDeal]);
    setIntents(prev => prev.filter(i => i.id !== intentId));
    setOngoingDeals(prev => prev.filter(d => d.intentId !== intentId));

    showNotification(`Deal closed with ${bankName}!`);
  };

  const handleDeleteIntent = (intentId) => {
    setIntents(prev => prev.filter(i => i.id !== intentId));
    setOngoingDeals(prev => prev.filter(d => d.intentId !== intentId));
    showNotification('Intent deleted successfully!', 'warning');
  };

  const handleDeleteAllIntents = () => {
    if (window.confirm('Are you sure you want to delete all intents? This action cannot be undone.')) {
      setIntents([]);
      setOngoingDeals([]);
      showNotification('All intents deleted!', 'warning');
    }
  };

  const handleDeleteAllDeals = () => {
    if (window.confirm('Are you sure you want to delete all deals? This action cannot be undone.')) {
      setOngoingDeals([]);
      setClosedDeals([]);
      showNotification('All deals deleted!', 'warning');
    }
  };

  return React.createElement('div', { className: 'container' }, [
    React.createElement(Header, {
      key: 'header',
      currentRole,
      onRoleChange: handleRoleChange
    }),
    
    React.createElement(GuestNotice, {
      key: 'guest-notice',
      currentRole
    }),
    
    React.createElement(AdminPanel, {
      key: 'admin-panel',
      currentRole,
      onDeleteAllIntents: handleDeleteAllIntents,
      onDeleteAllDeals: handleDeleteAllDeals
    }),

    React.createElement(IntentForm, {
      key: 'intent-form',
      onCreateIntent: handleCreateIntent,
      permissions
    }),

    React.createElement(BankSelector, {
      key: 'bank-selector',
      selectedBank,
      onBankChange: setSelectedBank,
      permissions
    }),

    React.createElement(KanbanBoard, {
      key: 'kanban-board',
      intents,
      ongoingDeals,
      closedDeals,
      currentRole,
      selectedBank,
      permissions,
      onExpressInterest: handleExpressInterest,
      onCloseDeal: handleCloseDeal,
      onDeleteIntent: handleDeleteIntent
    }),

    React.createElement(Notification, {
      key: 'notification',
      message: notification.message,
      type: notification.type,
      onClose: hideNotification
    })
  ]);
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));