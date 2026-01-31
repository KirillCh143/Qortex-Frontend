import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlayCircle, CirclePause, CircleStop, Layers, Cpu } from 'lucide-react'
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

  // Calculate statistics
  const stats = {
    running: containers?.filter((c) => c.status === 'running').length || 0,
    paused: containers?.filter((c) => c.status === 'paused').length || 0,
    stopped: containers?.filter((c) => c.status === 'stopped').length || 0,
    total: containers?.length || 0,
  }

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700">Running</span>
          </div>
        )
      case 'stopped':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
            <span className="size-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-bold text-red-700">Stopped</span>
          </div>
        )
      case 'paused':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-100">
            <span className="size-2 rounded-full bg-yellow-500"></span>
            <span className="text-xs font-bold text-yellow-700">Paused</span>
          </div>
        )
      default:
        return status
    }
  }

  const getHealthDisplay = (health: string) => {
    switch (health) {
      case 'healthy':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-700">Здоровый</span>
          </div>
        )
      case 'unhealthy':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
            <span className="size-2 rounded-full bg-red-500"></span>
            <span className="text-xs font-bold text-red-700">Нездоровый</span>
          </div>
        )
      case 'none':
        return <span className="text-slate-400">—</span>
      default:
        return <span className="text-slate-400">—</span>
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900">Статус системы</h1>
          <p className="text-slate-500 text-sm mt-1">
            Мониторинг активности и здоровья Docker контейнеров
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {/* Active Containers */}
          <div className="bg-white p-4 rounded-xl border border-slate-300/85 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <PlayCircle className="h-7 w-7" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-800">{stats.running}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Активные
              </span>
            </div>
          </div>

          {/* Paused Containers */}
          <div className="bg-white p-4 rounded-xl border border-slate-300/85 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500">
              <CirclePause className="h-7 w-7" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-800">{stats.paused}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                На паузе
              </span>
            </div>
          </div>

          {/* Stopped Containers */}
          <div className="bg-white p-4 rounded-xl border border-slate-300/85 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <CircleStop className="h-7 w-7" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-800">{stats.stopped}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Остановлены
              </span>
            </div>
          </div>

          {/* Total Containers */}
          <div className="bg-white p-4 rounded-xl border border-slate-300/85 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-800">{stats.total}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Всего
              </span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-300/85 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Docker контейнеры</h2>
              <p className="text-sm text-slate-500 mt-1">
                Последнее обновление: {formatTimestamp(lastUpdated)}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-11 w-34 bg-[#8466e4] hover:bg-[#7049f3] rounded-xl text-white gap-2 shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>

          <div className="overflow-auto">
            {isLoading && !containers ? (
              <div className="text-center py-8 text-slate-500">Загрузка...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Ошибка загрузки данных: {error.message}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Имя
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Статус
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Здоровье
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Время
                    </th>
                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Порт
                    </th>
                    <th className="py-4 pl-4 pr-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Образ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {containers?.map((container) => (
                    <tr key={container.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Cpu className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">{container.name}</div>
                            <div className="text-xs text-slate-400 font-mono">
                              ID: {container.id.substring(0, 7)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusDisplay(container.status)}</td>
                      <td className="py-4 px-4">{getHealthDisplay(container.health)}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-slate-600">{container.uptime}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {container.port}
                        </span>
                      </td>
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">
                            {container.image}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
