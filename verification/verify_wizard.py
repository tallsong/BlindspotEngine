from playwright.sync_api import sync_playwright

def verify_wizard_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Step 1: Check Config
            page.wait_for_selector("text=Configure Your Analysis")
            page.fill("input[placeholder='e.g. Frontend Engineering']", "Frontend Engineering")
            page.fill("input[placeholder='e.g. System Design']", "System Design")
            page.fill("input[placeholder='e.g. I want to become a Staff Engineer']", "Staff Engineer")
            page.screenshot(path="verification/step1_config.png")
            page.click("text=Start Analysis")

            # Step 2: Check Diagnostic
            page.wait_for_selector("text=Diagnostic Check")
            page.screenshot(path="verification/step2_diagnostic.png")
            page.click("text=Yes, I am confident") # Question 1
            page.click("text=Somewhat / Unsure")  # Question 2
            page.click("text=No, this is new to me") # Question 3

            # Step 3: Check Calendar
            page.wait_for_selector("text=Your Knowledge Bridge Plan")
            page.screenshot(path="verification/step3_calendar.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_wizard_ui()
