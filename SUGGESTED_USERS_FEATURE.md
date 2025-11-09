# ميزة المستخدمون المقترحون - Suggested Users Feature

## الوصف

تم إضافة قسم "Suggested Users to Follow" في صفحة الـ Home تحت Quick Actions. يعرض هذا القسم مستخدمين عشوائيين من الموقع لمتابعتهم.

## الملفات المعدلة

### 1. `src/firebase/userProfile.ts`
تم إضافة دالة جديدة:

#### `getSuggestedUsers(currentUserId: string, limit: number = 5)`

**الوظيفة:**
- تجلب مستخدمين عشوائيين من قاعدة البيانات
- تستثني المستخدم الحالي
- تستثني المستخدمين الذين يتابعهم المستخدم بالفعل
- ترجع قائمة عشوائية من المستخدمين

**الإرجاع:**
```typescript
Promise<User[]>
```

### 2. `src/firebase/index.ts`
- تم تصدير الدالة الجديدة `getSuggestedUsers`

### 3. `src/pages/HomePage.tsx`

#### التغييرات الرئيسية:

**Imports الجديدة:**
- `UserPlus` icon من lucide-react
- `useEffect` من React
- `toast` من react-hot-toast
- `followUser`, `getSuggestedUsers` من firebase
- `User` type

**State الجديدة:**
```typescript
const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
const [loadingSuggested, setLoadingSuggested] = useState(false);
const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
```

**دوال جديدة:**
- `handleFollowUser(targetUserId: string)` - لمتابعة مستخدم مقترح

**UI Component جديد:**
- قسم "Suggested Users" يظهر بعد Quick Actions
- يعرض حتى 5 مستخدمين
- كل مستخدم يعرض:
  - الصورة الشخصية
  - الاسم
  - المستوى و XP
  - زر Follow مع أيقونة UserPlus

## المميزات

### 1. العشوائية
- المستخدمون يتم اختيارهم بشكل عشوائي
- في كل مرة يتم تحميل الصفحة، يظهر مستخدمون مختلفون

### 2. التصفية الذكية
- لا يظهر المستخدم الحالي
- لا يظهر المستخدمون الذين يتابعهم بالفعل
- يتم إزالة المستخدم من القائمة بعد متابعته

### 3. UX محسّن
- Loading indicator عند تحميل المستخدمين
- Loading indicator على زر Follow أثناء المتابعة
- رسائل نجاح/فشل واضحة
- يمكن الضغط على الصورة أو الاسم للذهاب للبروفايل

### 4. Responsive Design
- يعمل على جميع الأحجام
- يدعم Dark Mode
- يدعم RTL للغة العربية

## كيفية الاستخدام

1. **عرض المستخدمين المقترحين:**
   - اذهب إلى صفحة Home
   - انظر إلى الـ sidebar على اليمين
   - ستجد قسم "مستخدمون مقترحون" / "Suggested Users"

2. **متابعة مستخدم:**
   - اضغط على زر ➕ الأخضر
   - سيظهر loading indicator
   - ستظهر رسالة نجاح
   - المستخدم سيختفي من القائمة

3. **زيارة البروفايل:**
   - اضغط على الصورة الشخصية أو الاسم
   - سيتم توجيهك لصفحة البروفايل

## التحسينات المستقبلية المقترحة

1. **خوارزمية أذكى للاقتراحات:**
   - اقتراح مستخدمين بناءً على الاهتمامات المشتركة
   - اقتراح مستخدمين من نفس الدوائر
   - اقتراح مستخدمين بمستوى قريب

2. **المزيد من المعلومات:**
   - عرض عدد المتابعين
   - عرض آخر نشاط
   - عرض الإنجازات

3. **تفاعل أفضل:**
   - زر "Show More" لعرض مزيد من الاقتراحات
   - زر "Refresh" لتحديث القائمة
   - إمكانية رفض الاقتراحات

## الكود الأساسي

### جلب المستخدمين المقترحين:
```typescript
const users = await getSuggestedUsers(user.id, 5);
```

### متابعة مستخدم:
```typescript
await followUser(currentUserId, targetUserId, {
  name: currentUserName,
  avatar: currentUserAvatar
});
```

## ملاحظات

- الدالة تجلب 20 مستخدم ثم تصفيهم وتختار 5 عشوائيًا
- يمكن تغيير العدد بتمرير parameter مختلف
- النظام يتعامل مع حالات الخطأ بشكل آمن
- يتم عرض رسائل باللغتين العربية والإنجليزية

