# نظام الـ Streak (السلسلة) - Streak System

## التغييرات التي تم إجراؤها

### 1. إضافة حقل `lastActiveDate` في User Types
- تم إضافة `lastActiveDate?: string` في `src/types/index.ts`
- يخزن آخر تاريخ نشاط للمستخدم بصيغة YYYY-MM-DD

### 2. دوال جديدة في `src/firebase/userProfile.ts`

#### `checkAndUpdateStreak(userId: string)`
هذه الدالة تتحقق من آخر نشاط للمستخدم وتحدث الـ Streak تلقائيًا:

**السيناريوهات:**
- **أول نشاط للمستخدم**: يتم تعيين streak = 1
- **نشاط في نفس اليوم**: لا يتم التحديث، يبقى الـ streak كما هو
- **نشاط في اليوم التالي مباشرة**: يتم زيادة الـ streak بمقدار 1
- **نشاط بعد أكثر من يوم**: يتم إعادة تعيين الـ streak إلى 1 (كسر السلسلة)

**الإرجاع:**
```typescript
{
  streak: number,      // الـ streak الحالي
  isNewDay: boolean    // هل تم تحديث الـ streak (يوم جديد)
}
```

### 3. تحديثات في `src/contexts/AuthContext.tsx`
- عند تسجيل الدخول، يتم التحقق من الـ Streak تلقائيًا
- يتم تحديث الـ streak إذا كان يوم جديد
- يتم حفظ `lastActiveDate` عند إنشاء حساب جديد

### 4. تحديثات في `src/contexts/GameContext.tsx`

#### `updateStreak()`
- الآن تستخدم `checkAndUpdateStreak()` بدلاً من الزيادة اليدوية
- تعطي مكافآت XP عند الحفاظ على الـ streak
- تعرض رسائل خاصة عند الوصول لإنجازات معينة:
  - 7 أيام: "🎉 7-day streak! You're on fire!"
  - 30 يوم: "🏆 30-day streak! Incredible dedication!"
  - 100 يوم: "👑 100-day streak! You're a legend!"

#### الدوال التي تحدث الـ Streak تلقائيًا:
- `markVerseRead()` - عند قراءة آية
- `completeTask()` - عند إكمال مهمة
- `addFocusTime()` - عند إضافة وقت تركيز

## كيفية عمل النظام

### 1. عند تسجيل الدخول
```
المستخدم يسجل دخول
  ↓
AuthContext يتحقق من آخر نشاط
  ↓
إذا كان يوم جديد:
  - إذا مر يوم واحد فقط: streak + 1
  - إذا مر أكثر من يوم: streak = 1
  ↓
تحديث البيانات في Firestore
  ↓
عرض الـ streak الجديد للمستخدم
```

### 2. عند أي نشاط يومي
```
المستخدم يقوم بنشاط (قراءة، مهمة، تركيز)
  ↓
GameContext يتحقق من الـ Streak
  ↓
إذا كان يوم جديد:
  - تحديث الـ streak
  - إعطاء +10 XP
  - عرض رسالة تحفيزية
  ↓
تحديث البيانات
```

## مثال على الاستخدام

```typescript
import { checkAndUpdateStreak } from '../firebase/userProfile';

// في أي مكان تريد تحديث الـ streak
const result = await checkAndUpdateStreak(userId);

if (result.isNewDay) {
  console.log(`🔥 Streak updated to: ${result.streak}`);
  // أعط المستخدم مكافأة
  await addXP(10, `Daily streak: ${result.streak} days!`);
}
```

## الفوائد

1. ✅ **تلقائي**: الـ streak يتحدث تلقائيًا بدون تدخل يدوي
2. ✅ **دقيق**: يتعامل مع جميع السيناريوهات (نفس اليوم، يوم تالي، انقطاع)
3. ✅ **محفز**: رسائل وإنجازات خاصة تحفز المستخدم
4. ✅ **متكامل**: يعمل مع جميع الأنشطة (قراءة، مهام، تركيز)
5. ✅ **آمن**: يتعامل مع الأخطاء بشكل صحيح

## اختبار النظام

### سيناريو 1: مستخدم جديد
- اليوم الأول: streak = 1
- lastActiveDate = اليوم

### سيناريو 2: مستخدم منتظم
- اليوم 1: streak = 1
- اليوم 2: streak = 2
- اليوم 3: streak = 3

### سيناريو 3: مستخدم يكسر الـ streak
- اليوم 1: streak = 5
- (لا نشاط في اليوم 2)
- اليوم 3: streak = 1 (إعادة تعيين)

### سيناريو 4: نفس اليوم
- النشاط الأول: streak يتحدث
- النشاط الثاني: streak يبقى كما هو (لا تحديث)

## ملاحظات مهمة

1. الـ streak يتم حسابه بناءً على الأيام الميلادية (YYYY-MM-DD)
2. يتم التحديث عند أي نشاط (ليس فقط تسجيل الدخول)
3. النظام يعمل حتى لو كان المستخدم في منطقة زمنية مختلفة
4. يتم حفظ جميع التحديثات في Firestore تلقائيًا

