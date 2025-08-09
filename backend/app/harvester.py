"""
Harvester module for Impact ID application.
"""


from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Dict, Any, Optional, Set
import hashlib
import json
import logging
import os
import re
import requests
from sqlalchemy import func

from bs4 import BeautifulSoup
from sqlalchemy import a, funcnd_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from textblob import TextBlob
from urllib.parse import urlparse, urljoin
import aiohttp
import asyncio
import feedparser
import nltk
import time

from app import database, models
from app.utils.email import send_email, EmailTemplate


# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
except Exception as e:
    pass

# ================================
# 🔧 Configuration & Setup
# ================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ContentType(str, Enum):
    """ContentType class for Impact ID application."""
    RSS = "rss"
    NEWS_API = "news_api"
    SOCIAL_MEDIA = "social_media"
    WEB_SCRAPE = "web_scrape"
    MANUAL = "manual"

class QualityScore(str, Enum):
    """QualityScore class for Impact ID application."""
    EXCELLENT = "excellent"  # 9-10
    GOOD = "good"           # 7-8
    FAIR = "fair"           # 5-6
    POOR = "poor"           # 1-4

@dataclass
class HarvestConfig:
    """Configuration for content harvesting."""
    # Data sources
    rss_feeds: List[str]
    news_api_key: Optional[str]
    social_apis: Dict[str, str]
    scrape_urls: List[str]

    # Filtering
    keywords: List[str]
    negative_keywords: List[str]
    min_relevance_score: float
    languages: List[str]

    # Quality control
    min_word_count: int
    max_age_days: int
    enable_ai_filtering: bool

    # Performance
    batch_size: int
    concurrent_requests: int
    request_delay: float
    timeout_seconds: int

    # Notifications
    notify_on_errors: bool
    notify_on_completion: bool
    admin_emails: List[str]

# ================================
# 🤖 AI-Powered Content Analysis
# ================================

class ContentAnalyzer:
    """AI-powered content analysis for relevance and quality scoring."""

    def __init__(self):
        """__init__ function."""
        self.stopwords = set(nltk.corpus.stopwords.words('english')) if nltk else set()
        self.impact_keywords = {
            'sustainability': ['sustainability', 'sustainable', 'environment', 'climate', 'green', 'renewable', 'carbon', 'emissions'],
            'humanitarian': ['humanitarian', 'relief', 'aid', 'charity', 'nonprofit', 'volunteer', 'donation', 'help'],
            'education': ['education', 'learning', 'school', 'university', 'student', 'teacher', 'literacy'],
            'health': ['health', 'medical', 'healthcare', 'medicine', 'hospital', 'treatment', 'disease'],
            'technology': ['technology', 'innovation', 'digital', 'ai', 'blockchain', 'startup', 'tech'],
            'social': ['community', 'social', 'equality', 'justice', 'rights', 'diversity', 'inclusion']
        }

    async def analyze_content(self, title: str, content: str, url: str) -> Dict[str, Any]:
        """
        🧠 Comprehensive content analysis with AI scoring.
        """
        analysis = {
            'relevance_score': 0.0,
            'quality_score': 0.0,
            'sentiment_score': 0.0,
            'categories': [],
            'keywords_found': [],
            'word_count': 0,
            'readability_score': 0.0,
            'credibility_indicators': [],
            'issues_found': []
        }

        # Combine text for analysis
        full_text = f"{title} {content}".lower()
        analysis['word_count'] = len(full_text.split())

        # Relevance scoring
        analysis['relevance_score'] = await self._calculate_relevance_score(full_text)

        # Quality assessment
        analysis['quality_score'] = await self._assess_content_quality(title, content, url)

        # Sentiment analysis
        if content:
            try:
                blob = TextBlob(content)
                analysis['sentiment_score'] = blob.sentiment.polarity
            except Exception as e:
                analysis['sentiment_score'] = 0.0

        # Category classification
        analysis['categories'] = await self._classify_categories(full_text)

        # Keyword extraction
        analysis['keywords_found'] = await self._extract_keywords(full_text)

        # Credibility assessment
        analysis['credibility_indicators'] = await self._assess_credibility(url, title, content)

        return analysis

    async def _calculate_relevance_score(self, text: str) -> float:
        """Calculate relevance score based on keyword matching and context."""
        score = 0.0
        total_categories = len(self.impact_keywords)

        for category, keywords in self.impact_keywords.items():
            category_score = 0.0
            for keyword in keywords:
                if keyword in text:
                    # Weight by keyword importance and frequency
                    frequency = text.count(keyword)
                    category_score += min(frequency * 0.1, 1.0)

            # Normalize category score
            category_score = min(category_score, 1.0)
            score += category_score

        # Normalize final score
        return min(score / total_categories * 10, 10.0)

    async def _assess_content_quality(self, title: str, content: str, url: str) -> float:
        """Assess content quality based on multiple factors."""
        score = 5.0  # Base score

        # Title quality
        if len(title) > 10 and len(title) < 100:
            score += 1.0
        if not any(spam_word in title.lower() for spam_word in ['click', 'shocking', 'unbelievable']):
            score += 0.5

        # Content quality
        if content:
            words = content.split()
            if len(words) > 100:
                score += 1.0
            if len(words) > 300:
                score += 1.0

            # Check for proper sentences
            sentences = content.split('.')
            if len(sentences) > 3:
                score += 0.5

        # URL quality
        if url:
            domain = urlparse(url).netloc
            if any(trusted in domain for trusted in ['reuters.com', 'bbc.com', 'npr.org', 'theguardian.com']):
                score += 2.0
            elif any(spam in domain for spam in ['clickbait', 'fake']):
                score -= 3.0

        return max(1.0, min(score, 10.0))

    async def _classify_categories(self, text: str) -> List[str]:
        """Classify content into impact categories."""
        categories = []

        for category, keywords in self.impact_keywords.items():
            if any(keyword in text for keyword in keywords):
                categories.append(category)

        return categories

    async def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text."""
        words = re.findall(r'\b\w+\b', text.lower())
        words = [word for word in words if word not in self.stopwords and len(word) > 3]

        # Count frequency and return top keywords
        word_freq = {}
        for word in words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Return top 10 most frequent relevant words
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10]]

    async def _assess_credibility(self, url: str, title: str, content: str) -> List[str]:
        """Assess content credibility indicators."""
        indicators = []

        if url:
            domain = urlparse(url).netloc

            # Check for trusted domains
            trusted_domains = ['reuters.com', 'bbc.com', 'npr.org', 'theguardian.com', 'apnews.com']
            if any(trusted in domain for trusted in trusted_domains):
                indicators.append('trusted_source')

            # Check for HTTPS
            if url.startswith('https://'):
                indicators.append('secure_connection')

        # Check for author information
        if content and ('by ' in content.lower() or 'author:' in content.lower()):
            indicators.append('has_author')

        # Check for date information
        if content and any(word in content.lower() for word in ['published', 'updated', '2024', '2023']):
            indicators.append('has_date')

        return indicators

# ================================
# 🌐 Multi-Source Data Harvester
# ================================

class ImpactHarvester:
    """Advanced multi-source content harvester with AI filtering."""

    def __init__(self, config: HarvestConfig):
        """__init__ function."""
        self.config = config
        self.analyzer = ContentAnalyzer()
        self.session: Optional[aiohttp.ClientSession] = None
        self.harvested_urls: Set[str] = set()
        self.stats = {
            'total_processed': 0,
            'total_added': 0,
            'duplicates_skipped': 0,
            'low_quality_filtered': 0,
            'errors': 0,
            'sources_processed': 0
        }

    async def __aenter__(self):
        """Async context manager entry."""
        connector = aiohttp.TCPConnector(limit=self.config.concurrent_requests)
        timeout = aiohttp.ClientTimeout(total=self.config.timeout_seconds)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    async def harvest_all_sources(self) -> Dict[str, Any]:
        """
        🎯 Main harvesting function - processes all configured sources.
        """
        logger.info("🚀 Starting comprehensive impact content harvesting")
        start_time = time.time()

        try:
            # Initialize database connection
            async with database.get_async_session() as db:
                # Load existing URLs to avoid duplicates
                await self._load_existing_urls(db)

                # Process each source type
                tasks = []

                # RSS Feeds
                if self.config.rss_feeds:
                    tasks.append(self._harvest_rss_feeds(db))

                # News API
                if self.config.news_api_key:
                    tasks.append(self._harvest_news_api(db))

                # Web scraping
                if self.config.scrape_urls:
                    tasks.append(self._harvest_web_scraping(db))

                # Process all sources concurrently
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)

                # Final statistics
                execution_time = time.time() - start_time
                self.stats['execution_time_seconds'] = round(execution_time, 2)

                logger.info("✅ Harvesting completed in %.2f seconds", execution_time)
                logger.info("📊 Statistics: %s", self.stats)

                # Send completion notification
                if self.config.notify_on_completion:
                    await self._send_completion_notification()

                return self.stats

        except Exception as e:
            logger.error("❌ Critical harvesting error: %s", e)
            self.stats['errors'] += 1

            if self.config.notify_on_errors:
                await self._send_error_notification(str(e))

            raise

    async def _load_existing_urls(self, db: AsyncSession):
        """Load existing URLs to avoid duplicates."""
        stmt = select(models.ImpactThread.content).where(
            models.ImpactThread.content.like('http%')
        )
        result = await db.execute(stmt)
        self.harvested_urls = {row[0] for row in result.all()}
        logger.info("📚 Loaded %s existing URLs", len(self.harvested_urls))

    async def _harvest_rss_feeds(self, db: AsyncSession):
        """Harvest content from RSS feeds."""
        logger.info("📡 Processing %s RSS feeds", len(self.config.rss_feeds))

        for feed_url in self.config.rss_feeds:
            if not feed_url.strip():
                continue

            try:
                self.stats['sources_processed'] += 1
                logger.info("🔍 Fetching RSS: %s", feed_url)

                # Fetch RSS feed
                async with self.session.get(feed_url) as response:
                    if response.status != 200:
                        logger.warning("RSS feed returned %s: {feed_url}", response.status)
                        continue

                    feed_content = await response.text()

                # Parse feed
                feed = feedparser.parse(feed_content)

                # Process entries in batches
                entries = feed.entries[:50]  # Limit to recent entries
                await self._process_content_batch(db, entries, ContentType.RSS, feed_url)

                # Rate limiting
                await asyncio.sleep(self.config.request_delay)

            except Exception as e:
                logger.error("❌ RSS feed error %s: {e}", feed_url)
                self.stats['errors'] += 1

    async def _harvest_news_api(self, db: AsyncSession):
        """Harvest content from News API."""
        if not self.config.news_api_key:
            return

        logger.info("📰 Processing News API")

        try:
            # Build query from keywords
            query = ' OR '.join(self.config.keywords[:5])  # Limit query length

            # News API parameters
            params = {
                'q': query,
                'apiKey': self.config.news_api_key,
                'sortBy': 'publishedAt',
                'pageSize': 50,
                'language': 'en'
            }

            url = "https://newsapi.org/v2/everything"

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    logger.error("News API returned %s", response.status)
                    return

                data = await response.json()
                articles = data.get('articles', [])

                # Convert to entry format
                entries = []
                for article in articles:
                    entries.append({
                        'title': article.get('title', ''),
                        'summary': article.get('description', ''),
                        'link': article.get('url', ''),
                        'published': article.get('publishedAt', ''),
                        'source': article.get('source', {}).get('name', 'News API')
                    })

                await self._process_content_batch(db, entries, ContentType.NEWS_API, 'News API')
                self.stats['sources_processed'] += 1

        except Exception as e:
            logger.error("❌ News API error: %s", e)
            self.stats['errors'] += 1

    async def _harvest_web_scraping(self, db: AsyncSession):
        """Harvest content from web scraping."""
        logger.info("🕷️ Processing %s scraping URLs", len(self.config.scrape_urls))

        for url in self.config.scrape_urls:
            if not url.strip():
                continue

            try:
                self.stats['sources_processed'] += 1
                logger.info("🔍 Scraping: %s", url)

                async with self.session.get(url) as response:
                    if response.status != 200:
                        logger.warning("Scraping returned %s: {url}", response.status)
                        continue

                    html_content = await response.text()

                # Parse HTML
                soup = BeautifulSoup(html_content, 'html.parser')

                # Extract articles (customize for specific sites)
                articles = await self._extract_articles_from_html(soup, url)

                if articles:
                    await self._process_content_batch(db, articles, ContentType.WEB_SCRAPE, url)

                # Rate limiting
                await asyncio.sleep(self.config.request_delay)

            except Exception as e:
                logger.error("❌ Web scraping error %s: {e}", url)
                self.stats['errors'] += 1

    async def _extract_articles_from_html(self, soup: BeautifulSoup, base_url: str) -> List[Dict]:
        """Extract articles from HTML content."""
        articles = []

        # Common article selectors (customize for specific sites)
        selectors = [
            'article',
            '.article',
            '.post',
            '[data-testid="article"]',
            '.news-item'
        ]

        for selector in selectors:
            elements = soup.select(selector)

            for element in elements[:10]:  # Limit to prevent spam
                title_el = element.find(['h1', 'h2', 'h3', '.title', '.headline'])
                content_el = element.find(['.content', '.body', 'p'])
                link_el = element.find('a')

                if title_el and content_el:
                    title = title_el.get_text(strip=True)
                    content = content_el.get_text(strip=True)
                    link = urljoin(base_url, link_el.get('href', '')) if link_el else base_url

                    if title and content and len(title) > 10:
                        articles.append({
                            'title': title,
                            'summary': content[:500],  # Truncate
                            'link': link,
                            'published': datetime.utcnow().isoformat(),
                            'source': urlparse(base_url).netloc
                        })

            if articles:  # If found articles with this selector, stop
                break

        return articles

    async def _process_content_batch(
        self,
        db: AsyncSession,
        entries: List[Dict],
        content_type: ContentType,
        source: str
    ):
        """Process a batch of content entries."""
        for entry in entries:
            try:
                await self._process_single_entry(db, entry, content_type, source)
                self.stats['total_processed'] += 1

                # Batch commit every 10 items
                if self.stats['total_processed'] % 10 == 0:
                    await db.commit()

            except Exception as e:
                logger.error("❌ Error processing entry: %s", e)
                self.stats['errors'] += 1
                continue

        # Final commit for batch
        await db.commit()

    async def _process_single_entry(
        self,
        db: AsyncSession,
        entry: Dict,
        content_type: ContentType,
        source: str
    ):
        """Process a single content entry."""
        # Extract basic information
        title = entry.get('title', '')
        summary = entry.get('summary', '') or entry.get('description', '')
        link = entry.get('link', '')

        # Skip if missing essential data
        if not title or not link:
            return

        # Check for duplicates
        if link in self.harvested_urls:
            self.stats['duplicates_skipped'] += 1
            return

        # Check if already exists in database
        stmt = select(models.ImpactThread).where(models.ImpactThread.content == link)
        result = await db.execute(stmt)
        if result.scalars().first():
            self.stats['duplicates_skipped'] += 1
            self.harvested_urls.add(link)
            return

        # AI-powered content analysis
        analysis = await self.analyzer.analyze_content(title, summary, link)

        # Quality filtering
        if analysis['relevance_score'] < self.config.min_relevance_score:
            self.stats['low_quality_filtered'] += 1
            return

        if analysis['word_count'] < self.config.min_word_count:
            self.stats['low_quality_filtered'] += 1
            return

        # Create enhanced meta_data
        meta_data = {
            'title': title,
            'summary': summary,
            'source': source,
            'content_type': content_type.value,
            'published': entry.get('published', ''),
            'harvested_at': datetime.utcnow().isoformat(),
            'analysis': analysis,
            'quality_grade': self._get_quality_grade(analysis['quality_score']),
            'categories': analysis['categories'],
            'keywords': analysis['keywords_found']
        }

        # Create ImpactThread
        impact_thread = models.ImpactThread(
            content=link,
            meta_data=meta_data,
            created_at=datetime.utcnow(),
            is_active=True
        )

        db.add(impact_thread)
        self.stats['total_added'] += 1
        self.harvested_urls.add(link)

        logger.info("✅ Added: %s... (Score: {analysis['relevance_score']:.1f})", title[:50])

    def _get_quality_grade(self, score: float) -> str:
        """Convert quality score to grade."""
        if score >= 9:
            return QualityScore.EXCELLENT.value
        elif score >= 7:
            return QualityScore.GOOD.value
        elif score >= 5:
            return QualityScore.FAIR.value
        else:
            return QualityScore.POOR.value

    async def _send_completion_notification(self):
        """Send harvesting completion notification."""
        try:
            await send_email(
                to=self.config.admin_emails,
                template=EmailTemplate.ADMIN_NOTIFICATION,
                subject="Impact Harvester - Completion Report",
                harvester_stats=self.stats,
                completion_time=datetime.utcnow().isoformat()
            )
        except Exception as e:
            logger.error("Failed to send completion notification: %s", e)

    async def _send_error_notification(self, error_message: str):
        """Send error notification."""
        try:
            await send_email(
                to=self.config.admin_emails,
                template=EmailTemplate.ADMIN_NOTIFICATION,
                subject="Impact Harvester - Error Alert",
                error_message=error_message,
                harvester_stats=self.stats
            )
        except Exception as e:
            logger.error("Failed to send error notification: %s", e)

# ================================
# 🎯 Main Harvesting Function
# ================================

async def run_harvester_async() -> Dict[str, Any]:
    """
    🚀 Main async harvesting function with comprehensive configuration.
    """
    # Load configuration from environment
    config = HarvestConfig(
        rss_feeds=[url.strip() for url in os.getenv("RSS_FEEDS", "").split(',') if url.strip()],
        news_api_key=os.getenv("NEWS_API_KEY"),
        social_apis={
            'twitter': os.getenv("TWITTER_API_KEY", ""),
            'reddit': os.getenv("REDDIT_API_KEY", "")
        },
        scrape_urls=[url.strip() for url in os.getenv("SCRAPE_URLS", "").split(',') if url.strip()],
        keywords=[kw.strip() for kw in os.getenv("RELEVANCE_KEYWORDS", "sustainability,humanitarian,education,health").split(',')],
        negative_keywords=[kw.strip() for kw in os.getenv("NEGATIVE_KEYWORDS", "spam,clickbait,advertisement").split(',')],
        min_relevance_score=float(os.getenv("MIN_RELEVANCE_SCORE", "3.0")),
        languages=os.getenv("LANGUAGES", "en").split(','),
        min_word_count=int(os.getenv("MIN_WORD_COUNT", "50")),
        max_age_days=int(os.getenv("MAX_AGE_DAYS", "7")),
        enable_ai_filtering=os.getenv("ENABLE_AI_FILTERING", "true").lower() == "true",
        batch_size=int(os.getenv("BATCH_SIZE", "10")),
        concurrent_requests=int(os.getenv("CONCURRENT_REQUESTS", "5")),
        request_delay=float(os.getenv("REQUEST_DELAY", "1.0")),
        timeout_seconds=int(os.getenv("TIMEOUT_SECONDS", "30")),
        notify_on_errors=os.getenv("NOTIFY_ON_ERRORS", "true").lower() == "true",
        notify_on_completion=os.getenv("NOTIFY_ON_COMPLETION", "true").lower() == "true",
        admin_emails=[email.strip() for email in os.getenv("ADMIN_EMAILS", "").split(',') if email.strip()]
    )

    # Validate configuration
    if not any([config.rss_feeds, config.news_api_key, config.scrape_urls]):
        logger.warning("⚠️ No data sources configured. Please set RSS_FEEDS, NEWS_API_KEY, or SCRAPE_URLS")
        return {"error": "No data sources configured"}

    # Run harvester
    async with ImpactHarvester(config) as harvester:
        return await harvester.harvest_all_sources()

# ================================
# 🔄 Sync Wrapper for Compatibility
# ================================

def run_harvester():
    """
    🔄 Sync wrapper for backward compatibility.
    """
    logger.info("🔄 Running harvester in sync mode (will be converted to async)")

    try:
        # Run async harvester
        result = asyncio.run(run_harvester_async())
        logger.info("✅ Harvesting completed successfully: %s", result)
        return result
    except Exception as e:
        logger.error("❌ Harvesting failed: %s", e)
        return {"error": str(e)}

# ================================
# 📊 Analytics and Monitoring
# ================================

async def get_harvester_analytics() -> Dict[str, Any]:
    """Get analytics about harvested content."""
    async with database.get_async_session() as db:
        # Total threads
        total_stmt = select(func.count(models.ImpactThread.id))
        total_result = await db.execute(total_stmt)
        total_threads = total_result.scalar() or 0

        # Recent threads (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(hours=24)
        recent_stmt = select(func.count(models.ImpactThread.id)).where(
            models.ImpactThread.created_at >= yesterday
        )
        recent_result = await db.execute(recent_stmt)
        recent_threads = recent_result.scalar() or 0

        # Quality distribution
        quality_stmt = select(
            models.ImpactThread.meta_data
        ).where(
            models.ImpactThread.meta_data.isnot(None)
        )
        quality_result = await db.execute(quality_stmt)

        quality_distribution = {'excellent': 0, 'good': 0, 'fair': 0, 'poor': 0}
        source_distribution = {}

        for row in quality_result.all():
            meta_data = row[0] or {}
            quality = meta_data.get('quality_grade', 'unknown')
            if quality in quality_distribution:
                quality_distribution[quality] += 1

            source = meta_data.get('source', 'unknown')
            source_distribution[source] = source_distribution.get(source, 0) + 1

        return {
            'total_threads': total_threads,
            'recent_threads_24h': recent_threads,
            'quality_distribution': quality_distribution,
            'source_distribution': source_distribution,
            'last_updated': datetime.utcnow().isoformat()
        }

# ================================
# 🧪 Testing and Development
# ================================

async def test_harvester_sources():
    """Test harvester sources for connectivity and data quality."""
    config = HarvestConfig(
        rss_feeds=[url.strip() for url in os.getenv("RSS_FEEDS", "").split(',') if url.strip()],
        news_api_key=os.getenv("NEWS_API_KEY"),
        social_apis={},
        scrape_urls=[],
        keywords=['test'],
        negative_keywords=[],
        min_relevance_score=0.0,
        languages=['en'],
        min_word_count=1,
        max_age_days=30,
        enable_ai_filtering=False,
        batch_size=5,
        concurrent_requests=3,
        request_delay=0.5,
        timeout_seconds=10,
        notify_on_errors=False,
        notify_on_completion=False,
        admin_emails=[]
    )

    test_results = []

    async with aiohttp.ClientSession() as session:
        # Test RSS feeds
        for feed_url in config.rss_feeds:
            try:
                async with session.get(feed_url) as response:
                    if response.status == 200:
                        feed_content = await response.text()
                        feed = feedparser.parse(feed_content)
                        test_results.append({
                            'source': feed_url,
                            'type': 'RSS',
                            'status': 'OK',
                            'entries_found': len(feed.entries)
                        })
                    else:
                        test_results.append({
                            'source': feed_url,
                            'type': 'RSS',
                            'status': f'ERROR: {response.status}',
                            'entries_found': 0
                        })
            except Exception as e:
                test_results.append({
                    'source': feed_url,
                    'type': 'RSS',
                    'status': f'ERROR: {str(e)}',
                    'entries_found': 0
                })

    return test_results

if __name__ == "__main__":
    # Run harvester
    run_harvester()
