// PlantUML client-side encoder utilities
// We use DEFALTE compression and HEX encoding with prefix ~h to generate URLs compatible with PlantUML server
// Reference: https://plantuml.com/text-encoding

import plantumlEncoder from 'plantuml-encoder'

/**
 * Compress PlantUML text using DEFLATE and encode as hex with ~h prefix
 * This avoids having to implement PlantUML's custom base64 alphabet.
 */
// Use official-like encoder implementation (Deflate + custom Base64 alphabet)
export function encodePlantUml(text: string): string {
  return plantumlEncoder.encode(text)
}

export type PlantUmlFormat = 'png' | 'svg'

/**
 * Build PlantUML server URL for an encoded diagram
 * @param encoded Prefixed hex string (output of encodePlantUmlToHex)
 * @param format 'png' or 'svg'
 * @param server PlantUML server base URL
 */
export function buildPlantUmlUrl(encoded: string, format: PlantUmlFormat = 'png', server = 'https://www.plantuml.com/plantuml') {
  return `${server}/${format}/${encoded}`
}

/**
 * Convenience function: directly build URL from source text
 */
export function plantUmlUrlFromText(text: string, format: PlantUmlFormat = 'png', server?: string) {
  const encoded = encodePlantUml(text)
  return buildPlantUmlUrl(encoded, format, server)
}