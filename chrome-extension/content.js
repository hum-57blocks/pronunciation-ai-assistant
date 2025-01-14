let audioElement = null
let hoverIcon = null
let selectedText = ''
let isExtensionValid = true
let isLoading = false

// Create hover icon element
function createHoverIcon() {
	const icon = document.createElement('div')
	icon.className = 'pronounce-hover-icon'

	// Create SVG container
	const svgContainer = document.createElement('div')
	svgContainer.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  `

	// Create loading spinner
	const spinner = document.createElement('div')
	spinner.style.cssText = `
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    display: none;
    animation: spin 1s linear infinite;
  `

	// Add keyframes for spinner animation
	const style = document.createElement('style')
	style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
	document.head.appendChild(style)

	icon.appendChild(svgContainer)
	icon.appendChild(spinner)

	icon.style.cssText = `
    position: fixed;
    width: 28px;
    height: 28px;
    background: #4285f4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    transition: all 0.2s ease;
    opacity: 0.9;
  `

	// Add hover effect
	icon.addEventListener('mouseenter', () => {
		if (!isLoading) {
			icon.style.transform = 'scale(1.1)'
			icon.style.opacity = '1'
		}
	})

	icon.addEventListener('mouseleave', () => {
		if (!isLoading) {
			icon.style.transform = 'scale(1)'
			icon.style.opacity = '0.9'
		}
	})

	// Add click effect for playing audio
	icon.addEventListener('click', () => {
		if (isExtensionValid && !isLoading) {
			isLoading = true
			icon.style.transform = 'scale(0.95)'
			svgContainer.style.display = 'none'
			spinner.style.display = 'block'
			pronounceText(selectedText)
		} else if (!isExtensionValid) {
			showNotification('Please refresh the page to reactivate the extension')
		}
	})

	return { icon, svgContainer, spinner }
}

// Handle text selection
document.addEventListener('mouseup', e => {
	const selection = window.getSelection()
	const text = selection.toString().trim()

	if (text) {
		selectedText = text // Store the selected text
		if (!hoverIcon) {
			const { icon, svgContainer, spinner } = createHoverIcon()
			hoverIcon = { element: icon, svgContainer, spinner }
			document.body.appendChild(icon)
		}

		const range = selection.getRangeAt(0)
		const rect = range.getBoundingClientRect()

		// Position the icon near the end of selection
		hoverIcon.element.style.left = `${rect.right + window.scrollX + 5}px`
		hoverIcon.element.style.top = `${rect.top + window.scrollY - 30}px`
		hoverIcon.element.style.display = 'flex'
		hoverIcon.element.style.transform = 'scale(1)'
	} else if (hoverIcon) {
		hoverIcon.element.style.display = 'none'
	}
})

// Hide icon when clicking elsewhere
document.addEventListener('mousedown', e => {
	if (hoverIcon && !hoverIcon.element.contains(e.target)) {
		hoverIcon.element.style.display = 'none'
	}
})

// Function to request pronunciation
function pronounceText(text) {
	if (!text || text.trim() === '') {
		showNotification('Please select some text first')
		resetIcon()
		return
	}

	try {
		chrome.runtime.sendMessage({
			action: 'pronounceText',
			text: text
		}, response => {
			if (chrome.runtime.lastError) {
				isExtensionValid = false
				showNotification('Extension needs to be refreshed. Please reload the page.')
				resetIcon()
			}
		})
	} catch (error) {
		isExtensionValid = false
		showNotification('Extension needs to be refreshed. Please reload the page.')
		resetIcon()
	}
}

function resetIcon() {
	if (hoverIcon) {
		isLoading = false
		hoverIcon.spinner.style.display = 'none'
		hoverIcon.svgContainer.style.display = 'block'
		hoverIcon.element.style.transform = 'scale(1)'
	}
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'playAudio') {
		if (audioElement) {
			audioElement.pause()
			audioElement.remove()
		}

		try {
			// Convert array data back to Uint8Array and create blob
			const uint8Array = new Uint8Array(message.audioData)
			const blob = new Blob([uint8Array], { type: 'audio/wav' })
			const audioUrl = URL.createObjectURL(blob)

			audioElement = new Audio()

			// Add error handling for audio loading
			audioElement.addEventListener('error', (e) => {
				showNotification('Error loading audio')
				URL.revokeObjectURL(audioUrl)
				resetIcon()
			})

			audioElement.addEventListener('ended', () => {
				URL.revokeObjectURL(audioUrl)
				resetIcon()
			})

			// Set the source and play
			audioElement.src = audioUrl
			audioElement.play()
				.catch(error => {
					showNotification('Error playing pronunciation')
					URL.revokeObjectURL(audioUrl)
					resetIcon()
				})
		} catch (error) {
			showNotification('Error creating audio player')
			resetIcon()
		}
	} else if (message.action === 'error') {
		showNotification(message.message)
		resetIcon()
	}
})

function showNotification(message) {
	const notification = document.createElement('div')
	notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #f44336;
    color: white;
    padding: 15px;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `
	notification.textContent = message
	document.body.appendChild(notification)

	setTimeout(() => {
		notification.remove()
	}, 3000)
}

// Check extension status periodically
function checkExtensionStatus() {
	try {
		chrome.runtime.sendMessage({ action: 'ping' }, response => {
			if (chrome.runtime.lastError) {
				isExtensionValid = false
			} else {
				isExtensionValid = true
			}
		})
	} catch (error) {
		isExtensionValid = false
	}
}

// Check extension status every 5 seconds
setInterval(checkExtensionStatus, 5000)
