import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { saveSettings, loadSettings, type ApiSettings } from '@/lib/settings'

export default function Settings() {
  const [formValues, setFormValues] = useState<ApiSettings>({
    directusUrl: '',
    n8nWebhookUrl: '',
    messagePersistence: true
  })

  // Load initial values from localStorage on mount
  useEffect(() => {
    const settings = loadSettings()
    setFormValues(settings)
  }, [])

  const handleSave = () => {
    saveSettings(formValues)
    console.log('Settings saved successfully!')
  }

  const handleReset = () => {
    localStorage.removeItem('api-settings')
    const defaults = loadSettings()
    setFormValues(defaults)
    console.log('Settings reset to defaults')
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your backend API endpoints for Directus and n8n
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="directusUrl" className="text-sm font-medium text-gray-900">
              Directus URL
            </label>
            <Input
              id="directusUrl"
              type="url"
              placeholder="http://localhost:8055"
              value={formValues.directusUrl}
              onChange={(e) => setFormValues({ ...formValues, directusUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              URL of your Directus backend instance (used for authentication and data)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="n8nWebhookUrl" className="text-sm font-medium text-gray-900">
              n8n Webhook URL
            </label>
            <Input
              id="n8nWebhookUrl"
              type="url"
              placeholder="http://localhost:5678/webhook/chat"
              value={formValues.n8nWebhookUrl}
              onChange={(e) => setFormValues({ ...formValues, n8nWebhookUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              Webhook endpoint for n8n chat workflow processing
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Settings
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Chat Preferences</CardTitle>
          <CardDescription>
            Control how chat messages are stored and persisted
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="messagePersistence" className="text-sm font-medium text-gray-900">
                Persist Message History
              </label>
              <p className="text-sm text-gray-500">
                When enabled, chat messages are saved and restored across sessions. When disabled, chat clears on page refresh.
              </p>
            </div>
            <Switch
              id="messagePersistence"
              checked={formValues.messagePersistence}
              onCheckedChange={(checked) => setFormValues({ ...formValues, messagePersistence: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
