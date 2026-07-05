from playwright.sync_api import sync_playwright

def run():
    with open('browser_logs.txt', 'w', encoding='utf-8') as f:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # Log all console messages
            page.on("console", lambda msg: f.write(f"Browser Console: {msg.type}: {msg.text}\n"))
            page.on("pageerror", lambda err: f.write(f"Browser Error: {err}\n"))
            
            f.write("Navigating to http://localhost:5173/login...\n")
            page.goto("http://localhost:5173/login")
            page.wait_for_selector("input[type='email']")
            page.fill("input[type='email']", "admin@eduai.edu")
            page.fill("input[type='password']", "admin123")
            page.click("button[type='submit']")
            
            f.write("Waiting for dashboard...\n")
            page.wait_for_url("**/dashboard")
            
            f.write("Navigating to /admin/students...\n")
            page.goto("http://localhost:5173/admin/students")
            page.wait_for_timeout(2000)
            
            f.write("Navigating to /admin/courses...\n")
            page.goto("http://localhost:5173/admin/courses")
            page.wait_for_timeout(2000)
            
            f.write("Navigating to /admin/enrollments...\n")
            page.goto("http://localhost:5173/admin/enrollments")
            page.wait_for_timeout(2000)
            
            browser.close()

run()
