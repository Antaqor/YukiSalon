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
3. Реалтайм фийдийг идэвхжүүлэхийн тулд `npm run live` (эсвэл `npm run live-dev`) ашиглан Socket.IO серверийг эхлүүлнэ.
4. MongoDB холболтыг шалгахын тулд `npm run mongo-test` командыг ажиллуулна.

Дараах орчны хувьсагчуудыг `server/.env` файлд тохируулна:

- `MONGODB_URI` – MongoDB-ийн холбоос
- `PORT` – (сонголттой) серверийн порт
- `UPLOAD_DIR` – файлууд хадгалагдах санд
- `REDIS_URL` – Real-time фийдийн Redis холбоос
- `LIVE_PORT` – Socket.IO серверийн порт
- `QPAY_CLIENT_ID` – QPay-ийн Client ID
- `QPAY_CLIENT_SECRET` – QPay-ийн Client Secret (заавал)
- `QPAY_INVOICE_CODE` – QPay-д бүртгэгдсэн invoice code
- `VAPID_PUBLIC_KEY` – Web-Push олон нийтэд түгээх түлхүүр
- `VAPID_PRIVATE_KEY` – Web-Push нууц түлхүүр
- `VAPID_EMAIL` – Харицах имэйл хаяг

## Real-time feed (Change Streams)

`server/live-mongo.js` файл нь MongoDB-ийн Change Stream ашиглан `posts` коллекци дээрх шинэ нэмэлтүүдийг Socket.IO-оор дамжуулан илгээдэг. `server/.env`-д дараах хувьсагчууд шаардана:

- `MONGODB_URI`
- `LIVE_PORT`

Запуск:

```bash
node server/live-mongo.js
```

Next.js талд `useLiveFeed` хук нь автомат дахин холболттой. Socket тасарсан тохиолдолд 2 секундийн дараа дахин холбогдоно.

M0 Atlas бүлэглэл Change Streams дэмждэггүй тул энэхүү фийд ажиллахгүй. M2 эсвэл M5 түвшин рүү шинэчлэхийг зөвлөж байна.

PM2/Nginx байршуулах зөвлөмж:

- `pm2 start server/index.js`
- `pm2 start server/live-mongo.js`
- Nginx reverse proxy to port `5001` for API and `5002` for Socket.IO

## Бүтээгдэхүүний удирдлага

Админууд `/dashboard/products` хуудсаар дамжуулан дэлгүүрийн барааг удирдах боломжтой. Энэ хуудсаар зураг оруулж, үнэ засварлах боломжтой.
Мөн `/dashboard/books` хуудсаар цахим номын сангийн номнуудыг нэмэх, засварлах, устгах боломжтой.

## Дэлгэрэнгүй

Next.js-ийн талаар илүү ихийг дараах эх сурвалжаас уншаарай:

- [Next.js-ийн баримт](https://nextjs.org/docs) – Next.js-ийн боломж, API-тай танилцаарай.
- [Next.js суралцах](https://nextjs.org/learn) – интерактив Next.js хичээл.

[Next.js-ийн GitHub репозитори](https://github.com/vercel/next.js)-г сонирхоорой – таны санал хүсэлт, хувь нэмрийг хүлээн авна!

## Vercel дээр байрлуулах

Next.js апп-аа байрлуулах хамгийн хялбар арга бол Next.js-ийн бүтээгчдийн санал болгодог [Vercel Платформ](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)-ыг ашиглах юм.

Дэлгэрэнгүйг манай [Next.js байршуулалтын баримтаас](https://nextjs.org/docs/app/building-your-application/deploying) үзнэ үү.

## MP3 татагч

YouTube видеоноос MP3 файл татахын тулд `/tools/mp3` хуудас руу орж холбоосоо
оруулна. Энэ хуудас Node.js серверийн `/api/mp3` эндпойнт руу хүсэлт явуулж,
татсан файлыг `server/uploads/mp3` хавтсанд хадгална. Татсан файлаа `api/uploads/mp3/<файл>`
хаягаар авч болно.
