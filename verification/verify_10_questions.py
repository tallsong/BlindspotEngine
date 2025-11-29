from playwright.sync_api import sync_playwright

def verify_10_questions():
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

            # Step 2: Diagnostic (Answer 10 questions)
            # Question 1
            page.click("text=No, this is new to me")
            # Question 2
            page.click("text=Yes, I am confident")
            # Question 3
            page.click("text=No, this is new to me")
            # Question 4
            page.click("text=Somewhat / Unsure")
            # Question 5
            page.click("text=No, this is new to me")
            # Question 6
            page.click("text=Yes, I am confident")
            # Question 7
            page.click("text=No, this is new to me")
            # Question 8
            page.click("text=No, this is new to me")
            # Question 9
            page.click("text=Yes, I am confident")
            # Question 10
            page.click("text=No, this is new to me")


            # Step 3: Calendar Plan
            page.wait_for_selector("text=Your Knowledge Bridge Plan")

            # Verify specific items from later questions (e.g., Vector Clocks - Q10)
            # Should see "Logical Clocks & Ordering"
            page.wait_for_selector("text=Logical Clocks & Ordering")
            print("Found Q10 task: Logical Clocks & Ordering")

            # Check if time labels extend past 6 PM (18)
            # The last task starts at 9 + (sum of durations).
            # Durations:
            # Q1(No): 1
            # Q2(Yes): 2
            # Q3(No): 1
            # Q4(Somewhat): 2
            # Q5(No): 1
            # Q6(Yes): 1
            # Q7(No): 1
            # Q8(No): 1
            # Q9(Yes): 1
            # Q10(No): 1
            # Reflection: 1
            # Total Duration: 13 hours.
            # Start: 9 AM. End: 9 + 13 = 22 (10 PM).
            # The calendar should show up to 10 PM.

            page.wait_for_selector("text=9 PM")
            print("Found 9 PM label.")

            page.wait_for_selector("text=10 PM")
            print("Found 10 PM label.")

            # Take screenshot
            page.screenshot(path="verification/calendar_overflow.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state_10q.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_10_questions()
