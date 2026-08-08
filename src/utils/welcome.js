const LOCAL_STORAGE_KEY = 'focusflow_welcome_seen'

export function hasSeenWelcome() {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'
  } catch {
    // Private mode / storage disabled - don't trap the user on the intro
    return true
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
  } catch {
    // Ignore - worst case the intro shows again next visit
  }
}
