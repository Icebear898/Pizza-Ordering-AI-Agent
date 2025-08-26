# 🍕 Pizza Shop Voice Assistant

A modern, AI-powered voice assistant for pizza ordering built with React, TypeScript, and Deepgram's Voice Agent API. Customers can naturally converse with the assistant to browse menus, customize pizzas, and place orders seamlessly.

## ✨ Features

- **🎤 Natural Voice Interaction**: Speak naturally with the AI assistant
- **🍕 Smart Menu Navigation**: Ask about pizzas, sizes, crusts, toppings, and prices
- **📝 Intelligent Order Building**: Add items, customize, and modify orders through conversation
- **👤 Customer Management**: Collect delivery/pickup preferences, contact info, and addresses
- **💳 Payment Processing**: Handle various payment methods
- **📊 Real-time Order Tracking**: Visual order summary and status updates
- **🎨 Modern UI**: Clean, responsive design with pizza-themed aesthetics
- **🔄 Order Management**: Complete orders and start fresh with new orders

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Deepgram Voice Agent API** for speech recognition and synthesis

### Backend
- **FastAPI** (Python) for order management
- **SQLModel** for database operations
- **SQLite** for data persistence

### AI & Voice
- **Deepgram Nova** for speech-to-text
- **OpenAI GPT-4** for natural language understanding
- **Deepgram Aura** for text-to-speech

## 🏗️ Architecture

```
├── Frontend (React + TypeScript)
│   ├── Voice Agent Integration
│   ├── Order Management UI
│   └── Real-time Status Updates
├── Backend (FastAPI)
│   ├── Menu API
│   ├── Order Processing
│   └── Database Management
└── AI Layer
    ├── Speech Recognition
    ├── Natural Language Processing
    └── Speech Synthesis
```

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Deepgram API key
- OpenAI API key

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pizza-shop-voice-assistant
```

### 2. Install Frontend Dependencies
```bash
cd voice-agent-medical-assistant-demo
npm install
```

### 3. Install Backend Dependencies
```bash
cd ..
source .venv/bin/activate  # or create new venv
pip install fastapi uvicorn sqlmodel pydantic
```

### 4. Environment Setup
Create a `.env` file in the root directory:
```env
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Running the Application

### Start the Backend
```bash
# From root directory
source .venv/bin/activate
uvicorn pizza_backend:app --reload --host 127.0.0.1 --port 8000
```

### Start the Frontend
```bash
# From voice-agent-medical-assistant-demo directory
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Voice Commands
- **"What's on the menu?"** - Browse available pizzas, sides, and drinks
- **"I'd like a large Margherita pizza"** - Add items to your order
- **"Make it a combo"** - Customize with sides and drinks
- **"Add extra cheese"** - Modify toppings and extras
- **"What's my order total?"** - Review current order
- **"Place my order"** - Finalize and send to kitchen

### Order Flow
1. **Greeting**: Assistant welcomes you warmly
2. **Service Type**: Choose dine-in, delivery, or pickup
3. **Menu Browsing**: Ask about items, prices, and options
4. **Order Building**: Add pizzas, customize toppings, select sides/drinks
5. **Customer Info**: Provide name, phone, and delivery address if needed
6. **Payment**: Select payment method
7. **Confirmation**: Review and finalize order
8. **Kitchen**: Order sent to kitchen with confirmation

## 🗄️ API Endpoints

### Menu
- `GET /menu` - Retrieve complete menu with prices and descriptions

### Orders
- `POST /orders` - Create new order
- `GET /orders/{order_id}` - Check order status

## 🎨 UI Components

- **Voice Orb**: Interactive animation showing listening/speaking states
- **Order Summary**: Real-time display of current items and customizations
- **Customer Panel**: Form fields for contact and delivery information
- **Status Updates**: Visual feedback for order progression
- **Kitchen Confirmation**: Celebration screen when order is sent

## 🔧 Configuration

### Voice Settings
- **Speech Model**: Deepgram Nova for accurate transcription
- **TTS Voice**: Aura speaker for natural-sounding responses
- **Language**: English with natural conversation flow

### AI Behavior
- **Temperature**: 0.6 for consistent, helpful responses
- **Context**: Maintains conversation state throughout ordering
- **Function Calls**: Structured data extraction for orders

## 🧪 Testing

### Voice Testing
1. Allow microphone access
2. Speak clearly and naturally
3. Test various order scenarios
4. Verify function call responses

### API Testing
```bash
# Test menu endpoint
curl http://localhost:8000/menu

# Test order creation
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[],"customer":{"full_name":"Test","phone":"123","dine_type":"dine-in"}}'
```

## 🚧 Troubleshooting

### Common Issues
- **Microphone not working**: Check browser permissions and device settings
- **Voice not responding**: Verify Deepgram API key and network connection
- **Orders not saving**: Check backend server status and database connection

### Debug Mode
Enable console logging for detailed voice agent interactions and API calls.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Deepgram** for powerful voice AI capabilities
- **OpenAI** for natural language understanding
- **React Team** for the amazing frontend framework
- **FastAPI** for the modern Python web framework

## 📞 Support

For questions or issues:
- Create an issue in this repository
- Check the [Deepgram documentation](https://developers.deepgram.com/)
- Review the [FastAPI documentation](https://fastapi.tiangolo.com/)

---

**Made with ❤️ for pizza lovers everywhere! 🍕**
