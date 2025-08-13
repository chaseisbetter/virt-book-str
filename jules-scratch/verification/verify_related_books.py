import asyncio
import subprocess
import time
from playwright.async_api import async_playwright, expect

async def main():
    # Start the server as a subprocess
    server_process = subprocess.Popen(['npm', 'start'])

    # Give the server a moment to start
    time.sleep(5)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Navigate to a specific book detail page
            await page.goto('http://localhost:3000/book.html?id=2')

            # Wait for the main content to load
            await expect(page.locator('.book-detail-title')).to_contain_text('A Court of Thorns and Roses')

            # Find the "Related Tomes" section and wait for it to be visible
            related_tomes_header = page.locator('h3', has_text='Related Tomes')
            await expect(related_tomes_header).to_be_visible(timeout=10000)

            # Check if a specific related book is present
            # Book 2 is "High Fantasy", so Book 3 ("Fourth Wing") should be a related book.
            related_book_card = page.locator('.book-card-link[href="book.html?id=3"]')
            await expect(related_book_card).to_be_visible()
            await expect(related_book_card.locator('.book-title')).to_have_text('Fourth Wing')

            # Take a screenshot of the full page
            await page.screenshot(path='jules-scratch/verification/related_books_verification.png', full_page=True)

            await browser.close()
    finally:
        # Stop the server
        server_process.terminate()

if __name__ == '__main__':
    asyncio.run(main())
