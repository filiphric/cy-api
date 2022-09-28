export const normalize = (type: string, namespace: string | null = null): string => {
  let normalized = type.replace('.', '-')
  if (namespace) {
    namespace = namespace.replace('.', '-')
    normalized += `-${namespace}`
  }
  return normalized
}