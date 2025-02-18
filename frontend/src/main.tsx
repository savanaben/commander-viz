import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import App from './App'
import { GraphProvider } from './store/GraphContext'

// Get the root element
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <GraphProvider>
      <App />
    </GraphProvider>
  </StrictMode>
)