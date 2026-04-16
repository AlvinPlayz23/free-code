/**
 * AgentProgressLine - Migrated to @mariozechner/pi-tui
 * 
 * This is a pi-tui Component that replicates the functionality of the Ink-based AgentProgressLine.
 * It renders a single line with a spinner and status text for agent progress display.
 * 
 * Original: src/components/AgentProgressLine.tsx (Ink/React)
 * Migration target for TUI v2 using pi-tui framework.
 */

import { Component } from '@mariozechner/pi-tui'
import chalk from 'chalk'
import { formatNumber } from '../../utils/format.js'

export type AgentProgressLineProps = {
  agentType: string
  description?: string
  name?: string
  descriptionColor?: string
  taskDescription?: string
  toolUseCount: number
  tokens: number | null
  color?: string
  isLast: boolean
  isResolved: boolean
  isError: boolean
  isAsync?: boolean
  shouldAnimate: boolean
  lastToolInfo?: string | null
  hideType?: boolean
}

/**
 * AgentProgressLineComponent - Renders a single line showing agent progress
 * 
 * Features:
 * - Tree character (├─ or └─) for hierarchical display
 * - Agent type/name with optional color
 * - Tool use count and token count
 * - Status text (Initializing, Running in background, Done)
 * - Spinner animation when shouldAnimate is true
 */
export class AgentProgressLineComponent implements Component {
  private props: AgentProgressLineProps
  private animationFrame: number = 0
  private spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  
  constructor(props: AgentProgressLineProps) {
    this.props = props
  }
  
  /**
   * Update the component props
   */
  setProps(props: Partial<AgentProgressLineProps>): void {
    this.props = { ...this.props, ...props }
  }
  
  /**
   * Advance the animation frame
   */
  tick(): void {
    this.animationFrame = (this.animationFrame + 1) % this.spinnerChars.length
  }
  
  /**
   * Render the component
   * @param width - Current viewport width
   * @returns Array of strings, each representing a line
   */
  render(width: number): string[] {
    const {
      agentType,
      description,
      name,
      taskDescription,
      toolUseCount,
      tokens,
      color,
      isLast,
      isResolved,
      isError,
      isAsync = false,
      shouldAnimate,
      lastToolInfo,
      hideType = false,
    } = this.props
    
    const treeChar = isLast ? '└─' : '├─'
    const isBackgrounded = isAsync && isResolved
    
    // Determine status text
    let statusText: string
    if (!isResolved) {
      statusText = lastToolInfo || 'Initializing...'
    } else if (isBackgrounded) {
      statusText = taskDescription ?? 'Running in the background'
    } else if (isError) {
      statusText = 'Error'
    } else {
      statusText = 'Done'
    }
    
    // Build the agent name portion
    let nameText: string
    if (hideType) {
      nameText = name ?? description ?? agentType
    } else {
      nameText = agentType
      if (description) {
        nameText += ` (${description})`
      }
    }
    
    // Tool and token info
    const toolInfo = !isBackgrounded 
      ? ` · ${toolUseCount} tool ${toolUseCount === 1 ? 'use' : 'uses'}` 
      : ''
    const tokenInfo = tokens !== null 
      ? ` · ${formatNumber(tokens)} tokens` 
      : ''
    
    // Build the progress line with ANSI styling
    let line = ''
    
    // Tree character (dim)
    line += chalk.dim(treeChar + ' ')
    
    // Agent name with optional color
    if (color) {
      // Use inverse for highlighted text
      line += chalk.bold.bgHex(getColorHex(color))(nameText)
      line += ' '
    } else {
      line += chalk.bold(nameText)
    }
    
    // Tool and token counts (dim)
    line += chalk.dim(toolInfo + tokenInfo)
    
    // Separator
    line += chalk.dim(' · ')
    
    // Status text
    if (shouldAnimate && !isResolved) {
      // Show spinner
      const spinner = this.spinnerChars[this.animationFrame]
      line += chalk.green(spinner + ' ' + statusText)
    } else if (isBackgrounded) {
      line += chalk.blue(statusText)
    } else if (isResolved) {
      line += chalk.dim(statusText)
    } else if (isError) {
      line += chalk.red(statusText)
    } else {
      line += statusText
    }
    
    // Truncate to fit width
    if (line.length > width) {
      line = truncateToWidth(line, width)
    }
    
    return [line]
  }
  
  invalidate(): void {
    // Reset animation frame
    this.animationFrame = 0
  }
}

/**
 * Get hex color from theme color name
 */
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    red: '#ff6b6b',
    green: '#51cf66',
    yellow: '#fcc419',
    blue: '#339af0',
    cyan: '#22b8cf',
    magenta: '#cc5de8',
    orange: '#ff922b',
    pink: '#f783ac',
    purple: '#845ef7',
  }
  return colorMap[color] || '#ffffff'
}

/**
 * Truncate string to specified width, handling ANSI codes
 */
function truncateToWidth(text: string, width: number): string {
  // Simple truncation - in production would use pi-tui's visibleWidth
  let result = ''
  let currentWidth = 0
  
  for (const char of text) {
    // Check for ANSI escape sequence
    if (char === '\x1b') {
      result += char
      continue
    }
    
    // East Asian width check (simplified)
    const charWidth = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(char) ? 2 : 1
    
    if (currentWidth + charWidth > width) {
      break
    }
    
    result += char
    currentWidth += charWidth
  }
  
  return result
}

/**
 * Create an AgentProgressLineComponent with default props
 */
export function createAgentProgressLine(
  agentType: string,
  toolUseCount: number = 0,
  tokens: number | null = null
): AgentProgressLineComponent {
  return new AgentProgressLineComponent({
    agentType,
    toolUseCount,
    tokens,
    isLast: false,
    isResolved: false,
    isError: false,
    shouldAnimate: true,
  })
}