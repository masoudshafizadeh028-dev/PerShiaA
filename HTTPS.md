# رفع مشکل HTTPS دامنهٔ PerShiaA

## تشخیص (آخرین بررسی: ۱۷ اکتبر ۲۰۲۶)

خروجی `GET /repos/masoudshafizadeh028-dev/PerShiaA/pages` در GitHub API:

- `status: built` و منبع انتشار `main /` است؛ ساخت سایت موفق است.
- `cname: pershiaa.qd.je` با فایل `CNAME` مخزن مطابقت دارد.
- `https_certificate.state: bad_authz` با توضیح «The ACME authorization is in a bad state. We need to start over.»
- `https_enforced: false` و `html_url: http://pershiaa.qd.je/` است.

در بررسی DNS، `pershiaa.qd.je` به هر چهار IP استاندارد GitHub Pages
(`185.199.108.153` تا `185.199.111.153`) اشاره دارد. در بررسی اولیه، رکورد AAAA متناقض یا
CAA محدودکننده در پاسخ DNS مشاهده نشد؛ وضعیت DNS را هنگام صدور گواهی دوباره بررسی کنید. این شواهد نشان می‌دهد **صدور گواهی نزد
GitHub Pages متوقف شده**؛ تغییر HTML، canonical، JavaScript یا ریدایرکت اجباری
به HTTPS جایگزین صدور گواهی نیست. ممکن است علت اولیهٔ شکست ACME دیگر در DNS
فعلی قابل مشاهده نباشد.

## اقدام لازم در حساب مالک مخزن

1. در `Settings → Pages` مخزن،
   مطمئن شوید منبع انتشار `Deploy from a branch`، شاخهٔ `main` و پوشهٔ `/ (root)` است.
2. در بخش **Custom domain**، دامنهٔ `pershiaa.qd.je` را **Remove** کنید و سپس
   همان دامنه را دوباره وارد کرده و **Save** کنید. این کار طبق راهنمای GitHub پس
   از اصلاح/بررسی DNS، فرایند صدور HTTPS را مجدداً آغاز می‌کند. توجه: هنگام حذف
   دامنه ممکن است GitHub فایل `CNAME` شاخهٔ انتشار را تغییر دهد؛ پس از ثبت دوباره
   دامنه وجود فایل با محتوای دقیق `pershiaa.qd.je` را در `main` بررسی کنید.
   این مرحله ممکن است موقتاً سایت را از دامنهٔ سفارشی خارج کند.
3. برای صدور گواهی تا **یک ساعت** فرصت دهید. وقتی گزینهٔ **Enforce HTTPS** در
   همان صفحه فعال شد، آن را روشن کنید. تا قبل از صدور گواهی، هیچ تغییر سمت
   مرورگر برای انتقال اجباری HTTP به HTTPS اعمال نکنید.
4. وضعیت را با فرمان زیر بررسی کنید (دسترسی خواندن Pages لازم است):

   ```bash
   gh api repos/masoudshafizadeh028-dev/PerShiaA/pages \
     --jq '{cname, status, https_certificate, https_enforced, html_url}'
   ```

   `https_certificate.state` نباید `bad_authz` باشد و `https_enforced` باید
   `true` شود. در یک شبکهٔ معمولی نیز باز شدن `https://pershiaa.qd.je/` بدون
   هشدار گواهی و انتقال `http://pershiaa.qd.je/` به HTTPS را بررسی کنید.

اگر بعد از یک ساعت باز هم صدور گواهی شکست خورد، با سرویس‌دهندهٔ DNS بررسی کنید
که **همهٔ** پاسخ‌های authoritative برای دامنه به GitHub Pages اشاره دارند و
CAA احتمالیِ دامنه یا والد آن `letsencrypt.org` را مجاز می‌داند؛ سپس مراحل
حذف و افزودن مجدد دامنه را تکرار کنید یا با پشتیبانی GitHub تماس بگیرید.

بررسی مستقل `.github/workflows/pages-https.yml` پس از ادغام این PR از بخش Actions
به‌صورت دستی قابل اجراست و هر هفته نیز وضعیت گواهی/اجبار HTTPS را گزارش می‌کند؛
این بررسی **گواهی صادر نمی‌کند** و جایگزین مراحل بالا نیست.

> اتصال GitHub این محیط امکان خواندن تنظیم Pages را دارد، اما درخواست ویرایش
> `PUT /pages` با خطای `403 Resource not accessible by integration` رد شد؛
> بنابراین تغییر تنظیم Pages از داخل این نشست امکان‌پذیر نبود. برای رفع مستقیم،
> مالک باید از رابط GitHub اقدام کند یا اتصال GitHub با مجوز مدیریت Pages را
> فراهم کند. رمز عبور یا توکن را در مخزن/گفتگو قرار ندهید.

[راهنمای رسمی GitHub برای عیب‌یابی HTTPS و دامنهٔ سفارشی](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
