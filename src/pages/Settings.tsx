import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { RefreshCw } from 'lucide-react'
import { useContainers } from '@/hooks/useContainers'

export default function Settings() {
  const { data: containers, isLoading, error, refetch } = useContainers()
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Set lastUpdated on initial data load
  useEffect(() => {
    if (containers && !lastUpdated) {
      setLastUpdated(new Date())
    }
  }, [containers, lastUpdated])

  const handleRefresh = () => {
    refetch()
    setLastUpdated(new Date())
  }

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-700">Запущен</span>
          </div>
        )
      case 'stopped':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-700">Остановлен</span>
          </div>
        )
      case 'paused':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-yellow-700">Приостановлен</span>
          </div>
        )
      default:
        return status
    }
  }

  const getHealthDisplay = (health: string) => {
    switch (health) {
      case 'healthy':
        return <span className="text-green-700">Здоровый</span>
      case 'unhealthy':
        return <span className="text-red-700">Нездоровый</span>
      case 'none':
        return <span className="text-gray-400">—</span>
      default:
        return <span className="text-gray-400">—</span>
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Контейнеры</h1>

        <Card>
          <CardHeader>
            <CardTitle>Статус контейнеров</CardTitle>
            <CardDescription>
              Мониторинг состояния Docker контейнеров в Portainer
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Последнее обновление: {formatTimestamp(lastUpdated)}
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-[#8466e4] hover:bg-[#7049f3] text-white gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>

            {isLoading && !containers ? (
              <div className="text-center py-8 text-gray-500">Загрузка...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Ошибка загрузки данных: {error.message}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Имя</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Время работы</TableHead>
                    <TableHead>Здоровье</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {containers?.map((container) => (
                    <TableRow key={container.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{container.name}</TableCell>
                      <TableCell>{getStatusDisplay(container.status)}</TableCell>
                      <TableCell>{container.uptime}</TableCell>
                      <TableCell>{getHealthDisplay(container.health)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
