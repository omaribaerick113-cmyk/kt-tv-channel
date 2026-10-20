# KT TV — Kenyan Trapper: shop, events & shows website

A React + Vite website for GitHub and Vercel. It is a **shop-first** site: products appear right under a compact hero on the home page, customers add items to a cart and send their order to KT TV on WhatsApp, and events and shows are managed in Decap CMS.

> **Two guides:** this file explains the website. **[README-CMS.md](README-CMS.md)** explains the CMS (`/admin`), local editing and the Decap Turbo login step by step.

## 1. What is included

- **Home** (in this order): compact hero → *Shop the latest KT TV collection* (Gents / Ladies / Unisex shortcuts + big-photo product cards) → *Trending now* → *Upcoming events & shows* → *Watch KT TV* → how ordering works → follow KT TV.
- **Shop** with search (name, description, category, type, tags), Gents/Ladies/Unisex collections, filters (category, size, colour, price range, in-stock only), sorting (featured, newest, price low→high / high→low) and a *Reset filters* button. Filters live in the web address, so a filtered page can be shared.
- **Product pages** (`/shop/<slug>`): photo gallery, size and colour pickers (unavailable combinations are crossed out), quantity, live total, delivery and returns text, related products.
- **Cart** (`/cart`): *Add to Cart* shows "Product was successfully added to your cart!" with **Continue** / **View Cart**. The cart is remembered in the visitor's browser, merges identical items, flags items that became unavailable, and **ORDER CART VIA WHATSAPP** sends every item in one message. Each product page also has its own **ORDER VIA WHATSAPP** button for just that product.
- **Sale prices, NEW labels, numeric stock** per size/colour (customers cannot order more than you have).
- **Events** (`/events`, `/events/<slug>`) with automatic upcoming/past split, optional ticket price, **Get Tickets** only when a real ticket link exists, and an optional WhatsApp ticket *enquiry*. **Shows** (`/videos`) with **Watch Now** only when a valid link exists, otherwise *Coming soon*.
- Site-wide search (magnifier in the header), Social, Music, About, Contact, Privacy and Terms pages, and a 404 page.
- **Demo content** (clearly labelled SAMPLE/DEMO): 8 products, 4 events, 4 shows with generated sample pictures in `public/images/uploads/demo/`.

## 2. Run it on your computer

1. Install **Node.js LTS** from https://nodejs.org and restart VS Code.
2. Open the project folder in VS Code, press **Ctrl + `** to open the terminal.
3. Run:

   ```
   npm install
   npm run dev
   ```

4. Open the address Vite prints (usually http://localhost:5173).
5. Check a production build with `npm run build`, then `npm run preview`.
6. Run the automated checks with `npm test` (message, cart, variant, filter and event logic) and `npm run check:cms` (CMS config vs content files).

## 3. The WhatsApp number (one place only)

The number lives in **`content/settings/general.yml`** → `whatsapp_number` (or in the CMS under **Site settings → General settings → WhatsApp number**). Use international digits only: country code + number, no `+`, spaces or dashes, e.g. `2547XXXXXXXX`. Every WhatsApp button and link on the site reads this one value. If it is empty or invalid, the buttons are disabled and a notice explains why — no broken link is ever opened.

A WhatsApp link can only pre-fill **text**, not attach a picture. Orders therefore include a **link to the product photo**; customers can also attach a picture themselves.

## 4. Content model (what the CMS edits)

| Content | Folder | Notable fields |
|---|---|---|
| Products | `content/products/` | `name`, `slug` (also the product ID/URL), `sku`, `category`, `product_type`, `collection` (Gents/Ladies/Unisex), `price`, `sale_price`, `new`, `featured`, `published`, `demo`, `images` (`image`, `alt`), `sizes`, `colours`, `variants` (`size`, `colour`, `stock` as a number), `stock` |
| Events | `content/events/` | `title`, `slug`, `date`, `start_time`, `venue`, `location`, `description`, `poster`, `ticket_price`, `ticket_url`, `ticket_categories`, `status`, `published`, `demo` |
| Shows | `content/videos/` | `title`, `slug`, `description`, `watch_url`, `youtube_url`, `thumbnail`, `published`, `demo` |
| Settings | `content/settings/` | `general.yml` (name, email, WhatsApp number, hero text, section titles, delivery/returns), `social.yml` |

Stock numbers: `0` = sold out, `1`–`5` = *Limited stock*, more = *In stock*. Old-style words (`in_stock`, `limited`, `out_of_stock`) still work.

## 5. Before launch — replace the demo content

1. In the CMS (or by deleting files in `content/`), **delete or unpublish** the demo products, events and shows (they all say SAMPLE/DEMO), or edit them into real ones and turn **Show sample badge** off.
2. Add real products with real prices, photos (portrait 4:5 works best), sizes, colours and stock.
3. Set the real WhatsApp number, email, hero text and delivery/returns wording (the default delivery and returns text makes no promises).
4. Delete the demo pictures in `public/images/uploads/demo/` once nothing uses them.
5. Review the Privacy Policy and Terms (starter text, not legal advice).

## 6. Upload to GitHub and deploy on Vercel

```
git init
git add .
git commit -m "KT TV website"
git branch -M main
git remote add origin https://github.com/omaribaerick113-cmyk/kt-tv.git
git push -u origin main
```

Then in Vercel choose **Add New → Project**, import the repository, keep the detected **Vite** settings (build `npm run build`, output `dist`) and deploy. `vercel.json` makes page addresses like `/shop/<slug>` and `/admin` work. Finish the CMS login by following **README-CMS.md**.

## 7. Known limits

- Orders and ticket enquiries are **WhatsApp messages**, not confirmed orders. There is no payment processing, order database or stock reservation; stock numbers are updated by you in the CMS.
- The cart is stored in the visitor's own browser (it does not follow them to another device).
- The site is built into static files, so CMS changes appear after Vercel rebuilds (about a minute).
- The Contact form opens the visitor's email app; it does not send to a server.
- Page titles and descriptions are set in the browser as pages open; they are not pre-rendered for search engines.
- Google Fonts need an internet connection.
