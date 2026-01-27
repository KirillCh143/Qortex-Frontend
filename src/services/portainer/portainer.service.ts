import { PortainerService, ContainerStatus, ContainerHealth } from './types'

// Portainer API response types
interface PortainerContainerState {
  Status: string
  Running: boolean
  Paused: boolean
  StartedAt: string
}

interface PortainerContainer {
  Id: string
  Names: string[]
  State: string
  Status: string
  Created: number
}

interface PortainerContainerDetail {
  Id: string
  Name: string
  State: PortainerContainerState
  Config: {
    Health?: {
      Test: string[]
    }
  }
}

// Helper function to format uptime from timestamp
const formatUptime = (startedAt: string): string => {
  const start = new Date(startedAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Real implementation using Portainer API
export const createRealPortainerService = (): PortainerService => {
  const portainerUrl = import.meta.env.VITE_PORTAINER_URL || 'http://localhost:9443'
  const endpointId = import.meta.env.VITE_PORTAINER_ENDPOINT_ID || '2'
  const apiToken = import.meta.env.VITE_PORTAINER_TOKEN || ''

  return {
    async getContainers() {
      try {
        const response = await fetch(
          `${portainerUrl}/api/endpoints/${endpointId}/docker/containers/json?all=true`,
          {
            headers: {
              'X-API-Key': apiToken,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Portainer API error: ${response.statusText}`)
        }

        const containers: PortainerContainer[] = await response.json()

        // For each container, we need to get detailed info to access State and Health
        const detailedContainers = await Promise.all(
          containers.map(async (container) => {
            try {
              const detailResponse = await fetch(
                `${portainerUrl}/api/endpoints/${endpointId}/docker/containers/${container.Id}/json`,
                {
                  headers: {
                    'X-API-Key': apiToken,
                  },
                }
              )

              if (!detailResponse.ok) {
                throw new Error(`Failed to get container details: ${detailResponse.statusText}`)
              }

              return (await detailResponse.json()) as PortainerContainerDetail
            } catch (error) {
              console.error(`Failed to get details for container ${container.Id}:`, error)
              return null
            }
          })
        )

        // Transform to our Container type
        return detailedContainers
          .filter((detail): detail is PortainerContainerDetail => detail !== null)
          .map((detail) => {
            // Map status - check Paused first since paused containers have Running=true
            let status: ContainerStatus = 'stopped'
            if (detail.State.Paused) {
              status = 'paused'
            } else if (detail.State.Running) {
              status = 'running'
            }

            // Map health
            let health: ContainerHealth = 'none'
            if (detail.Config.Health) {
              // Container has health check configured, but we need to check the actual health status
              // For simplicity, we'll default to 'none' unless we can get health status from State
              health = 'none'
            }

            // Format uptime - only for running containers (not paused)
            const uptime = detail.State.Running && !detail.State.Paused ? formatUptime(detail.State.StartedAt) : '-'

            // Clean up container name (remove leading slash)
            const name = detail.Name.startsWith('/') ? detail.Name.substring(1) : detail.Name

            return {
              id: detail.Id,
              name,
              status,
              uptime,
              health,
            }
          })
      } catch (error) {
        console.error('Failed to fetch containers from Portainer:', error)
        throw new Error(
          error instanceof Error
            ? `Failed to fetch containers: ${error.message}`
            : 'Failed to fetch containers from Portainer'
        )
      }
    },
  }
}
