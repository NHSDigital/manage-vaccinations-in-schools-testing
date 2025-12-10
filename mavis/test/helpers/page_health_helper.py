from urllib.parse import urljoin, urlparse

from playwright.sync_api import Page

from mavis.test.pages.error_pages import BadRequestPage

HTTP_NOT_FOUND = 404
HTTP_CLIENT_ERROR = 400


class PageHealthHelper:
    """Helper class for checking page health including error pages and broken links."""

    def __init__(self, page: Page) -> None:
        """Initialize the helper with a Playwright page.

        Args:
            page: The Playwright page object to check
        """
        self.page = page
        self.checked_urls = set()

    def check_for_error_page(self) -> list[str]:
        """Check if the current page is an error page using BadRequestPage.

        Returns:
            List of error messages if error page indicators are found
        """
        errors = []

        # Use BadRequestPage to check for error page
        bad_request_page = BadRequestPage(self.page)
        if bad_request_page.page_heading.count() > 0:
            errors.append("Error page detected: 'Error: page not available'")

        return errors

    def check_for_broken_links(
        self, *, max_links: int = 20
    ) -> list[tuple[str, int, str]]:
        """Check for broken links on the current page.

        Args:
            max_links: Maximum number of links to check to avoid performance issues

        Returns:
            List of tuples containing (url, status_code, error_message)
        """
        broken_links = []
        links_checked = 0

        # Find all links on the page
        all_links = self.page.locator("a[href]").all()

        for link in all_links:
            if links_checked >= max_links:
                break

            try:
                href = link.get_attribute("href")
                if not href or href.startswith(("mailto:", "tel:", "javascript:", "#")):
                    continue

                links_checked += 1

                # Convert relative URLs to absolute
                if href.startswith("/"):
                    base_url = f"{urlparse(self.page.url).scheme}://{urlparse(self.page.url).netloc}"
                    full_url = urljoin(base_url, href)
                else:
                    full_url = href

                # Skip if we've already checked this URL
                if full_url in self.checked_urls:
                    continue

                self.checked_urls.add(full_url)

                # Check the link
                try:
                    response = self.page.request.get(full_url, timeout=10000)
                    if response.status >= HTTP_CLIENT_ERROR:
                        link_text = link.inner_text()[:50] or href[:50]
                        broken_links.append(
                            (
                                full_url,
                                response.status,
                                f"Broken link: '{link_text}' -> {full_url} "
                                f"(Status: {response.status})",
                            )
                        )
                except (TimeoutError, ConnectionError) as e:
                    link_text = link.inner_text()[:50] or href[:50]
                    broken_links.append(
                        (
                            full_url,
                            0,
                            f"Failed to check link: '{link_text}' -> {full_url} "
                            f"(Error: {e!s})",
                        )
                    )

            except (AttributeError, RuntimeError):
                # Skip problematic links
                continue

        return broken_links

    def check_page_health(
        self, *, check_links: bool = True, max_links: int = 20
    ) -> None:
        """Complete page health check.

        Args:
            check_links: Whether to check for broken links
            max_links: Maximum number of links to check

        Raises:
            AssertionError: If any health issues are found
        """
        # Check for error pages
        error_page_errors = self.check_for_error_page()
        if error_page_errors:
            error_msg = f"Page health check failed: {'; '.join(error_page_errors)}"
            raise AssertionError(error_msg)

        # Check for broken links if requested
        if check_links:
            broken_links = self.check_for_broken_links(max_links=max_links)
            if broken_links:
                error_messages = [error for _, _, error in broken_links]
                error_msg = f"Broken links found: {'; '.join(error_messages)}"
                raise AssertionError(error_msg)

        # Clear checked URLs cache
        self.checked_urls.clear()
