from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # 1. Verify Homepage
    print("Verifying Homepage...")
    page.goto("http://localhost:3000")
    # Wait for the book card's image to be loaded and visible
    first_book_image = page.locator("#featured-books .book-card .book-cover").first
    expect(first_book_image).to_be_visible()
    page.wait_for_timeout(1000) # Add a hard wait for rendering
    page.screenshot(path="jules-scratch/verification/01_homepage.png")
    print("Homepage OK.")

    # 2. Navigate to and Verify Book Detail Page
    print("Verifying Book Detail Page...")
    featured_book_link = page.locator("#featured-books .book-card-link").first
    featured_book_link.click()
    page.wait_for_url("**/book.html?id=*")
    book_title = page.locator("#book-title")
    expect(book_title).not_to_be_empty()
    # Also check for similar books to ensure the full API call worked
    similar_book_card = page.locator("#similar-books .book-card").first
    expect(similar_book_card).to_be_visible()
    page.wait_for_timeout(1000) # Add a hard wait for rendering
    page.screenshot(path="jules-scratch/verification/02_book_detail_page.png")
    print("Book Detail Page OK.")

    # 3. Navigate to and Verify Blog Listing Page
    print("Verifying Blog Listing Page...")
    page.goto("http://localhost:3000/blog.html")
    post_summary_card = page.locator(".post-summary-card").first
    expect(post_summary_card).to_be_visible()
    page.wait_for_timeout(1000) # Add a hard wait for rendering
    page.screenshot(path="jules-scratch/verification/03_blog_listing_page.png")
    print("Blog Listing Page OK.")

    # 4. Navigate to and Verify Single Post Page
    print("Verifying Single Post Page...")
    read_more_link = post_summary_card.locator("a.btn")
    read_more_link.click()
    page.wait_for_url("**/post.html?id=*")
    post_title = page.locator("#post-content h1")
    expect(post_title).not_to_be_empty()
    page.wait_for_timeout(1000) # Add a hard wait for rendering
    page.screenshot(path="jules-scratch/verification/04_post_detail_page.png")
    print("Single Post Page OK.")

    browser.close()
    print("All verification steps passed!")

with sync_playwright() as playwright:
    run(playwright)
