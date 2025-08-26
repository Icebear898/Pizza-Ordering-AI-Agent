import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App.jsx'
import './styles/globals.css'
import { stsConfig } from './lib/constants.js'
import { VoiceBotProvider } from './context/VoiceBotContextProvider.jsx'
import { MicrophoneContextProvider } from './context/MicrophoneContextProvider.jsx'
import { DeepgramContextProvider } from './context/DeepgramContextProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeepgramContextProvider>
      <MicrophoneContextProvider>
        <VoiceBotProvider>
          <App defaultStsConfig={stsConfig} />
        </VoiceBotProvider>
      </MicrophoneContextProvider>
    </DeepgramContextProvider>
  </React.StrictMode>
)