# Credit Market with Negotiation Chat

A modern React-based web application for facilitating credit line requests between companies and banks using a marketplace approach with a kanban-style workflow, built with Vite and Tailwind CSS. Now featuring **intelligent negotiation chat windows** for real-time deal negotiations!

## 🚀 New Features: Intelligent Negotiations

### 💬 **Negotiation Chat Window**
- **Side Panel Interface**: Click any ongoing deal card to open a 50% width sliding drawer
- **Real-time Integration**: Powered by OpenRouter API
- **Role-based Workflows**: Different conversation flows for Banks and Companies
- **Chat History Persistence**: All conversations stored in localStorage
- **Multi-turn Negotiations**: Full support for offers, counter-offers, and acceptances

### 🏦 **Bank Negotiation Flow**
1. **Identity Verification**: Authenticate company identity before proceeding
2. **Generate Offers**: Creates tailored loan offers based on bank configuration
3. **Counter-offers**: Respond to company negotiations with intelligent responses
4. **Deal Management**: Accept final terms or cancel negotiations

### 🏢 **Company Negotiation Flow**
1. **View Bank Offers**: Review detailed loan terms and conditions
2. **Intelligent Evaluation**: Automatically evaluate offers against company preferences
3. **Smart Negotiations**: Generate counter-offers or accept favorable terms
4. **Flexible Decision Making**: Manual accept/reject or intelligent evaluation

### 🤖 **Intelligent Configuration System**
- **Bank Profiles**: Risk tolerance, interest rates, specializations, negotiation styles
- **Company Profiles**: Urgency levels, acceptable terms, industry context
- **Dynamic Generation**: Auto-creates configs for new companies based on intent data

## Features

### 🏛️ Multi-Role System
- **Company Role**: Create credit intents, view all negotiations, close deals
- **Bank Role**: Express interest in open intents, manage ongoing negotiations  
- **Admin Role**: Full system access with override capabilities for testing and management
- **Guest Role**: Read-only access for stakeholders and observers

### 📋 Kanban Workflow
- **Open Intents**: New credit requests awaiting bank interest
- **Ongoing Deals**: Active negotiations between companies and banks (now clickable!)
- **Closed Deals**: Successfully completed credit agreements (view chat history!)

### 🎯 Key Functionality
- Role-based permissions and UI customization
- Real-time visual updates across all workflow stages  
- Form validation and error handling
- Responsive design for desktop and mobile
- Professional business application styling with smooth animations
- **NEW**: Intelligent negotiation conversations
- **NEW**: Persistent chat history across sessions
- **NEW**: Identity verification for enhanced security

### 💼 Business Logic
- Intent creation with amount, duration, and purpose
- Bank interest expression creating ongoing negotiations
- **NEW**: Multi-round intelligent negotiations with offers and counter-offers
- **NEW**: Intelligent acceptance/rejection based on company preferences
- Automatic cleanup when deals are closed (removes competing negotiations)
- Complete audit trail with timestamps
- **NEW**: Chat history preservation for all completed deals

## Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling and responsive design
- **State Management**: React useState (built-in state management)
- **Date Handling**: date-fns for timestamp formatting
- **UUID**: uuid for unique identifier generation
- **HTTP Client**: axios for LLM API calls
- **API Integration**: OpenRouter API for intelligent responses
- **Storage**: localStorage for chat history persistence

## Project Structure

```
agentic-credit-market/
├── public/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.jsx
│   │   ├── IntentForm/
│   │   │   └── IntentForm.jsx
│   │   ├── KanbanBoard/
│   │   │   └── KanbanBoard.jsx
│   │   ├── IntentCard/
│   │   │   └── IntentCard.jsx
│   │   ├── OngoingDealCard/
│   │   │   └── OngoingDealCard.jsx
│   │   ├── ClosedDealCard/
│   │   │   └── ClosedDealCard.jsx
│   │   └── NegotiationDrawer/          🆕 NEW
│   │       └── NegotiationDrawer.jsx
│   ├── data/
│   │   ├── sampleData.js
│   │   ├── bankConfigs.js              🆕 NEW
│   │   └── companyConfigs.js           🆕 NEW
│   ├── services/
│   │   └── llmService.js               🆕 NEW
│   ├── utils/
│   │   ├── rolePermissions.js
│   │   └── chatStorage.js              🆕 NEW
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example                        🆕 NEW
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- **OpenRouter API Key** (for intelligent negotiations)

### Installation

1. **Clone or download the project files**
   ```bash
   git clone <repository-url>
   cd agentic-credit-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your OpenRouter API key
   VITE_OPENROUTER_API_KEY=your_actual_api_key_here
   ```

4. **Get OpenRouter API Key**
   - Go to [OpenRouter.ai](https://openrouter.ai/)
   - Sign up for an account
   - Navigate to the Keys section
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will start on `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## 🎮 How to Use the Negotiation Feature

### 1. **Start a Negotiation**
- Switch to **Bank** role and select a bank
- Click on any **Ongoing Deal** card
- The negotiation drawer slides in from the right

### 2. **Bank Workflow**
```
Identity Verification → Generate Offer → Counter-offers → Accept/Cancel
```

### 3. **Company Workflow**
```
View Offers → Intelligent Evaluation → Accept/Negotiate → Final Decision
```

### 4. **View Chat History**
- Click on any **Closed Deal** card
- View the complete negotiation history
- See final terms and agreements

## Usage Guide

### Role-Based Access

1. **Company Users**
   - Select "Company" role from the header
   - Use the form to create new credit intents
   - **NEW**: Click ongoing deal cards to view/participate in negotiations
   - **NEW**: Accept offers or generate intelligent counter-offers
   - Close deals by accepting bank offers in chat

2. **Bank Users**  
   - Select "Bank" role and choose your bank from the dropdown
   - View open intents in the left column
   - Click "Express Interest" to start negotiations
   - **NEW**: Click ongoing deal cards to open negotiation chat
   - **NEW**: Verify company identity before making offers
   - **NEW**: Generate intelligent loan offers and counter-offers

3. **Admin Users**
   - Select "Admin" role for full system access
   - Can create intents on behalf of any company
   - Can express interest as any bank
   - **NEW**: Can participate in any negotiation as either party
   - Can delete intents and manage the entire system
   - Special admin badge (⭐) appears in the UI

4. **Guest Users**
   - Select "Guest" role for read-only access
   - Can view all data but cannot perform any actions
   - **NEW**: Can view ongoing negotiations but cannot participate
   - **NEW**: Can view chat history of closed deals
   - Clear visual indication (👁️) of view-only status

### Negotiation Workflow

1. **Company Creates Intent**: Submit credit request with amount, duration, and purpose
2. **Bank Expresses Interest**: Banks review and express interest in open intents
3. **🆕 Negotiation Chat Opens**: Click ongoing deal to start intelligent negotiations
4. **🆕 Identity Verification**: Bank verifies company authenticity
5. **🆕 Offer Exchange**: Intelligent system generates offers, counter-offers, and evaluations
6. **🆕 Deal Acceptance**: Company accepts final terms through chat
7. **Deal Completion**: Automatic cleanup and chat history preservation

## Configuration

### Bank Configurations
Each bank has detailed configuration including:
- Risk tolerance and interest rate preferences
- Loan amount limits and duration preferences
- Collateral requirements and credit score thresholds
- Negotiation style and industry specializations
- Decision speed and flexibility levels

### Company Configurations
Companies have profiles that include:
- Urgency levels and acceptable interest rates
- Collateral availability and credit scores
- Business stage and cash flow patterns
- Negotiation preferences and priority factors
- Industry context and risk profiles

### API Integration
The system uses OpenRouter API with:
- High-quality response generation
- Context-aware prompts based on configurations
- Multi-turn conversation support
- Error handling with retry mechanisms

## Customization

### Styling
- Modify Tailwind config in `tailwind.config.js` for theme changes
- Add custom utilities in `src/index.css`
- Use Tailwind's utility classes directly in components
- Extend color palette, spacing, or typography in the theme

### Data
- Modify sample data in `src/data/sampleData.js`
- Add new banks to the `availableBanks` array
- Customize bank configurations in `src/data/bankConfigs.js`
- Modify company profiles in `src/data/companyConfigs.js`

### Permissions
- Update role permissions in `src/utils/rolePermissions.js`
- Add new roles or modify existing capabilities
- Customize role-based UI behavior

### Response Generation
- Modify prompts in `src/services/llmService.js`
- Adjust model parameters and response handling
- Customize evaluation criteria and offer generation
- Add new negotiation strategies

## Troubleshooting

### Common Issues

1. **API Errors**
   - Verify your OpenRouter API key is correct
   - Check your account has sufficient credits
   - Ensure environment variable is properly set

2. **Chat History Not Persisting**
   - Check browser localStorage is enabled
   - Clear localStorage if experiencing issues
   - Verify chat storage utility functions

3. **Negotiation Drawer Not Opening**
   - Ensure you've selected the correct role
   - For bank role, make sure a bank is selected
   - Check console for JavaScript errors

4. **Tailwind styles not working**
   - Ensure `tailwind.config.js` content paths are correct
   - Verify `@tailwind` directives are in `src/index.css`
   - Check that PostCSS is configured properly

5. **Development server issues**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility
   - Ensure port 3000 is available

## Future Enhancements

### Potential Features
- **Advanced AI Models**: Support for multiple LLM providers
- **Voice Negotiations**: Audio-based conversation support
- **Document Generation**: Automatic contract generation from chat
- **Analytics Dashboard**: Negotiation success rates and patterns
- **Real-time Notifications**: WebSocket integration for live updates
- **Multi-language Support**: International market expansion
- **Integration APIs**: Connection with actual banking systems
- **Advanced Security**: Enhanced identity verification methods

### Technical Improvements
- **State Management**: Redux or Zustand for complex state
- **Testing**: Jest and React Testing Library
- **TypeScript**: Enhanced type safety and developer experience
- **Performance**: Virtualization for large conversation lists
- **Offline Support**: Service workers for offline functionality
- **Database Integration**: Replace localStorage with persistent storage

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires ES6+ support (most browsers from 2017+)
- localStorage support required for chat persistence

## Contributing

When extending this application:

1. Follow Tailwind's utility-first approach
2. Use the established color and spacing system
3. Maintain role-based permission checks
4. Test negotiation flows across different roles
5. Follow responsive design patterns
6. Update configuration files when adding new banks/companies
7. Test API integration thoroughly
8. Update this README with new features or setup changes

## License

This project is designed as a prototype/demonstration application. Customize the license according to your needs.

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## API Costs

The application uses OpenRouter API which has usage-based pricing. Monitor your usage through the OpenRouter dashboard.

---

For questions or issues, please refer to the code comments and component documentation within the source files. The negotiation feature adds significant value to the credit marketplace by enabling realistic, intelligent deal-making experiences.