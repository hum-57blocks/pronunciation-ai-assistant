chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: 'pronounceText',
		title: 'Pronounce Text',
		contexts: ['selection'],
	})
	
	// Set default API URL if not set
	chrome.storage.sync.get(['apiUrl'], (result) => {
		if (!result.apiUrl) {
			chrome.storage.sync.set({
				apiUrl: 'https://05ff-202-66-98-133.ngrok-free.app'
			})
		}
	})
})

// Function to handle text-to-speech conversion
function handleTextToSpeech(text, tab) {
	if (!text || text.trim() === '') {
		chrome.tabs.sendMessage(tab.id, {
			action: 'error',
			message: 'No text selected',
		})
		return
	}

	// Get API URL from storage
	chrome.storage.sync.get(['apiUrl'], (result) => {
		const baseUrl = result.apiUrl || 'https://05ff-202-66-98-133.ngrok-free.app'
		const url = `${baseUrl}?prompt=${encodeURIComponent(text.trim())}`

		fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'audio/wav'
			}
		})
			.then(async response => {
				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
				}
				
				// Get the WAV file as array buffer
				const buffer = await response.arrayBuffer()
				
				if (buffer.byteLength === 0) {
					throw new Error('Received empty audio data')
				}

				// Send the array buffer data to content script
				chrome.tabs.sendMessage(tab.id, {
					action: 'playAudio',
					audioData: Array.from(new Uint8Array(buffer))
				})
			})
			.catch(error => {
				chrome.tabs.sendMessage(tab.id, {
					action: 'error',
					message: 'Failed to get pronunciation: ' + error.message
				})
			})
	})
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'pronounceText') {
		handleTextToSpeech(info.selectionText, tab)
	}
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'pronounceText') {
		handleTextToSpeech(message.text, sender.tab)
	} else if (message.action === 'ping') {
		// Respond to ping to confirm extension is active
		sendResponse({ status: 'ok' })
	}
	return true // Keep message channel open for async response
})
