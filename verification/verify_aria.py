from playwright.sync_api import sync_playwright

def verify_aria():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:8080/...")
            page.goto("http://localhost:8080/")
            page.wait_for_load_state("networkidle")

            # 1. SongList Page Checks
            print("--- Checking SongList Page ---")

            import_btn = page.get_by_label("Importar proyecto")
            if import_btn.count() > 0:
                print("✅ Found 'Importar proyecto' button")
            else:
                print("❌ 'Importar proyecto' button NOT found")

            create_btn = page.get_by_label("Crear nueva canción")
            if create_btn.count() > 0:
                print("✅ Found 'Crear nueva canción' button")
                create_btn.click()
                print("Clicked 'Crear nueva canción'...")
            else:
                print("❌ 'Crear nueva canción' button NOT found")
                return

            # Handle Create Song Dialog
            print("--- Handling Create Song Dialog ---")
            page.wait_for_selector('text="Nueva Canción"') # Dialog title

            # Fill title
            page.fill('input[id="title"]', "Test Song 123")

            # Click Create
            page.click('button:has-text("Crear")')
            print("Clicked Create button in dialog...")

            # 2. SongEditor Page Checks
            print("--- Checking SongEditor Page ---")
            # Wait for editor to load
            page.wait_for_selector('input[placeholder="Título de la canción"]', timeout=5000)
            print("Editor loaded.")

            # Check "Back to List" button
            back_btn = page.get_by_label("Volver a la lista")
            if back_btn.count() > 0:
                print("✅ Found 'Volver a la lista' button")
            else:
                print("❌ 'Volver a la lista' button NOT found")

            # Check "Editor Options" button
            options_btn = page.get_by_label("Opciones del editor")
            if options_btn.count() > 0:
                print("✅ Found 'Opciones del editor' button")
            else:
                print("❌ 'Opciones del editor' button NOT found")

            # Check Lyric Line elements
            # Timestamp button
            timestamp_btn = page.get_by_label("Marcar tiempo actual").first
            if timestamp_btn.count() > 0:
                print("✅ Found 'Marcar tiempo actual' button")
            else:
                print("❌ 'Marcar tiempo actual' button NOT found")

            # Textarea
            textarea = page.get_by_label("Texto de la línea").first
            if textarea.count() > 0:
                print("✅ Found 'Texto de la línea' textarea")
            else:
                print("❌ 'Texto de la línea' textarea NOT found")

            add_line_btn = page.get_by_role("button", name="Línea")
            if add_line_btn.count() > 0:
                add_line_btn.click()
                print("Added a new line...")
                page.wait_for_timeout(500)

                delete_btn = page.get_by_label("Eliminar línea").last
                if delete_btn.count() > 0:
                    print("✅ Found 'Eliminar línea' button")
                else:
                    print("❌ 'Eliminar línea' button NOT found")
            else:
                print("⚠️ 'Línea' button not found")

            # Check PromptLine
            add_prompt_btn = page.get_by_role("button", name="Prompt")
            if add_prompt_btn.count() > 0:
                add_prompt_btn.click()
                print("Added a new prompt line...")
                page.wait_for_timeout(500)

                prompt_input = page.get_by_label("Contenido del prompt").last
                if prompt_input.count() > 0:
                     print("✅ Found 'Contenido del prompt' input")
                else:
                     print("❌ 'Contenido del prompt' input NOT found")

                prompt_delete = page.get_by_label("Eliminar prompt").last
                if prompt_delete.count() > 0:
                     print("✅ Found 'Eliminar prompt' button")
                else:
                     print("❌ 'Eliminar prompt' button NOT found")

            else:
                print("⚠️ 'Prompt' button not found")

            page.screenshot(path="verification/verification.png")
            print("📸 Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_aria()
