import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming dev server runs on 8080)
        page.goto("http://localhost:8080")

        # Wait for "Mis Canciones" to appear
        page.get_by_text("Mis Canciones").wait_for()

        # Click "Nueva canción" button (either the big one or the header one)
        # The empty state has a button with text "Nueva canción" inside it, plus icon.
        # The header button is icon only but we didn't add label to it in this PR (it was existing code or ignored).
        # Let's target by text if possible.
        # If there are no songs, "Nueva canción" text is visible.
        # If there are songs, we might need to click the plus button.
        # Assuming empty state first, or check if button exists.

        create_btn = page.get_by_role("button", name="Nueva canción")
        if create_btn.count() > 0 and create_btn.is_visible():
             create_btn.first.click()
        else:
             # Fallback to the plus button in header if list is not empty
             # It has className="rounded-full" and inside <Plus ...>
             # It doesn't have accessible name yet (unless added).
             # Let's just click the one in header.
             # locate by class or icon.
             page.locator("header button.rounded-full").click()

        # Fill title
        page.get_by_label("Título").fill("Test Song")

        # Create dummy mp3 file
        dummy_path = os.path.abspath("dummy.mp3")
        if not os.path.exists(dummy_path):
            with open(dummy_path, "wb") as f:
                f.write(b"dummy audio content")

        # Upload audio file
        # The input is typically hidden. locate by type=file.
        page.locator("input[type=file]").set_input_files(dummy_path)

        # Click "Crear"
        page.get_by_role("button", name="Crear").click()

        # Wait for the SongEditor to load.
        # We should see "Test Song" as the title input value.
        page.get_by_placeholder("Título de la canción").wait_for()

        # Now we should see the AudioPlayer controls because we uploaded a file.
        # Let's verify the ARIA labels.

        # Check Rhyme Panel toggle button
        toggle_btn = page.locator('button[aria-label="Mostrar panel de rimas"]')
        expect(toggle_btn).to_be_visible()

        # Check Play/Pause button
        play_btn = page.locator('button[aria-label="Reproducir"]')
        expect(play_btn).to_be_visible()

        # Check other buttons
        expect(page.locator('button[aria-label="Abrir librería de prompts"]')).to_be_visible()
        expect(page.locator('button[aria-label="Deshacer último cambio"]')).to_be_visible()
        expect(page.locator('button[aria-label="Retroceder 3 segundos"]')).to_be_visible()
        expect(page.locator('button[aria-label="Adelantar 3 segundos"]')).to_be_visible()
        # Loop button logic is complex. 'off' -> 'Establecer punto A de bucle'
        expect(page.locator('button[aria-label="Establecer punto A de bucle"]')).to_be_visible()
        expect(page.locator('button[aria-label="Insertar marca de tiempo"]')).to_be_visible()

        # Take screenshot
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
