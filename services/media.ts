import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db, isLocalDemo } from '@/lib/firebase/client';
import { published } from '@/lib/local-demo';
export interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    body?: string;
    coverImage?: string;
    categoryName: string;
    categorySlug: string;
    authorName: string;
    articleType?: 'article' | 'news';
    status: 'draft' | 'review' | 'published' | 'archived';
    featured?: boolean;
    publishedAt?: {
        toDate?: () => Date;
    };
    relatedTractorIds?: string[];
    relatedVideoIds?: string[];
}
export interface Video {
    id: string;
    slug: string;
    title: string;
    description: string;
    youtubeVideoId: string;
    thumbnail?: string;
    category?: string;
    tractorId?: string;
    tractorName?: string;
    featured?: boolean;
    status: 'draft' | 'published';
    publishedAt?: {
        toDate?: () => Date;
    };
}
export interface Equipment {
    id: string;
    slug: string;
    name: string;
    categoryName: string;
    categorySlug: string;
    brandName?: string;
    description?: string;
    image?: string;
    price?: number;
    specifications?: Record<string, string | number>;
    status: 'draft' | 'published';
}
export interface Dealer {
    id: string;
    slug: string;
    name: string;
    brand?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address: string;
    city: string;
    district: string;
    state: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    services?: string[];
    images?: string[];
    logo?: string;
    verified?: boolean;
    status: 'draft' | 'published';
}
function mapped<T extends {
    id: string;
}>(snap: Awaited<ReturnType<typeof getDocs>>) { return snap.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }) as T); }
async function articles() { return (await published<Record<string, unknown> & {
    id: string;
}>('articles')).map(x => ({ ...x, title: String(x.title), slug: String(x.slug), excerpt: String(x.excerpt ?? ''), body: String(x.body ?? x.content ?? ''), coverImage: String(x.coverImage ?? x.image ?? ''), categoryName: String(x.categoryName ?? x.category ?? 'Article'), categorySlug: String(x.categorySlug ?? String(x.category ?? 'article').toLowerCase().replaceAll(' ', '-')), authorName: String(x.authorName ?? x.author ?? 'RJ Tractor Techs'), articleType: (x.articleType ?? 'article'), status: 'published' } as Article)); }
export async function listArticles(type?: 'article' | 'news', categorySlug?: string) { if (isLocalDemo && !db)
    return (await articles()).filter(x => (!type || x.articleType === type) && (!categorySlug || x.categorySlug === categorySlug)); if (!db)
    return []; const filters = [where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(24)]; if (type)
    filters.unshift(where('articleType', '==', type)); if (categorySlug)
    filters.unshift(where('categorySlug', '==', categorySlug)); return mapped<Article>(await getDocs(query(collection(db, 'articles'), ...filters))); }
export async function getArticle(slug: string) { if (isLocalDemo && !db)
    return (await articles()).find(x => x.slug === slug) ?? null; if (!db)
    return null; return (await mapped<Article>(await getDocs(query(collection(db, 'articles'), where('slug', '==', slug), where('status', '==', 'published'), limit(1)))))[0] ?? null; }
async function videos() { return (await published<Record<string, unknown> & {
    id: string;
}>('videos')).map(x => ({ ...x, title: String(x.title), slug: String(x.slug), description: String(x.description ?? ''), youtubeVideoId: String(x.youtubeVideoId ?? x.youtubeId ?? ''), thumbnail: String(x.thumbnail ?? ''), status: 'published' } as Video)); }
export async function listVideos() { if (isLocalDemo && !db)
    return (await videos()); if (!db)
    return []; return mapped<Video>(await getDocs(query(collection(db, 'videos'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(24)))); }
export async function getVideo(slug: string) { if (isLocalDemo && !db)
    return (await videos()).find(x => x.slug === slug) ?? null; if (!db)
    return null; return (await mapped<Video>(await getDocs(query(collection(db, 'videos'), where('slug', '==', slug), where('status', '==', 'published'), limit(1)))))[0] ?? null; }
async function equipment() { return (await published<Record<string, unknown> & {
    id: string;
}>('equipment')).map(x => ({ ...x, name: String(x.name ?? x.title), slug: String(x.slug), categoryName: String(x.categoryName ?? x.category ?? 'Equipment'), categorySlug: String(x.categorySlug ?? String(x.category ?? 'equipment').toLowerCase().replaceAll(' ', '-')), brandName: String(x.brandName ?? x.brand ?? ''), price: Number(x.price ?? 0), status: 'published' } as Equipment)); }
export async function listEquipment(categorySlug?: string) { if (isLocalDemo && !db)
    return (await equipment()).filter(x => !categorySlug || x.categorySlug === categorySlug); if (!db)
    return []; const f = [where('status', '==', 'published'), orderBy('name'), limit(30)]; if (categorySlug)
    f.unshift(where('categorySlug', '==', categorySlug)); return mapped<Equipment>(await getDocs(query(collection(db, 'equipment'), ...f))); }
export async function getEquipment(category: string, slug: string) { if (isLocalDemo && !db)
    return (await equipment()).find(x => x.categorySlug === category && x.slug === slug) ?? null; if (!db)
    return null; return (await mapped<Equipment>(await getDocs(query(collection(db, 'equipment'), where('categorySlug', '==', category), where('slug', '==', slug), where('status', '==', 'published'), limit(1)))))[0] ?? null; }
async function dealers() { return (await published<Record<string, unknown> & {
    id: string;
}>('dealers')).map(x => ({ ...x, name: String(x.name ?? x.title), slug: String(x.slug), address: String(x.address ?? ''), city: String(x.city ?? ''), district: String(x.district ?? ''), state: String(x.state ?? ''), status: 'published' } as Dealer)); }
export async function listDealers(f: {
    brand?: string;
    state?: string;
    district?: string;
    city?: string;
} = {}) { if (isLocalDemo && !db)
    return (await dealers()).filter(x => (!f.brand || x.brand === f.brand) && (!f.state || x.state === f.state) && (!f.district || x.district === f.district) && (!f.city || x.city === f.city)); if (!db)
    return []; const c = [where('status', '==', 'published'), orderBy('name'), limit(30)]; if (f.brand)
    c.unshift(where('brand', '==', f.brand)); if (f.state)
    c.unshift(where('state', '==', f.state)); if (f.district)
    c.unshift(where('district', '==', f.district)); if (f.city)
    c.unshift(where('city', '==', f.city)); return mapped<Dealer>(await getDocs(query(collection(db, 'dealers'), ...c))); }
export async function getDealer(slug: string) { if (isLocalDemo && !db)
    return (await dealers()).find(x => x.slug === slug) ?? null; if (!db)
    return null; return (await mapped<Dealer>(await getDocs(query(collection(db, 'dealers'), where('slug', '==', slug), where('status', '==', 'published'), limit(1)))))[0] ?? null; }
