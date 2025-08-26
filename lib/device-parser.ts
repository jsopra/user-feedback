export interface DeviceInfo {
  type: "mobile" | "desktop" | "tablet"
  name: string
  os: string
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Detect device type and specific device
  if (/ipad/.test(ua)) {
    return {
      type: "tablet",
      name: "iPad",
      os: /os (\d+)/.test(ua) ? `iOS ${ua.match(/os (\d+)/)?.[1]}` : "iOS",
    }
  }

  if (/android.*tablet|android.*pad/.test(ua)) {
    return {
      type: "tablet",
      name: "Android Tablet",
      os: /android (\d+)/.test(ua) ? `Android ${ua.match(/android (\d+)/)?.[1]}` : "Android",
    }
  }

  if (/iphone/.test(ua)) {
    return {
      type: "mobile",
      name: "iPhone",
      os: /os (\d+)/.test(ua) ? `iOS ${ua.match(/os (\d+)/)?.[1]}` : "iOS",
    }
  }

  if (/android/.test(ua)) {
    return {
      type: "mobile",
      name: "Android Phone",
      os: /android (\d+)/.test(ua) ? `Android ${ua.match(/android (\d+)/)?.[1]}` : "Android",
    }
  }

  if (/mobile|phone/.test(ua)) {
    return {
      type: "mobile",
      name: "Mobile Device",
      os: "Unknown",
    }
  }

  // Desktop detection
  if (/windows/.test(ua)) {
    return {
      type: "desktop",
      name: "Windows PC",
      os: /windows nt (\d+\.\d+)/.test(ua) ? `Windows ${ua.match(/windows nt (\d+\.\d+)/)?.[1]}` : "Windows",
    }
  }

  if (/macintosh|mac os/.test(ua)) {
    return {
      type: "desktop",
      name: "Mac",
      os: /mac os x (\d+[._]\d+)/.test(ua)
        ? `macOS ${ua.match(/mac os x (\d+[._]\d+)/)?.[1]?.replace("_", ".")}`
        : "macOS",
    }
  }

  if (/linux/.test(ua)) {
    return {
      type: "desktop",
      name: "Linux PC",
      os: "Linux",
    }
  }

  // Default fallback
  return {
    type: "desktop",
    name: "Unknown Device",
    os: "Unknown",
  }
}

export function getDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" {
  return parseUserAgent(userAgent).type
}

export function parseDeviceFromUserAgent(userAgent: string): "mobile" | "desktop" | "tablet" {
  return getDeviceType(userAgent)
}
