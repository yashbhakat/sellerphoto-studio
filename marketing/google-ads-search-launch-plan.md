# SellerPhoto Studio — lean India search campaign

Status: prepared, not launched. A paid campaign must not go live until the owner confirms the daily budget and Google Ads shows the final billing amount.

## Commercial guardrails

- Product price: ₹499 one time.
- Primary conversion: verified `purchase` event after server-side Razorpay capture.
- Secondary diagnostic conversion: `begin_checkout`.
- Initial target cost per purchase: ₹150 or less.
- Hard review threshold: pause the campaign if ₹750 is spent without a verified purchase.
- Keyword review threshold: pause a keyword after 25 qualified clicks without a checkout start.
- Scale rule: raise the average daily budget by no more than 20% after three consecutive days at or below ₹175 cost per purchase.
- Do not promise a ranking, profit, marketplace approval, or guaranteed sales in ad copy.

## Campaign settings

| Setting | Launch value |
| --- | --- |
| Campaign | `SPS | Search | India | Purchase | v1` |
| Objective | Sales |
| Network | Google Search only; Display and Search Partners off initially |
| Location | India; presence in the location, not interest in the location |
| Languages | English and Hindi |
| Schedule | 07:00–23:59 IST daily for the first test |
| Average daily budget | ₹250 |
| Maximum 14-day test envelope | ₹3,500, subject to the platform's billing controls |
| Initial bidding | Maximize Clicks with a ₹8 maximum CPC limit; move to Maximize Conversions only after reliable purchase data |
| Attribution goal | GA4 verified purchase imported as the primary Google Ads conversion |
| Audience mode | Observation only; do not narrow the search campaign to an audience |

This is intentionally a small, high-intent search test. Do not start with Performance Max, Display, broad match, app inventory, remarketing, or automated expansion because the product is new and the conversion dataset is small.

## Ad groups and launch keywords

Use only exact and phrase match in the first test.

### 1. Product Photo Editor

Landing page:

`https://sellerphotostudio.in/features/product-photo-video-studio/?utm_source=google&utm_medium=cpc&utm_campaign=search_india_purchase&utm_content=photo_editor&utm_term={keyword}`

Keywords:

- `[product photo editor]`
- `"product photo editor online"`
- `[ecommerce photo editor]`
- `[ecommerce image editor]`
- `"ecommerce photo editing software"`
- `"ecommerce photo editing app"`

### 2. Marketplace Image Resizer

Landing page:

`https://sellerphotostudio.in/features/product-photo-video-studio/?utm_source=google&utm_medium=cpc&utm_campaign=search_india_purchase&utm_content=marketplace_images&utm_term={keyword}`

Keywords:

- `[amazon image resizer]`
- `[flipkart image resizer]`
- `"amazon product image editor"`
- `"flipkart product image editor"`
- `"meesho catalogue photo editor"`

### 3. Product Video Maker

Landing page:

`https://sellerphotostudio.in/features/product-photo-video-studio/?utm_source=google&utm_medium=cpc&utm_campaign=search_india_purchase&utm_content=video_maker&utm_term={keyword}`

Keywords:

- `[product video maker]`
- `"product video maker online"`
- `"product video maker for ecommerce"`
- `"ecommerce product video maker"`

The Amazon, Flipkart and Meesho profit-calculator queries are reserved for organic traffic at launch. Their dominant intent is a free calculation, so paying for those clicks before the site has purchase-conversion evidence would likely waste the small budget.

## Campaign-level negative keywords

Add as phrase negatives unless a later search-term review proves a commercial exception:

- free
- ai free
- background remover
- background removal
- job
- jobs
- hiring
- salary
- vacancy
- freelance
- agency
- service
- services
- near me
- course
- tutorial
- training
- cracked
- crack
- mod apk
- apk
- torrent
- aws
- passport
- wedding
- resume
- photo editing job

`background remover` is negative because SellerPhoto Studio does not currently remove backgrounds. High traffic is not useful when the product cannot satisfy the query.

## Responsive search ad assets

Use one strong responsive search ad per ad group initially so impressions are not divided across too many low-volume ads.

Headlines (all intended to fit the 30-character limit):

1. SellerPhoto Studio Pro
2. Product Photos For Sellers
3. Edit Up To 50 Photos
4. Make Product Videos
5. Built For Indian Sellers
6. ₹499 One-Time Seller Tool
7. No Monthly Subscription
8. Private On-Device Editing
9. Works Offline After Download
10. Try 3 Photos Before Buying
11. Amazon, Flipkart & Meesho
12. Forecast Revenue & Profit
13. Create Listing Media
14. 12-Scene Product Videos
15. Secure Razorpay Checkout

Descriptions (all intended to fit the 90-character limit):

1. Edit listing photos, make product videos and forecast SKU profit. ₹499 one time.
2. Use seller presets, toggle every layer and export privately. Try 3 photos free.
3. Built for marketplaces, quick commerce, D2C stores and social sellers in India.
4. Download Pro after verified Razorpay payment. No subscription or per-image fee.

Suggested paths:

- Path 1: `seller-tools`
- Path 2: `photo-video`

## Assets

Sitelinks:

- Amazon Profit Tool → `/tools/amazon-seller-profit-calculator-india/`
- Flipkart Profit Tool → `/tools/flipkart-seller-profit-calculator-india/`
- Meesho Profit Tool → `/tools/meesho-profit-calculator/`
- Product Image Guide → `/resources/product-photo-size-guide/`

Callouts:

- ₹499 One-Time
- No Subscription
- Works Offline
- On-Device Processing
- Up To 50 Photos
- 12-Scene Videos

Structured snippet header `Types`:

- Photo Editor
- Product Video Maker
- Profit Forecast
- Seller Calculators

## Measurement checklist before launch

1. Confirm GA4 property `G-SKFRQSGWJY` is receiving `begin_checkout` and `purchase` in DebugView or Realtime.
2. Mark `purchase` as a GA4 key event.
3. Link the correct Google Ads and GA4 properties.
4. Import `purchase` into Google Ads as the primary purchase conversion with value and INR currency.
5. Keep `begin_checkout` secondary so bidding does not optimise for clicks that never pay.
6. Run one live ₹499 end-to-end test only if the owner explicitly approves a real transaction, then verify Razorpay capture, GA4 purchase, protected download and Ads attribution.
7. Do not enable remarketing while advertising storage and personalisation remain denied by the site's consent design.

## Optimisation rhythm

- Daily for the first week: inspect spend, search terms, checkout starts, purchases and landing-page errors.
- Add irrelevant search terms as negatives immediately.
- Do not judge by clicks or CTR alone; the decision metric is verified purchase cost.
- After at least 60 qualified clicks, keep only ad groups producing checkout intent.
- After at least 10 purchases, test one variable at a time: landing-page message, keyword set, or bidding—not all three.
- Keep the ₹499 price visible in the ad and landing page so low-intent visitors self-filter before the paid click becomes expensive.

## Organic-to-paid handoff

The new Amazon, Flipkart and Meesho calculator pages should first earn free search impressions. In Google Search Console, compare query impressions, click-through rate and checkout-assisted sessions. Only promote a calculator keyword with ads if organic visitors from that query demonstrate purchase intent.
