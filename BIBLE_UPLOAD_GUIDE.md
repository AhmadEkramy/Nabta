# دليل رفع الكتاب المقدس إلى Firestore

هذا الملف يشرح كيفية رفع الكتاب المقدس بالكامل (66 كتاب) باللغتين العربية والإنجليزية إلى قاعدة بيانات Firestore.

## الطريقة 1: رفع الكتاب المقدس بالإنجليزية فقط (من API)

يمكنك رفع الكتاب المقدس بالإنجليزية مباشرة من API:

```javascript
// رفع الكتاب المقدس بالكامل (66 كتاب)
await populateBibleDatabase(1, 66);

// أو رفع كتب محددة (مثلاً: من الكتاب 1 إلى 10)
await populateBibleDatabase(1, 10);

// رفع عينات للاختبار
await populateSampleBible();
```

## الطريقة 2: رفع آية واحدة يدوياً بالعربية والإنجليزية

```javascript
await addBibleVerseManually(
  'John',           // اسم الكتاب بالإنجليزية
  'إنجيل يوحنا',    // اسم الكتاب بالعربية
  3,                // رقم الأصحاح
  16,               // رقم الآية
  'For God so loved the world...',  // النص بالإنجليزية
  'لأنه هكذا أحب الله العالم...'    // النص بالعربية
);
```

## الطريقة 3: رفع مجموعة من الآيات دفعة واحدة

إذا كان لديك بيانات الكتاب المقدس في مصفوفة:

```javascript
const verses = [
  {
    book: 'Genesis',
    bookAr: 'سفر التكوين',
    chapter: 1,
    verse: 1,
    english: 'In the beginning God created the heavens and the earth.',
    arabic: 'فِي الْبَدْءِ خَلَقَ اللهُ السَّمَاوَاتِ وَالأَرْضَ.',
    bookNumber: 1,
    testament: 'OT'
  },
  {
    book: 'John',
    bookAr: 'إنجيل يوحنا',
    chapter: 3,
    verse: 16,
    english: 'For God so loved the world...',
    arabic: 'لأنه هكذا أحب الله العالم...',
    bookNumber: 43,
    testament: 'NT'
  }
  // ... المزيد من الآيات
];

await uploadBibleVersesBatch(verses);
```

## الطريقة 4: رفع الكتاب المقدس بالإنجليزية من API مع إضافة العربية من ملف JSON

إذا كان لديك ملف JSON بالترجمة العربية:

```javascript
// مثال على هيكل البيانات العربية
const arabicData = {
  'Genesis': {
    '1': {
      '1': 'فِي الْبَدْءِ خَلَقَ اللهُ السَّمَاوَاتِ وَالأَرْضَ.',
      '2': 'وَكَانَتِ الأَرْضُ خَرِبَةً وَخَالِيَةً...'
    },
    '2': {
      '1': 'فَأُكْمِلَتِ السَّمَاوَاتُ وَالأَرْضُ...'
    }
  },
  'John': {
    '3': {
      '16': 'لأنه هكذا أحب الله العالم...'
    }
  }
  // ... باقي الكتب
};

await populateBibleWithArabic(arabicData, 1, 66);
```

## استخدام الدوال من Console

بعد تحميل الصفحة، افتح Console في المتصفح (F12) واستخدم:

```javascript
// رفع الكتاب المقدس بالكامل بالإنجليزية فقط
await populateBibleDatabase(1, 66);

// رفع عينات للاختبار
await populateSampleBible();

// رفع أصحاح واحد
await fetchBibleChapter('John', 3);

// رفع آيات محددة
await fetchBibleVersesFromAPI('John', 3, 16, 18); // John 3:16-18
```

## ملاحظات مهمة

1. **الترجمات العربية**: API bible-api.com لا يدعم الترجمة العربية مباشرة، لذلك:
   - يمكنك رفع النصوص الإنجليزية أولاً من API
   - ثم إضافة النصوص العربية يدوياً أو عن طريق `uploadBibleVersesBatch`

2. **معلومات الكتب**: جميع كتب الكتاب المقدس (66 كتاب) محددة مسبقاً مع أسماء عربية وإنجليزية

3. **التجميع (Collection)**: البيانات تُرفع في تجميع باسم `bibleVerses` في Firestore

4. **هيكل البيانات في Firestore**:
   ```json
   {
     "english": "Verse text in English",
     "arabic": "النص بالعربية",
     "book": "John",
     "bookAr": "إنجيل يوحنا",
     "chapter": 3,
     "verse": 16,
     "reference": "John 3:16",
     "referenceAr": "إنجيل يوحنا 3:16",
     "bookNumber": 43,
     "testament": "NT"
   }
   ```

## مثال كامل

```javascript
// 1. رفع الكتاب المقدس بالإنجليزية أولاً (سيستغرق وقت طويل - حوالي 31,000 آية)
await populateBibleDatabase(1, 66);

// 2. بعد الانتهاء، يمكنك إضافة النصوص العربية باستخدام uploadBibleVersesBatch
const arabicVerses = [
  // ... قائمة بالآيات مع النصوص العربية والإنجليزية
];
await uploadBibleVersesBatch(arabicVerses);
```

## تحذيرات

- رفع الكتاب المقدس بالكامل سيستغرق وقتاً طويلاً (حوالي 2-3 ساعات)
- تأكد من اتصال مستقر بالإنترنت
- في حالة انقطاع الاتصال، يمكنك الاستمرار من حيث توقف:
  ```javascript
  await populateBibleDatabase(10, 66); // يبدأ من الكتاب 10
  ```

