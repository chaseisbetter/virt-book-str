import time
from playwright.sync_api import sync_playwright, expect

def verify_loading_sequence(page):
    """
    Verifies that the CSS loading spinner appears and is then replaced by book content.
    """
    # Listen for and print any console messages from the browser
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    def handle_route(route):
        # Intercept the books API call to add a delay
        print("Intercepted /api/books request, adding delay...")
        time.sleep(1.5)
        route.continue_()

    # 1. Arrange: Intercept the books API call
    page.route("**/api/books", handle_route)

    # 2. Act: Go to the homepage
    print("Navigating to homepage...")
    page.goto("http://localhost:3000")

    # 3. Assert: Check that the loader is visible first
    print("Looking for CSS loader...")
    loader = page.locator(".loader")

    try:
        expect(loader).to_be_visible(timeout=5000)
        print("Loader found!")
    except Exception as e:
        print("Failed to find CSS loader.")
        page.screenshot(path="jules-scratch/verification/loader_not_found.png")
        print("Screenshot taken of the failed state.")
        raise e

    # Take a screenshot of the loading state
    page.screenshot(path="jules-scratch/verification/loader_visible.png")
    print("Screenshot of the loader has been taken.")

    # 4. Assert: Wait for the books to load and the loader to disappear
    print("Waiting for books to load...")
    first_book = page.locator(".book-card a").first
    expect(first_book).to_be_visible(timeout=7000)

    expect(loader).not_to_be_visible()
    print("Books have loaded and loader is hidden.")

    # Take a screenshot of the final state
    page.screenshot(path="jules-scratch/verification/books_loaded.png")
    print("Screenshot of the final loaded state has been taken.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_loading_sequence(page)
            print("\n✅ Verification successful!")
        except Exception as e:
            print(f"\n❌ Verification failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
