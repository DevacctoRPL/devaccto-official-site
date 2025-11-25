import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Get initial theme from localStorage or system preference
function getInitialTheme(): boolean {
  if (!browser) return false;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const isDarkMode = writable(getInitialTheme());

// Initialize theme on load
if (browser) {
  const root = document.documentElement;
  const isDark = getInitialTheme();
  
  // Set initial theme
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) { // Only follow system if no manual preference set
      if (e.matches) {
        root.classList.add('dark');
        isDarkMode.set(true);
      } else {
        root.classList.remove('dark');
        isDarkMode.set(false);
      }
    }
  });
}

export function toggleTheme() {
  isDarkMode.update(current => {
    const newTheme = !current;
    
    if (browser) {
      const root = document.documentElement;
      if (newTheme) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
    
    return newTheme;
  });
}
