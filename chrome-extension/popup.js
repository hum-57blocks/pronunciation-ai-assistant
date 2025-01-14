document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl')
  const saveButton = document.getElementById('saveButton')
  const statusDiv = document.getElementById('status')

  // Load saved API URL
  chrome.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) {
      apiUrlInput.value = result.apiUrl
    }
  })

  // Save API URL
  saveButton.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim()
    
    if (!apiUrl) {
      showStatus('Please enter an API URL', 'error')
      return
    }

    chrome.storage.sync.set({ apiUrl }, () => {
      showStatus('Settings saved successfully', 'success')
    })
  })

  function showStatus(message, type) {
    statusDiv.textContent = message
    statusDiv.className = `status ${type}`
    statusDiv.style.display = 'block'
    
    setTimeout(() => {
      statusDiv.style.display = 'none'
    }, 3000)
  }
}) 