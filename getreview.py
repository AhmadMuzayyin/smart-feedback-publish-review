from playwright.sync_api import sync_playwright
import time
import json
import re

def extract_reviews(page):
    reviews = page.query_selector_all('div[data-review-id^="Ch"]')
    review_data = []
    
    for review in reviews:
        try:
            author_name_elem = review.query_selector('div.d4r55')
            author_name = author_name_elem.inner_text() if author_name_elem else "Unknown"
            
            author_url_elem = review.query_selector('a.WNxzHc')
            author_url = author_url_elem.get_attribute('href') if author_url_elem else None
            
            rating_elems = review.query_selector_all('span.vzX5Ic span[aria-label$="stars"]')
            rating = len(rating_elems) if rating_elems else None
            
            text_elem = review.query_selector('span.wiI7pd')
            text = text_elem.inner_text() if text_elem else ""
            
            time_elem = review.query_selector('span.rsqaWe')
            time_element = time_elem.inner_text() if time_elem else None
            
            profile_photo = review.query_selector('img.NBa7we')
            profile_photo_url = profile_photo.get_attribute('src') if profile_photo else None
            
            lang_span = review.query_selector('span.tntU7c')
            language = lang_span.get_attribute('lang') if lang_span else None
            
            review_data.append({
                "author_name": author_name,
                "author_url": author_url,
                "language": language,
                "profile_photo_url": profile_photo_url,
                "rating": rating,
                "relative_time_description": time_element,
                "text": text
            })
        except Exception as e:
            print(f"Error extracting review: {e}")
    
    return review_data
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Navigate to the Google Maps page for the place
        page.goto("https://www.google.com/maps/place/Publish+Agency+-+KOL%2FInfluencer+%26+Affiliate+Campaign+%7C+Host+Live+Streaming+Entertainment+%7C+Digital+Marketing+Surabaya/@-7.2563252,112.7349484,17z/data=!3m1!5s0x2dd7f9677df46a57:0xd86c8eef486b448f!4m8!3m7!1s0x2dd7f95bec8344ab:0x6e6ef6494793c333!8m2!3d-7.2563092!4d112.7375877!9m1!1b1!16s%2Fg%2F11ldrbxrlj?entry=ttu")
        
        # Wait for the reviews section to load
        try:
            page.wait_for_selector('div[data-review-id^="Ch"]', timeout=30000)
        except TimeoutError:
            print("Timeout waiting for reviews to load. The page structure might have changed.")
            browser.close()
            return

        # Scroll to load more reviews
        for _ in range(10):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2000)  # Wait for 2 seconds

        # Extract review data
        review_data = extract_reviews(page)
        
        if not review_data:
            print("No reviews were extracted. The page structure might have changed.")
        else:
            # Save the data to a JSON file
            with open("reviews.json", "w", encoding="utf-8") as f:
                json.dump(review_data, f, ensure_ascii=False, indent=2)
            
            print(f"Scraped {len(review_data)} reviews and saved to reviews.json")
        
        browser.close()

if __name__ == "__main__":
    main()
if __name__ == "__main__":
    main()