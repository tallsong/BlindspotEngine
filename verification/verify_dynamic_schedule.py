from playwright.sync_api import sync_playwright

def verify_dynamic_schedule():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the app
            page.goto("http://localhost:3000")

            # Step 1: Config
            page.wait_for_selector("text=Configure Your Analysis")
            page.fill("input[placeholder='e.g. Frontend Engineering']", "DevOps")
            page.fill("input[placeholder='e.g. System Design']", "SRE")
            page.fill("input[placeholder='e.g. I want to become a Staff Engineer']", "Principal Engineer")
            page.click("text=Start Analysis")

            # Step 2: Diagnostic
            # Scenario:
            # Q1 (CAP): No -> Expect "Distributed Systems Primer"
            # Q2 (Sharding): Yes -> Expect "Vitess Architecture"
            # Q3 (Backpressure): No -> Expect "Understanding Backpressure"

            page.wait_for_selector("text=Diagnostic Check")

            # Q1: CAP Theorem -> No
            page.click("text=No, this is new to me")

            # Q2: Sharding -> Yes
            page.click("text=Yes, I am confident")

            # Q3: Backpressure -> No
            page.click("text=No, this is new to me")

            # Step 3: Calendar Plan
            page.wait_for_selector("text=Your Knowledge Bridge Plan")

            # Verify specific items are present/absent
            # Should see "Distributed Systems Primer" (from Q1 No)
            # Should see "Vitess Architecture Deep Dive" (from Q2 Yes)
            # Should see "Understanding Backpressure Patterns" (from Q3 No)

            print("Verifying schedule content...")

            page.wait_for_selector("text=Distributed Systems Primer")
            print("Found: Distributed Systems Primer")

            page.wait_for_selector("text=Vitess Architecture Deep Dive")
            print("Found: Vitess Architecture Deep Dive")

            page.wait_for_selector("text=Understanding Backpressure Patterns")
            print("Found: Understanding Backpressure Patterns")

            # Take screenshot of the generated plan
            page.screenshot(path="verification/dynamic_schedule.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dynamic_schedule()
