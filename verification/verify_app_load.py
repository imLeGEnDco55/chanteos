from playwright.sync_api import sync_playwright
import time

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:8080...")
            page.goto("http://localhost:8080")

            print("Waiting for content...")
            # Wait for "Chanteos" header
            page.wait_for_selector("text=Chanteos", timeout=10000)

            print("Taking screenshot...")
            page.screenshot(path="verification/app_loaded.png")
            print("Screenshot saved to verification/app_loaded.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_load()
