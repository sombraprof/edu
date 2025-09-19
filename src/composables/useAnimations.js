import { nextTick } from 'vue'

/**
 * Composable for handling staggered animations
 * @returns {Object} Animation utilities
 */
export function useAnimations() {
  /**
   * Applies staggered animation delays to child elements
   * @param {string} containerSelector - CSS selector for containers
   * @param {Object} options - Animation options
   * @param {number} options.groupDelay - Delay between groups (ms)
   * @param {number} options.itemDelay - Delay between items (ms)
   */
  const applyStagger = async (containerSelector, options = {}) => {
    const {
      groupDelay = 120,
      itemDelay = 40
    } = options

    await nextTick()

    const containers = document.querySelectorAll(containerSelector)

    containers.forEach((container, groupIndex) => {
      const children = Array.from(container.children)
      children.forEach((child, itemIndex) => {
        const delay = groupIndex * groupDelay + itemIndex * itemDelay
        child.style.setProperty('--stagger-delay', `${delay}ms`)
      })
    })
  }

  /**
   * Applies layout transition classes
   * @param {string} containerSelector - CSS selector for containers
   * @param {string} transitionClass - CSS class for transition
   * @param {number} duration - Transition duration in ms
   */
  const applyLayoutTransition = (containerSelector, transitionClass = 'layout-fade', duration = 200) => {
    const containers = document.querySelectorAll(containerSelector)

    containers.forEach((container) => {
      container.classList.add(transitionClass)
      setTimeout(() => {
        container.classList.remove(transitionClass)
      }, duration)
    })
  }

  /**
   * Combines stagger and layout transition
   * @param {string} containerSelector - CSS selector for containers
   * @param {Object} staggerOptions - Options for stagger animation
   */
  const animateContainer = async (containerSelector, staggerOptions = {}) => {
    applyLayoutTransition(containerSelector)
    await applyStagger(containerSelector, staggerOptions)
  }

  return {
    applyStagger,
    applyLayoutTransition,
    animateContainer
  }
}