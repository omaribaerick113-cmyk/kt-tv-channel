# KT TV — Editing your website with Decap CMS (beginner guide, Windows + VS Code)

The CMS is the `/admin` page of your website. You log in, change a product, event or show, press **Publish**, and the change is saved into your project on GitHub. Vercel then rebuilds the website (about one minute).

**Important facts about THIS project (read once):**

- The website is built with **Vite**, so the admin files live in the **`public/admin/`** folder (Vite copies `public/` to the root of the live site, which is why they appear at `/admin/`). They are NOT in a root-level `admin/` folder.
- Because the project uses Vite, `npm run dev` starts **Vite** (not `serve`). The local website address is usually **http://localhost:5173** (Vite prints the exact address in the terminal).
- Pictures you upload go to `public/images/uploads/` and appear on the site as `/images/uploads/...`.
- **Nothing here has been tested against a live Turbo account.** The Turbo login, the live `/admin` page and the local CMS server could not be run while this was prepared. Follow the steps and use the troubleshooting list (section I) if something does not work.

---

## A. Install Node.js

1. Go to **https://nodejs.org** and download the **LTS** version for Windows.
2. Run the installer and keep pressing **Next** (leave every option as it is).
3. **Close VS Code completely and open it again** (so it can see Node).

## B. Open the project and the terminal

1. In VS Code choose **File → Open Folder** and pick your `kt-tv-complete` project folder.
2. Press **Ctrl + `** (the key above Tab) to open the terminal at the bottom.
3. Check Node works: type `node -v` and press Enter. You should see a version number such as `v22.x.x`.

## C. Install the tools (one time)

In the terminal run:

```
npm install
```

Wait until it finishes (it creates a `node_modules` folder; never upload that folder).

## D. LOCAL EDITING (edit on your computer, no login needed)

1. Open `public/admin/config.yml`. On the **very first line** remove the `#` so it reads:
   ```
   local_backend: true
   ```
   Save the file.
2. **Terminal 1** — start the local CMS helper:
   ```
   npm run cms
   ```
   Leave it running.
3. Open a second terminal (the **+** button in the terminal panel) — **Terminal 2** — start the website:
   ```
   npm run dev
   ```
4. In your browser open **http://localhost:5173/admin/** (use the address Vite printed if it is different) and click **Login**.
5. Edit content and press **Save/Publish**. The files change inside your project's `content/` folder and pictures go into `public/images/uploads/`. The website updates in the browser straight away.
6. To stop, click in each terminal and press **Ctrl + C**.

## E. BEFORE you push: switch local mode off

Put the `#` back so the first line of `public/admin/config.yml` is again:

```
# local_backend: true
```

If you forget, the live `/admin` page will try to talk to your computer and will not work.

## F. PUBLISH your changes to the live website

```
git add .
git commit -m "Update content"
git push origin main
```

Wait about **one minute** for Vercel to rebuild, then refresh the website. (Content edited through the live `/admin` page is saved to GitHub automatically; Vercel rebuilds by itself.)

> First time only: connect the project to GitHub with
> `git init`, `git add .`, `git commit -m "First version"`, `git branch -M main`,
> `git remote add origin https://github.com/omaribaerick113-cmyk/kt-tv.git`, `git push -u origin main`.

## G. DECAP TURBO SETUP (so you can log in on the live website)

Turbo is the hosted login service used by Option 1 in `config.yml`.

1. **Sign up** at **https://turbo.decapcms.org/signup** (email + password).
2. **Create an organization** (the sign-up flow asks for one).
3. **Connect GitHub:** in the organization menu open **Git connection** and install the **Turbo GitHub App** on your GitHub account. Allow it to see the repository `omaribaerick113-cmyk/kt-tv` (all repositories or just that one). Site creation is refused until this is done.
4. **Create a site** (menu **Sites**; only organization owners can). Fill the form like this:
   - **Git provider:** GitHub
   - **Repo:** `omaribaerick113-cmyk/kt-tv`
   - **Branch:** `main`
   - **Config path:** `public/admin/config.yml`  ← **not** the default `admin/config.yml`, because this project is built with Vite and the file sits inside `public/`
   - **Admin interface URL(s):** your live admin address, typed exactly, for example `https://YOUR-SITE.vercel.app/admin/` (same `https://`, same host, same path as the page you open in the browser). Add your custom domain too if you have one.
5. Open the site's **Overview** tab and **copy the Site ID**.
6. Open `public/admin/config.yml` and replace the placeholder:
   ```yaml
   backend:
     name: turbo-github
     turbo_site_id: PASTE-YOUR-TURBO-SITE-ID   # ← put your real Site ID here
     branch: main
   ```
   Never type a made-up ID. Until you paste the real one, Turbo login cannot work.
7. In the Turbo dashboard double-check **Config path** is `public/admin/config.yml`.
8. **Invite yourself to the site.** Being a member of the organization is **not** enough. Open the organization **Members** page (or the site's **Members** tab), add your own email, and give yourself access to this site (Full access).
9. Save, then push (section F). When Vercel has finished, open **https://YOUR-SITE.vercel.app/admin/** and click **Login with Turbo**.

## H. Things to know before you rely on Turbo

- Turbo is a **hosted service run by a third party**. When this guide was written, the Decap documentation described a **Free plan with one site and one seat** and paid plans for more. Plans and limits can change, and I could not confirm whether it is still labelled beta — **check the current plans at https://decapcms.org/turbo/ before you depend on it.**
- If you prefer not to use Turbo, `config.yml` contains **Option 2 (plain GitHub login)**. It needs an **OAuth proxy**, for example a small separate project deployed on Vercel, plus a `base_url:` line in the backend block pointing at it. That setup is more involved and is not included here.
- Your pictures and text live in your own GitHub repository either way.

## I. Troubleshooting

| What you see | What to do |
|---|---|
| `npx is not recognized` / `npm is not recognized` | Node.js is not installed or VS Code was not restarted. Install Node LTS (section A), close **all** VS Code windows, reopen, and try `node -v` again. |
| PowerShell says *running scripts is disabled* | In the VS Code terminal dropdown choose **Command Prompt**, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once in PowerShell and press Y. |
| `/admin` page is blank | Press **F12 → Console** and read the red message. Common causes: no internet (the CMS script loads from jsDelivr), an ad-blocker, a typo in `config.yml` (run `npm run check:cms` to find it), or `public/admin/` was not pushed. |
| Local mode: "Failed to load config" or cannot reach the server | Terminal 1 must be running `npm run cms`, and the first line of `config.yml` must have **no** `#`. |
| Login popup closes and nothing happens ("origin not allowed") | The **Admin interface URL** in the Turbo dashboard must match exactly where you opened the page (https, host, `/admin/`). Fix it in the dashboard. |
| "Unknown site_id" | The `turbo_site_id` in `config.yml` is wrong. Copy it again from the site's **Overview** tab. |
| Login works but you see no content / access error | You are not a member of the **site**. Add yourself on the site's **Members** tab (step 8). |
| "Session expired. Please log in again." | Just log in again. |
| **"requested repo does not match"** | The repository is wrong in the **Turbo dashboard**. Fix it there — not in `config.yml` (Turbo ignores `repo` in the file). |
| `git push` is rejected (*failed to push some refs*) | Someone (the CMS) saved changes on GitHub first. Run `git pull origin main --rebase` then `git push origin main`. |
| Pictures do not show on the website | The path in `config.yml` must stay `public_folder: /images/uploads`, files must be inside `public/images/uploads/`, and the change must be pushed and rebuilt. |
| I published but the site did not change | Wait about a minute for Vercel; check the Vercel dashboard for a failed build. |
| The live admin page tries to use my computer | You pushed with `local_backend: true` on. Put the `#` back (section E) and push again. |

## What you can safely change in `config.yml`

- Labels and hints (the text you read in the CMS).
- Never rename a **`name:`** value: the website reads content by those exact names. After any edit run:

  ```
  npm run check:cms
  ```

  It tells you if the config and your real content files disagree. (It checks the files only — it cannot test the Turbo login.)

## Where things are

| In the CMS | File(s) |
|---|---|
| Products | `content/products/*.md` |
| Events & Shows | `content/events/*.md` |
| Shows & Videos | `content/videos/*.md` |
| Pages (About, Privacy, Terms) | `content/pages/*.md` |
| Site settings → WhatsApp number, hero text, delivery & returns | `content/settings/general.yml` |
| Site settings → Social media links | `content/settings/social.yml` |
| Uploaded pictures | `public/images/uploads/` |
