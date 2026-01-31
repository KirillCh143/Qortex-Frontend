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
  Image: string
  Ports: Array<{
    PrivatePort: number
    PublicPort?: number
    Type: string
  }>
  Health?: {
    Status: string
  }
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
      // Validate configuration
      if (!apiToken) {
        throw new Error(
          'Portainer API token not configured. Set VITE_PORTAINER_TOKEN in .env file. ' +
          'Get token from: Portainer UI → Settings → Users → [Your user] → Add access token'
        )
      }

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
          if (response.status === 404) {
            throw new Error(
              `Portainer endpoint not found (ID: ${endpointId}). ` +
              'Check VITE_PORTAINER_ENDPOINT_ID in .env. ' +
              'Find correct ID: Portainer UI → Endpoints, or run: ' +
              `curl -H "X-API-Key: YOUR_TOKEN" ${portainerUrl}/api/endpoints`
            )
          }
          throw new Error(`Portainer API error: ${response.statusText}`)
        }

        const containers: PortainerContainer[] = await response.json()

        // For each container, we need to get detailed info to access State
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

              const detail = (await detailResponse.json()) as PortainerContainerDetail
              return { container, detail }
            } catch (error) {
              console.error(`Failed to get details for container ${container.Id}:`, error)
              return null
            }
          })
        )

        // Transform to our Container type
        return detailedContainers
          .filter((item): item is { container: PortainerContainer; detail: PortainerContainerDetail } => item !== null)
          .map(({ container, detail }) => {
            // Map status - check Paused first since paused containers have Running=true
            let status: ContainerStatus = 'stopped'
            if (detail.State.Paused) {
              status = 'paused'
            } else if (detail.State.Running) {
              status = 'running'
            }

            // Map health from list API (already includes Health.Status)
            let health: ContainerHealth = 'none'
            if (container.Health?.Status) {
              if (container.Health.Status === 'healthy') {
                health = 'healthy'
              } else if (container.Health.Status === 'unhealthy') {
                health = 'unhealthy'
              }
              // 'starting' or 'none' status → keep as 'none'
            }

            // Format uptime - only for running containers (not paused)
            const uptime = detail.State.Running && !detail.State.Paused ? formatUptime(detail.State.StartedAt) : '-'

            // Clean up container name (remove leading slash)
            const name = detail.Name.startsWith('/') ? detail.Name.substring(1) : detail.Name

            // Extract port mapping - format as "PublicPort:PrivatePort"
            const port = container.Ports.length > 0 && container.Ports[0].PublicPort
              ? `${container.Ports[0].PublicPort}:${container.Ports[0].PrivatePort}`
              : '-'

            // Extract image name
            const image = container.Image || '-'

            return {
              id: detail.Id,
              name,
              status,
              uptime,
              health,
              port,
              image,
            }
          })
      } catch (error) {
        console.error('Failed to fetch containers from Portainer:', error)

        // Provide helpful error messages for common issues
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error(
            `Cannot connect to Portainer API. Check VITE_PORTAINER_URL in .env ` +
            `(current: ${portainerUrl}). Ensure Portainer is running and accessible.`
          )
        }

        throw new Error(
          error instanceof Error
            ? `Failed to fetch containers: ${error.message}`
            : 'Failed to fetch containers from Portainer'
        )
      }
    },
  }
}
