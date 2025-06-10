Энэ бол [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) ашиглан эхлүүлсэн [Next.js](https://nextjs.org) төсөл юм.

## Эхлэх заавар

Эхлээд хөгжүүлэлтийн серверийг ажиллуулна:

```bash
npm run dev
# эсвэл
yarn dev
# эсвэл
pnpm dev
# эсвэл
bun dev
```

[http://localhost:3000](http://localhost:3000) -р хандан үр дүнг үзээрэй.

`app/page.tsx` файлыг засварлах замаар хуудсыг өөрчлөх боломжтой. Файлыг хадгалахад хуудас автоматаар шинэчлэгдэнэ.

Энэхүү төсөл нь [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)-ыг ашиглан [Geist](https://vercel.com/font) фонтыг автоматаар сайжруулж, ачаалдаг.

## Серверийн тохиргоо

1. `server/.env.example` файлыг `server/.env` болгон хуулж, `MONGODB_URI`-д өгөгдлийн сангийн холбоосоо бичнэ.
2. API серверийг `npm run server` (эсвэл `npm run server-dev` автоматаар дахин ачаалуулах) командаар эхлүүлнэ.

Хуулсан файлууд `UPLOAD_DIR`-ээр заасан санд хадгалагдана.

## Бүтээгдэхүүний удирдлага

Админууд `/dashboard/products` хуудсаар дамжуулан дэлгүүрийн барааг удирдах боломжтой. Энэ хуудсаар зураг оруулж, үнэ засварлах боломжтой.

## Дэлгэрэнгүй

Next.js-ийн талаар илүү ихийг дараах эх сурвалжаас уншаарай:

- [Next.js-ийн баримт](https://nextjs.org/docs) – Next.js-ийн боломж, API-тай танилцаарай.
- [Next.js суралцах](https://nextjs.org/learn) – интерактив Next.js хичээл.

[Next.js-ийн GitHub репозитори](https://github.com/vercel/next.js)-г сонирхоорой – таны санал хүсэлт, хувь нэмрийг хүлээн авна!

## Vercel дээр байрлуулах

Next.js апп-аа байрлуулах хамгийн хялбар арга бол Next.js-ийн бүтээгчдийн санал болгодог [Vercel Платформ](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)-ыг ашиглах юм.

Дэлгэрэнгүйг манай [Next.js байршуулалтын баримтаас](https://nextjs.org/docs/app/building-your-application/deploying) үзнэ үү.
