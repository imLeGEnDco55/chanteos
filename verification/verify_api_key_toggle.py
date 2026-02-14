from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the app
    # The output said http://localhost:8080/chanteos/
    page.goto("http://localhost:8080/chanteos/")

    # Wait for the page to load (e.g. check for "Chanteos" title or header)
    page.wait_for_selector("text=Chanteos")

    # Open Settings Dialog
    page.get_by_label("Ajustes").click()

    # Wait for Dialog to open
    page.wait_for_selector("text=Configuración IA (Gemini)")

    # Check default state (password)
    api_key_input = page.locator("#api-key")
    # Verify type attribute
    input_type = api_key_input.get_attribute("type")
    print(f"Initial input type: {input_type}")
    if input_type != "password":
        print("FAIL: Initial type should be password")

    # Find the toggle button
    toggle_btn = page.get_by_label("Mostrar clave API")
    if not toggle_btn.is_visible():
        print("FAIL: Toggle button not visible")

    # Click to show
    toggle_btn.click()

    # Check state (text)
    input_type_shown = api_key_input.get_attribute("type")
    print(f"Input type after toggle: {input_type_shown}")
    if input_type_shown != "text":
        print("FAIL: Type should be text after toggle")

    # Take screenshot of the settings dialog
    page.screenshot(path="verification/settings_dialog_toggle.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
