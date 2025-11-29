from playwright.sync_api import sync_playwright

def verify_google_calendar_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Step 1: Config
            page.fill("input[placeholder='e.g. Frontend Engineering']", "DevOps")
            page.fill("input[placeholder='e.g. System Design']", "SRE")
            page.fill("input[placeholder='e.g. I want to become a Staff Engineer']", "Principal Engineer")
            page.click("text=Start Analysis")

            # Step 2: Diagnostic (Fast forward)
            page.click("text=No, this is new to me")
            page.click("text=Yes, I am confident")
            page.click("text=No, this is new to me")

            # Step 3: Calendar Plan
            page.wait_for_selector("text=Your Knowledge Bridge Plan")

            # Verify UI Elements specific to the new layout
            # 1. Check for time sidebar elements (e.g., "9 AM", "12 PM")
            page.wait_for_selector("text=9 AM")
            page.wait_for_selector("text=12 PM")
            print("Found time labels.")

            # 2. Check for absolute positioned events
            # We look for the event "Distributed Systems Primer" which should be the first one.
            # In the list view it was a relative block, now it should be absolute.
            # We can't easily check CSS 'position: absolute' via selector text, but we can take a screenshot.

            # Take screenshot of the Google Calendar style view
            page.screenshot(path="verification/google_calendar_view.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state_cal.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_google_calendar_ui()
