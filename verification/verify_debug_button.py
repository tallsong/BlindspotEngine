from playwright.sync_api import sync_playwright

def verify_debug_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Look for the debug button in the header
            debug_button = page.locator("button:has-text('Debug: Show Plan')")
            debug_button.wait_for()

            # Click it
            debug_button.click()

            # Verify we jumped to the Calendar View
            page.wait_for_selector("text=Your Knowledge Bridge Plan")

            # Verify mock data is present (e.g. "Distributed Systems Primer" is expected for mock Q1: 'no')
            page.wait_for_selector("text=Distributed Systems Primer")

            print("Successfully skipped to Calendar View via Debug Button.")

            # Screenshot
            page.screenshot(path="verification/debug_button.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_debug.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_debug_button()
