/**
 * TUI Engine Wrapper for @mariozechner/pi-tui
 * 
 * This module provides a compatibility layer between the old Ink-based TUI
 * and the new pi-tui framework.
 * 
 * Migration: Components are migrated to implement pi-tui's Component interface
 * which requires a render(width: number): string[] method.
 */

// ============================================================================
// Core Re-exports from pi-tui
// ============================================================================

// Main TUI class
export { TUI } from '@mariozechner/pi-tui'

// Component interface (required for all UI elements)
export type { Component } from '@mariozechner/pi-tui'

// Container for grouping components  
export { Container } from '@mariozechner/pi-tui'

// Type definitions
export type { Rect, Size, Focusable, OverlayOptions, OverlayHandle } from '@mariozechner/pi-tui'

// Built-in Components
export {
  Box,
  Text,
  Spacer,
  Input,
  Loader,
  Spinner,
  SelectList,
  Markdown,
  SettingsList,
  Image,
  Editor,
  TruncatedText,
  CancellableLoader,
} from '@mariozechner/pi-tui'

// Utilities
export { 
  visibleWidth, 
  truncateToWidth, 
  wrapTextWithAnsi,
  fuzzyMatch,
  fuzzyFilter,
} from '@mariozechner/pi-tui'

// Key bindings
export {
  setKeybindings,
  getKeybindings,
  KeybindingsManager,
  TUI_KEYBINDINGS,
} from '@mariozechner/pi-tui'

// Keyboard input
export {
  parseKey,
  matchesKey,
  isKeyRepeat,
  isKeyRelease,
  isKittyProtocolActive,
  Key,
  type KeyEventType,
  type KeyId,
} from '@mariozechner/pi-tui'

// Terminal capabilities
export {
  getCapabilities,
  setCellDimensions,
  getCellDimensions,
  renderImage,
  allocateImageId,
  deleteKittyImage,
  deleteAllKittyImages,
  type TerminalCapabilities,
  type ImageProtocol,
  type CellDimensions,
} from '@mariozechner/pi-tui'

// Stdin buffer
export {
  StdinBuffer,
  type StdinBufferOptions,
  type StdinBufferEventMap,
} from '@mariozechner/pi-tui'

// ============================================================================
// Migration Helper Functions
// ============================================================================

import chalk from 'chalk'

/**
 * Helper to wrap text with theme colors using chalk (existing theme system)
 */
export function themedText(
  text: string,
  options: {
    color?: string
    backgroundColor?: string
    bold?: boolean
    dim?: boolean
    italic?: boolean
    underline?: boolean
  } = {}
): string {
  let stylizedText = chalk.text(text)
  
  if (options.bold) stylizedText = stylizedText.bold
  if (options.dim) stylizedText = stylizedText.dim
  if (options.italic) stylizedText = stylizedText.italic
  if (options.underline) stylizedText = stylizedText.underline
  if (options.color) {
    stylizedText = stylizedText[options.color as keyof typeof chalk] as any || stylizedText
  }
  if (options.backgroundColor) {
    stylizedText = stylizedText.bg[options.backgroundColor as keyof typeof chalk] as any || stylizedText
  }
  
  return stylizedText.string
}

/**
 * Map Ink-style props to pi-tui component options
 */
export function mapInkPropsToPITUI(props: {
  color?: string
  backgroundColor?: string
  bold?: boolean
  dimColor?: boolean
  italic?: boolean
  underline?: boolean
}): {
  color?: string
  backgroundColor?: string
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
} {
  return {
    color: props.color,
    backgroundColor: props.backgroundColor,
    bold: props.bold,
    dim: props.dimColor,
    italic: props.italic,
    underline: props.underline,
  }
}

// ============================================================================
// Component Adapters for Migration
// ============================================================================

/**
 * Adapter to convert Ink-style React component to pi-tui Component
 * Use this for gradual migration of components
 */
export class InkComponentAdapter implements Component {
  private renderFn: (width: number) => string[]
  private inputHandler?: (data: string) => void
  
  constructor(
    renderFn: (width: number) => string[],
    inputHandler?: (data: string) => void
  ) {
    this.renderFn = renderFn
    this.inputHandler = inputHandler
  }
  
  render(width: number): string[] {
    return this.renderFn(width)
  }
  
  handleInput?(data: string): void {
    if (this.inputHandler) {
      this.inputHandler(data)
    }
  }
  
  invalidate(): void {
    // No-op for adapter - components handle their own invalidation
  }
}

/**
 * Create a pi-tui compatible text component from a string
 * Uses the built-in Text component from pi-tui
 */
export function createTextComponent(
  text: string,
  options?: {
    color?: string
    bold?: boolean
    dim?: boolean
  }
): Text {
  return new Text(text, options)
}

/**
 * Create a box container from pi-tui
 */
export function createBox(
  children: Component[] = [],
  options?: {
    border?: boolean
    borderColor?: string
    padding?: number
  }
): Box {
  const box = new Box()
  for (const child of children) {
    box.addChild(child)
  }
  return box
}

// ============================================================================
// Initialization
// ============================================================================

import type { Terminal } from '@mariozechner/pi-tui'

/**
 * Initialize and start the TUI
 */
export async function createTUI(): Promise<TUI> {
  const tui = new TUI()
  await tui.start()
  return tui
}

/**
 * Get the terminal dimensions
 */
export function getTerminalSize(tui: TUI): { width: number; height: number } {
  return {
    width: tui.terminal.columns,
    height: tui.terminal.rows,
  }
}

// Alias the TUI class for direct instantiation
export { TUI as TUIClass }