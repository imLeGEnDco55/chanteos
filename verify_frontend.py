import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    # Go to app
    print("Navigating to app...")
    try:
        page.goto("http://localhost:8080/chanteos/", timeout=10000)
    except Exception as e:
        print(f"Error navigating: {e}")
        time.sleep(2)
        page.goto("http://localhost:8080/chanteos/")

    # Wait for content
    print("Waiting for content...")
    try:
        # Check if we have songs or empty state
        page.wait_for_selector("text=Nueva canción", timeout=5000)
    except:
        print("Timeout waiting for 'Nueva canción'.")
        page.screenshot(path="debug_screenshot.png")
        raise

    # Click on "Nueva canción"
    print("Clicking 'Nueva canción'...")
    # Force click if obscured or moving
    page.click("text=Nueva canción", force=True)

    # Dialog opens
    print("Waiting for dialog input...")
    # Use placeholder from CreateSongDialog
    page.wait_for_selector("input[placeholder='Mi nueva canción']")

    # Fill title
    print("Filling title...")
    page.fill("input[placeholder='Mi nueva canción']", "Test Song")

    # Click "Crear"
    print("Clicking 'Crear'...")
    page.click("button:has-text('Crear')")

    # Wait for editor
    # "Línea" button is in LyricsContent
    print("Waiting for editor content...")
    page.wait_for_selector("text=Línea", timeout=5000)

    # Verify elements
    if page.is_visible("text=Prompt"):
        print("Prompt button visible.")
    else:
        print("Prompt button NOT visible.")

    # Verify stats
    # "líneas" text in stats
    # Wait for stats to appear (might be delayed if async?)
    # But LyricsContent renders immediately.
    if page.is_visible("text=líneas"):
        print("Stats visible.")

    print("Editor opened. Taking screenshot...")

    # Take screenshot of the editor
    page.screenshot(path="verification_screenshot.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
