# Treks Page UI/UX Redesign & Optimization — Architecture & Implementation Blueprint

## Executive Summary
This document outlines the exact architectural strategy, component structure, and code blueprints for the Worker agent to redesign `frontend/src/pages/treks/index.astro`.

The blueprint fulfills:
1. **R1 (UI/UX Redesign & Responsiveness)**: Fully responsive across Mobile (<640px), Tablet (640px–1023px), and Desktop (1024px+).
2. **R2 (Remove Featured Treks)**: Completely eliminates the Featured Treks section, the `TrekTrendingRow` import, and the `/api/v1/treks/featured` server-side API call.
3. **R3 (Backend API Integrity)**: Retains existing `GET /api/v1/treks` schema and query parameters without modifying backend endpoints.

---

## 1. Exact Lines to Remove for Featured Treks (R2)

### 1.1 Component Import
- **File**: `frontend/src/pages/treks/index.astro`
- **Target Line**: Line 4
```typescript
// REMOVE:
import TrekTrendingRow from '@/components/trek/TrekTrendingRow.astro';
```

### 1.2 Redundant Server-Side Data Fetch
- **File**: `frontend/src/pages/treks/index.astro`
- **Target Lines**: Lines 208��217
```typescript
// REMOVE:
// Fetch featured treks for trending section
let featuredTreks: any[] = [];
try {
  const featuredResponse = await fetch(`\${API_BASE_URL}/api/v1/treks/featured?limit=6`);
  if (featuredResponse.ok) {
    featuredTreks = await featuredResponse.json();
  }
} catch (error) {
  console.error('Failed to fetch featured treks:', error);
}
```
*Impact*: Eliminates a blocking secondary network round-trip during Astro SSR, reducing page render latency.

### 1.3 Featured Treks Section Markup
- **File**: `frontend/src/pages/treks/index.astro`
- **Target Lines**: Lines 317Ɠ328
```astro
<!-- REMOVE: -->
<!-- Trending Treks Section -->
{featuredTreks.length > 0 && (
  <section class="section bg-white">
    <div class="container-custom">
      <div class="mb-8">
        <span class="inline-block text-primary-500 font-semibold text-sm uppercase tracking-wider mb-2">Trending This Season</span>
        <h2 class="text-2xl md:text-3xl font-bold text-secondary-600">Featured Treks</h2>
      </div>
      <TrekTrendingRow treks={featuredTreks} />
    </div>
  </section>
)}
```

---

## 2. Frontmatter Enhancements (`treks/index.astro`)

### 2.1 Search Query Param Handling & Active Filters Computation
Add `search` support (which is already natively supported by `backend/app/api/v1/endpoints/treks.py:31`) and build the `activeFilters` array in frontmatter:

```typescript
// --- Frontmatter additions ---
const search = url.searchParams.get('search') || undefined;

// Append search to apiParams
if (search) apiParams.set('search', search);

// Robust filter URL builder
const buildFilterUrl = (filters: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  params.set('page', '1');
  const allFilters = {
    difficulty,
    season,
    max_price: maxPrice,
    location,
    sort,
    search,
    ...filters,
  };
  Object.entries(allFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  });
  const queryString = params.toString();
  return queryString ? `/treks?${queryString}` : '/treks';
};

// Compute dynamic active filter chips
interface ActiveFilter {
  key: string;
  label: string;
  displayValue: string;
  removeUrl: string;
}

const activeFilters: ActiveFilter[] = [];

if (search) {
  activeFilters.push({
    key: 'search',
    label: 'Search',
    displayValue: `\"${search}\"`,
    removeUrl: buildFilterUrl({ search: undefined }),
  });
}

if (location) {
  activeFilters.push({
    key: 'location',
    label: 'Region',
    displayValue: location,
    removeUrl: buildFilterUrl({ location: undefined }),
  });
}

if (difficulty) {
  const diffLabel = DIFFICULTY_LABELS[difficulty]?.label || difficulty;
  activeFilters.push({
    key: 'difficulty',
    label: 'Difficulty',
    displayValue: diffLabel,
    removeUrl: buildFilterUrl({ difficulty: undefined }),
  });
}

if (maxPrice) {
  const tier = budgetTiers.find(budget => budget.value === maxPrice);
  const priceLabel = tier ? tier.label : `Under ₹${(parseInt(maxPrice) / 1000).toFixed(0)}K`;
  activeFilters.push({
    key: 'max_price',
    label: 'Budget',
    displayValue: priceLabel,
    removeUrl: buildFilterUrl({ max_price: undefined }),
  });
}

if (season) {
  activeFilters.push({
    key: 'season',
    label: 'Season',
    displayValue: season,
    removeUrl: buildFilterUrl({ season: undefined }),
  });
}
```

---

## 3. Responsive Hero & Smart Search Bar Blueprint

### 3.1 Hero Section
```astro
<!-- Enhanced Hero Section -->
<section class="relative min-h[42vh] sm:min-h[48vh] flex items-center justify-center bg-neutral-900 overflow-hidden">
  <div 
    class="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000" 
    style="background-image: url('/images/home/hero-bg.webp')"
    aria-hidden="true"
  ></div>
  <div class="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-neutral-900/90"></div>
  
  <div class="relative z-10 container-custom w-full py-14 sm:py-18 md:py-24 text-center">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-amber-300 mb-4 shadow-sm">
      <span class="text-base">🔮</span>
      <span>Himalayan Trekking Expeditions & Treks</span>
    </div>
    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
      Find Your Next Himalayan Adventure
    </h1>
    <p class="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-200/95 max-w-2xl mx-auto leading-relaxed">
      Explore curated high-altitude trails, beginner treks, and summit adventures with certified mountain guides.
    </p>
  </div>
</section>
```

### 3.2 Smart Search Bar with Keyword & Responsive 12-Column Grid
g``astro
<!-- Smart Search Bar Section -->
<section class="relative z-20 -mt-10 sm:-mt-12 md:-mt-14">
  <div class="container-custom">
    <div class="bg-white rounded-2xl shadow-xl border border-neutral-200/90 p-5 sm:p-7 md:p-8">
      <form 
        action="/treks" 
        method="get" 
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 items-end"
      >
        <input type="hidden" name="page" value="1" />

        <!-- Keyword Search Input (lg: 4 cols) -->
        <div class="sm:col-span-2 lg:col-span-4">
          <label for="search" class="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
            Search Treks
          </label>
          <div class="relative">
            <input 
              type="text" 
              id="search" 
              name="search" 
              value={search || ''} 
              placeholder="e.g. Kedarkantha, Valley of Flowers..." 
              class="w-full pl-10 pr-4 py-2.5 smpy-3 border border-neutral-200 rounded-x1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-neutral-400"
            />
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0ez" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Region Dropdown (lg: 3 cols) -->
        <div class="lg:col-span-3">
          <label for="location" class="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
            Region / State
          </label>
          <select 
            id="location" 
            name="location" 
            class="w-full px-3.5 py-2.5 sm:py-3 border border-neutral-200 rounded-x1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all text-neutral-800"
          >
            <option value="">All Regions</option>
            {derivedRegions.map((r) => (
              <option value={r.slug} {...(location === r.slug ? { selected: true } : {})}>{r.name}</option>
            ))}
          </select>
        </div>

        <!-- Difficulty Dropdown (lg: 2 cols) -->
        <div class="lg:col-span-2">
          <label for="difficulty" class="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
            Difficulty
          </label>
          <select 
            id="difficulty" 
            name="difficulty" 
            class="w-full px-3.5 py-2.5 smpy-3 border border-neutral-200 rounded-x1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all text-neutral-800"
          >
            <option value="">Any Difficulty</option>
            {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
              <option value={key} {...(difficulty === key ? { selected: true } : {})}>{val.label}</option>
            ))}
          </select>
        </div>

        <!-- Budget Dropdown (lg: 2 cols) -->
        <div class="lg:col-span-2">
          <label for="max_price" class="block text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5">
            Budget
          </label>
          <select 
            id="max_price" 
            name="max_price" 
            class="w-full px-3.5 py-2.5 sm:py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-all text-neutral-800"
          >
            {budgetTiers.map((tier) => (
              <option value={tier.value} {...(maxPrice === tier.value ? { selected: true } : {})}>{tier.label}</option>
            ))}
          </select>
        </div>

        <!-- Submit Search Button (lg: 1 col) -->
        <div class="sm:col-span-2 lg:col-span-1">
          <button 
            type="submit" 
            class="w-full py-2.5 smpy-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" 
            aria-label="Submit search"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0ez" />
            </svg>
            <span class="lg:hidden text-sm">Find Treks</span>
          </button>
        </div>
      </form>

      <!-- Popular Search Chips -->
      <div class="mt-5 pt-4 sm:mt-6 sm:pt-5 border-t border-neutral-100 flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1">Popular:</span>
        {popularChips.map((chip) => (
          <a 
            href={chip.href} 
            class="px-3 py-1.5 bg-neutral-100 hover:bg-primary-50 text-neutral-700 hover:text-primary-700 rounded-full text-xs sm:text-sm font-medium transition-colors border border-transparent hover:border-primary-200"
          >
            {chip.label}
          </a>
        ))}
      </div>
    </div>
  </div>
</section>

---

## 4. Mobile & Tablet Responsive Filter Architecture

### 4.1 Results Toolbar & Mobile Filter Trigger
```astro
<!-- Active Filter Chips (Full Width Pill Bar) -->
{activeFilters.length > 0 && (
  <div class="flex flex-wrap items-center gap-2 mb-5 p-3 sm:p-4 bg-primary-50/50 border border-primary-200/70 rounded-2xl">
    <span class="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mr-1">
      <svg class=(�ȴ̸ԁ��̸ԁѕ�е�ɥ�������������􉹽������ɽ�����ɕ�����Ȉ�٥��	��������Ѐ�Ј�(�����������Ѡ���ɽ�����������ɽչ�����ɽ������������ɽչ�����ɽ���ݥ�Ѡ�Ȉ���4̀фĀĀ����ĴŠ�لĀĀ����Ā��ȸ��لĀĀ���Ĵ���̸��ݰ�ظ��Ѐظ��фĀĀ��������̸���0�܀дЀ�شظ��لĀĀ��������̴����0̸��ܸ̀���ĀĀ����̀ظ���X�舀��(��������ٜ�(�������ѥٔ�(����������(����(����텍ѥٕ��ѕ�̹�������������(�������(���������ɕ��텘�ɕ��ٕUɱ�(�������������􉥹�����������ѕ�̵���ѕȁ����ĸԁ��́��ā���ݡ�є���ɑ�ȁ��ɑ�ȵ����Ʌ��������ٕ�鉽ɑ�ȵ�ɥ����������ٕ�鉜��ɥ����������ѕ�е�́���е����մ�ѕ�е����Ʌ��������ٕ��ѕ�е�ɥ��������ɽչ�����ձ��͡���ܵ�́�Ʌ�ͥѥ��������ɽ���(��������ѥѱ���I���ٔ��텘�������耑텘��������Y��Օ���(�������(��������������������ѕ�е����Ʌ���������е��ɵ����텘��������������(�������������������􉙽�е�����ѕ�е����Ʌ�������ɽ�����ٕ��ѕ�е�ɥ���������텘��������Y��Օ�������(����������ٜ�������̸ܴԁ��̸ԁѕ�е����Ʌ�������ɽ�����ٕ��ѕ�е�ɥ���������Ʌ�ͥѥ��������̈�����􉹽������ɽ�����ɕ�����Ȉ�٥��	��������Ѐ�Ј�(�������������Ѡ���ɽ�����������ɽչ�����ɽ������������ɽչ�����ɽ���ݥ�Ѡ�Ȉ���4؀��0����4؀ٰ�Ȁ�Ȉ���(����������ٜ�(��������(�������((�����(�������ɕ���ɕ�̈�(������������ѕ�е�́���е�����ѕ�е�ɥ����������ٕ��ѕ�е�ɥ��������չ��ɱ���������Ѽ���ȁ��ā�Ʌ�ͥѥ��������̈(�����(���������ȁ����텍ѥٕ��ѕ�̹����ѡ��(������(��𽑥��(��((�����I��ձ�́!����Ȱ�5��������ѕȁ	��ѽ����M��Ё	�Ȁ���(�؁�����􉙱��������Ʌ���ѕ�̵���ѕȁ���ѥ�䵉��ݕ�������́���؁���Ё��ɑ�ȵ����ɑ�ȵ����Ʌ����������(�����������ѕ�еʹ�ѕ�е����Ʌ���������е����մ��(�����ѽх�%ѕ�̀�������(��������(��������M��ݥ��������������􉙽�е�����ѕ�е͕��������������х��%ѕ���M핹�%ѕ�����������������������􉙽�е�����ѕ�е͕�������������ѽх�%ѕ�����������ɕ��(��������(������耠(�����������������􉙽�е����մ�ѕ�е����Ʌ�������9���ɕ�́��չ����э������ɥѕɥ�������(������(�����((���؁�����􉙱����ѕ�̵���ѕȁ����́ܵ�ձ��ʹ�ܵ��Ѽ����ѥ�䵉��ݕ���ʹ���ѥ�䵕����(���������5��������ѕȁ=����	��ѽ���Y�ͥ����������������(�������ѽ�(��������􉵽��������ѕȵ�����(�������������ѽ��(�����������􉱜顥������������������ѕ�̵���ѕȁ����ȁ��Ё��ȁ���ݡ�є���ɑ�ȁ��ɑ�ȵ����Ʌ��������ٕ�鉽ɑ�ȵ�ɥ��������ɽչ����ᰁѕ�е�́ʹ�ѕ�еʹ����е͕�������ѕ�е͕�����������͡���ܵ�́��ٕ�鉜�����Ʌ������Ʌ�ͥѥ��������́������ɥ���ȁ������ɥ����ɥ��������(�������ɥ����������􉙅�͔�(�������ɥ������ɽ��􉵽��������ѕȵ�ɅݕȈ(�����(��������ٜ�������ܴЁ��Ёѕ�е�ɥ�������������􉹽������ɽ�����ɕ�����Ȉ�٥��	��������Ѐ�Ј�(�����������Ѡ���ɽ�����������ɽչ�����ɽ������������ɽչ�����ɽ���ݥ�Ѡ�Ȉ���4̀фĀĀ����ĴŠ�لĀĀ����Ā��ȸ��لĀĀ���Ĵ���̸��ݰ�ظ��Ѐظ��фĀĀ��������̸���X�ݰ�Ѐ�شظ��لĀĀ��������̴����0̸��ܸ̀���ĀĀ����̀ظ���X�舀��(��������ٜ�(��������������ѕ��������(������텍ѥٕ��ѕ�̹����Ѡ���������(�������������������􉥹�����������ѕ�̵���ѕȁ���ѥ�䵍��ѕȁ����ܵl����t���ԁ��ĸԁѕ�е�́���е�����ѕ�еݡ�є�����ɥ��������ɽչ�����ձ���(����������텍ѥٕ��ѕ�̹����ѡ�(��������������(��������(�������ѽ��((���������M��Ёɽ���ݸ����(�����؁�����􉙱����ѕ�̵���ѕȁ����Ȉ�(������񱅉�������ͽ�е�ɕ�̈�������ѕ�е�́ʹ�ѕ�еʹ�ѕ�е����Ʌ���������е����մ�ݡ�ѕ���������Ʌ���M��Ё��𽱅����(�������͕���Ѐ(�����������ͽ�е�ɕ�̈�(����������������́��ȁ��ɑ�ȁ��ɑ�ȵ����Ʌ������ɽչ�������ѕ�е�́ʹ�ѕ�еʹ����ݡ�є������鉽ɑ�ȵ�ɥ��������������ɥ���ā������ɥ����ɥ��������ѕ�е����Ʌ���������е����մ�(�����������������ݥ���ܹ����ѥ����ɕ���ѡ�̹م�Ք�(�������(����������ѥ���م�Ք��ե����ѕ�Uɰ��ͽ��耝��ݕ�М����͕���ѕ���ͽ�Ѐ��􀝹�ݕ�М�����ͽ����9�ݕ����ѥ���(����������ѥ���م�Ք��ե����ѕ�Uɰ��ͽ��耝���ձ�ɥ�䜁���͕���ѕ���ͽ�Ѐ������ձ�ɥ����A��ձ�ɥ����ѥ���(����������ѥ���م�Ք��ե����ѕ�Uɰ��ͽ��耝�ɥ��}�͌�����͕���ѕ���ͽ�Ѐ����ɥ��}�͌���Aɥ���1�܁Ѽ�!�����ѥ���(����������ѥ���م�Ք��ե����ѕ�Uɰ��ͽ��耝�ɥ��desc' })} selected={sort === 'pricg�\���O��X�N�Y������[ۏ���[ۈ�[YO^؝Z[�[\�\�
��ܝ�	ܘ][���J_H�[X�Y^��ܝOOH	ܘ][���O�Y�\��]Y��[ۏ����[X����]����]����]����������\����YX�\�
Y[�Θ����Ν�M̘
B�\��KKH\����X��H�YX�\�KO��\�YH�\��H�Y[�Θ����Ν�M̈�^\��[��L���]��\��H���]�]H��[�YL��ܙ\��ܙ\�[�]]�[L��LM��X��H�L��Y��^ȏ��]��\��H��^][\�X�[�\��\�Y�KX�]�Y[�X�M��M�ܙ\�X��ܙ\�[�]]�[LL�����\��H�^X�\�H�۝X��^\�X�ۙ\�KM��^][\�X�[�\��\L����ݙ��\��H��MHMH^\�[X\�KML��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�L�LHHLKLZM�LHHLH]���N�LHHKK��Lˍ��M��M��MLHHK��Lˍ�ՌM�M�M��N�LHHK��L�K���ˌ�L�ˌ�L�LLHL���N����ς��ݙς��[\��ς��X�]�Q�[\�˛[���	��
�H��Y�H���Z�Ȉ��\��H�^^�^\�[X\�KMLݙ\��^\�[X\�KM��۝X��ݙ\��[�\�[�H�����\�][��O��
_B��]����KKHY��X�[HX��ܙ[ۈKO��]Z[��\��H�ܛ�\X�MH��[����[[X\�H�\��H��^][\�X�[�\��\�Y�KX�]�Y[��۝\�[ZX��^\�H^[�]]�[N�\��܋\�[�\�\�[�ۙHKLK�Hݙ\��^\�X�ۙ\�KM��[��][ۋX��ܜȏ���[��\��H��^][\�X�[�\��\L����ݙ��\��H��MM^\�[X\�KML��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�NHL���MMK��NM�M�LLK�MMHLK�MMHLL���MLLK�MMHLK�MMHKN��NˌLL���L����X�K�NLHˎ�L��HHLK����K�M͋LK��̈KM���KLLK����LK��K�L��L��L�K���LˌM���ς��ݙς�Y��X�[B���[���ݙ��\��H��MM�[��][ۋ]�[�ٛܛHܛ�\[�[����]KLN^[�]]�[M��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�LNH[M��M�MȈς��ݙς���[[X\�O��]��\��H�]L��X�K^KLK�HM�����ؚ�X��[��Y\�Q��P�SW�P�S�K�X\

��^K�[YWJHO�
�H��Y�^؝Z[�[\�\�
�Y��X�[N�Y��X�[HOOH�^H�[�Y�[�Y��^HJ_B��\��^��^][\�X�[�\��\�Y�KX�]�Y[�L��HKLK�H��[�Y[�^^��۝[YY][H�[��][ۋX[	�Y��X�[HOOH�^H�	ؙ�\�[X\�KML^\�[X\�KM��۝\�[ZX��	��	�^[�]]�[M�ݙ\����[�]]�[MLݙ\��^[�]]�[NL	�XB����[��\��^��Y�H	ݘ[YK���ܟH^^�O�ݘ[YK�X�[O��[����Y��X�[HOOH�^H	���[��\��H�^\�[X\�KM�^^ȏ��!���[��B��O��
J_B��]����]Z[ς��KKH�Y�]X��ܙ[ۈKO��]Z[��\��H�ܛ�\X�MH��[����[[X\�H�\��H��^][\�X�[�\��\�Y�KX�]�Y[��۝\�[ZX��^\�H^[�]]�[N�\��܋\�[�\�\�[�ۙHKLK�Hݙ\��^\�X�ۙ\�KM��[��][ۋX��ܜȏ���[��\��H��^][\�X�[�\��\L����ݙ��\��H��MM^\�[X\�KML��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�LL��LK��M�L��MKL���K��������MH��LK����L��LN�K�LH������NNHSLL���L]�L�[LLX�LK�LHL��K��L��NNKLSL�HL�NHHLKLNHHLN^��ς��ݙς��Y�]���[���ݙ��\��H��MM�[��][ۋ]�[�ٛܛHܛ�\[�[����]KLN^[�]]�[M��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�LNH[M��M�MȈς��ݙς���[[X\�O��]��\��H�]L��X�K^KLK�HM����؝Y�]Y\�˙�[\�

HO���[YJK�X\

Y\�HO�
�H��Y�^؝Z[�[\�\�
�X^��X�N�X^�X�HOOHY\���[YH�[�Y�[�Y�Y\���[YHJ_B��\��^��^][\�X�[�\��\�Y�KX�]�Y[�L��HKLK�H��[�Y[�^^��۝[YY][H�[��][ۋX[	�X^�X�HOOHY\���[YH�	ؙ�\�[X\�KML^\�[X\�KM��۝\�[ZX��	��	�^[�]]�[M�ݙ\����[�]]�[MLݙ\��^[�]]�[NL	�XB����[���Y\��X�[O��[����[��\��^��LˍHLˍH��[�YY�[�ܙ\��^][\�X�[�\��\�Y�KX�[�\�	�X^�X�HOOHY\���[YH�	؛ܙ\�\�[X\�KML��\�[X\�KML	��	؛ܙ\�[�]]�[L�	�XO���X^�X�HOOHY\���[YH	���[��\��H��LK�HLK�H��[�YY�[��]�]H����[��B���[����O��
J_B��]����]Z[ς��KKH�X\�ۈX��ܙ[ۈKO���[�X\�ۜ˛[���	��
�]Z[��\��H�ܛ�\X�MH��[����[[X\�H�\��H��^][\�X�[�\��\�Y�KX�]�Y[��۝\�[ZX��^\�H^[�]]�[N�\��܋\�[�\�\�[�ۙHKLK�Hݙ\��^\�X�ۙ\�KM��[��][ۋX��ܜȏ���[��\��H��^][\�X�[�\��\L����ݙ��\��H��MM^\�[X\�KML��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�LL�݌[LM��[NKNZLSML��LMK�͍��͍K���K���M��������K���K���LL��̎K��ˍ��M����Mˍ�M�K��ˍ��LM�L�MLKNN^��ς��ݙς��X\�ۂ���[���ݙ��\��H��MM�[��][ۋ]�[�ٛܛHܛ�\[�[����]KLN^[�]]�[M��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�LNH[M��M�MȈς��ݙς���[[X\�O��]��\��H�]L�ܚYܚYX���L��\LK�HM�����[�X\�ۜ˜�X�J
K�X\

�HO�
�H��Y�^؝Z[�[\�\�
��X\�ێ��X\�ۈOOH��[�Y�[�Y��J_B��\��^�L��HKLK�H��[�Y[�^^��۝[YY][H^X�[�\��[��][ۋX[	��X\�ۈOOH��	ؙ�\�[X\�KML^]�]H�۝\�[ZX���Y��^���	ؙ�[�]]�[ML^[�]]�[M�ݙ\����[�]]�[LLݙ\��^[�]]�[NL�ܙ\��ܙ\�[�]]�[L��	�XB�����B��O��
J_B��]����]Z[ς�B��]����\�YO���KKB�������[ؚ[H�[\��]�\�[�[	��Y[��ܚ\�\��KKH[ؚ[H�[\��]�\���Y]KO��]��YH�[ؚ[KY�[\�Y�]�\����\��H��^Y[��]L�MLΚY[��[�\�Y]�[��[�ۙH�[��][ۋX[\�][ۋL��X�]KL[��\�X�H����OH�X[�Ȃ�\�XK[[�[H��YH��\�XK[X�[H��Z��[\��[ۜȂ���KKH�X����KO��]��YH�[ؚ[KY�[\�X�X�������\��H��^Y[��]L��X�X��͌�X����X�\�^��[��][ۋ[�X�]H\�][ۋL��X�]KL����]����KKH�YK[�]�]�\�[�[KO��]��YH�[ؚ[KY�[\�\[�[���\��H��^Y[��]^KL�Y�LX^]�Y�[�N�X^]�[Y�Y�[��]�]H�Y��L��^�^X���[�ٛܛH�[��]K^Y�[�[��][ۋ]�[�ٛܛH\�][ۋL�X\�KZ[�[�]����KKH�]�\�XY\�KO��]��\��H��^][\�X�[�\��\�Y�KX�]�Y[�M�KM�ܙ\�X��ܙ\�[�]]�[L���[�]]�[ML���]��\��H��^][\�X�[�\��\L����ݙ��\��H��MHMH^\�[X\�KML��[H��ۙH�����OH��\��[���܈��Y]Л�H������]����K[[�X�\H���[������K[[�Z��[�H���[������K]�YH���H�L�LHHLKLZM�LHHLH]���N�LHHKK��Lˍ��M��M��MLHHK��Lˍ�ՌM�M�M��N�LHHK��L�K���ˌ�L�ˌ�L�LLHL���N����ς��ݙς���\��H�^[��۝X��^\�X�ۙ\�KM����[\��Z���ς��X�]�Q�[\�˛[���	��
��[��\��H�^^��۝\�[ZX��L�KL�H��\�[X\�KLL^\�[X\�KN��[�YY�[����X�]�Q�[\�˛[��HX�]�B���[���
_B��]����]ۈ�YH�[ؚ[KY�[\�X���H��\OH��]ۈ���\��H�L�[\�L�^[�]]�[Mݙ\��^[�]]�[M���[�Y[�ݙ\����[�]]�[L�͌�[��][ۋX��ܜȂ�\�XK[X�[H����H�[\�Ȃ���ݙ��\��J'r-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>


    <!-- Scrollable Filter Options -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Difficulty -->
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Difficulty Level</h4>
        <div class="flex flex-wrap gap-2">
          {Object.entries(DIFFICULTY_LABELS).map(([key, val]) => (
            <a 
              href={buildFilterUrl({ difficulty: difficulty === key ? undefined : key })}
              class={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${difficulty === key ? 'bg-primary-500 text-white border-primary-500 shadow-xs' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'}`}
            >
              <span>{value.label}</span>
              {difficulty === key && <span>✅</span>}
            </a>
          ))}
        </div>
      </div>

      <!-- Budget -->
      <div>
        <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Max Budget</h4>
        <div class="grid grid-cols-2 gap-2">
          {budgetTiers.filter((t) => t.value).map((tier) => (
            <a 
              href={buildFilterUrl({ max_price: maxPrice === tier.value ? undefined : tier.value })}
              class={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${maxPrice === tier.value ? 'bg-primary-500 text-white border-primary-500 shadow-xs' : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'}`}
            >
              {tier.label}
            </a>
          ))}
        </div>
      </div>


      <!-- Season -->
      {allSeasons.length > 0 && (
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Season / Month</h4>
          <div class="flex flex-wrap gap-2">
            {allSeasons.slice(0, 8).map((s) => (
              <a 
                href={buildFilterUrl({ seacon: season === s ? undefined : s })}
                class={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${season === s ? 'bg-primary-500 text-white border-primary-500 shadow-xs'% : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'}`}
              >
                {s}
              </a>
          ))}
          </div>
        </div>
      )}

      <!-- Region -->
      {derivedRegions.length > 0 && (
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Region</h4>
          <div class="flex flex-wrap gap-2">
            {derivedRegions.map((r) => (
              <a 
                href={buildFilterUrl({ location: location === r.slug ? undefined : r.slug })}
                class={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${location === r.slug ? 'bg-primary-500 text-white border-primary-500 shadow-xs'% : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300'}`}
              >
                {r.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>

    <!-- Drawer Footer Actions -->
    <div class="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
      <a 
        href="
treks" 
        class="flex-1 py-3 px-4 rounded-xl border border-neutral-300 bg-white text-center text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
      >
        Reset All
      </a>
      <button 
        id="mobile-filter-apply" 
        type="button" 
        class="flex-1 py-3 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-center text-xs sm:text-sm font-semibold transition-colors shadow-md"
      >
        View Treks ({totalItems})
      </button>
    </div>
  </div>
</div>

<script>
  function setupFilterDrawer() {
    const openBtn = document.getElementById('mobile-filter-open');
    const closeBtn = document.getElementById('mobile-filter-close');
    const applyBtn = document.getElementById('mobile-filter-apply');
    const backdrop = document.getElementById('mobile-filter-backdrop');
    const drawer = document.getElementById('mobile-filter-drawer');
    const panel = document.getElementById('mobile-filter-panel');

    if (!openBtn || !drawer || !panel || !backdrop) return;

    function openDrawer() {
      drawer.classList.remove('invisible', 'pointer-events-none');
      drawer.classList.add('opacity-100');
      backdrop.classList.add('opacity-100');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      panel.classList.remove('translate-x-0');
      panel.classList.add('translate-x-full');
      backdrop.classList.remove('opacity-100');
      drawer.classList.remove('opacity-100');
      drawer.classList.add('pointer-events-none');
      setTimeout(() => {
        drawer.classList.add('invisible');
        document.body.style.overflow = '';
      }, 300);
    }

    openBtn.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    applyBtn?.addEventListener('click', closeDrawer);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  setupFilterDrawer();
  document.addEventListener('astro:page-load', setupFilterDrawer);
</script>

---

## 5. Execution Summary & Step-by-Step Instructions for Worker
1. Open `frontend/src/pages/treks/index.astro`.
2. Delete line 4 (`import TrekTrendingRow...`).
3. In frontmatter, add `search` query parameter support and `activeFilters` logic.
4. Delete lines 208Ɠ217 (featured treks server fetch).
5. Delete lines 317Ɠ328 (Trending Treks section template markup).
6. Replace Hero & Search Bar with the redesigned 12-column responsive layout.
7. Wrap main content in `<div class="lg:flex lg:gap-8">`, with desktop `<aside class="hidden lg:block lg:w-72">` instead of unconditional aside.
8. Add Active Filter Chips bar and Mobile Filter Toolbar + Trigger button.
9. Append Mobile Filter Drawer markup and JavaScript at bottom of page.
10. Run `npm run check` and `npm run build` in `frontend/` to ensure 0 errors.
