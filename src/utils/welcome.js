// Keeps the old name on purpose: renaming the key would orphan data
// already saved in people's browsers.
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
