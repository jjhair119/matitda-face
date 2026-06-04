import {api} from './client';

export interface Post {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    nickname: string;
    profile_image_url: string | null;
    like_count: number;
    is_liked: boolean;
    is_bookmarked: boolean;
    images: string[];
    tags: string[];
}

export async function fetchPosts(params?: {tag?: string; cursor?: string; limit?: number}): Promise<{posts: Post[]; next_cursor: string | null}> {
    const {data} = await api.get('/posts', {params});
    return data;
}

export async function fetchPostById(id: string): Promise<Post> {
    const {data} = await api.get(`/posts/${id}`);
    return data.post;
}

export async function createPost(params: {content: string; ingredient_tags?: string; images?: {uri: string; name: string; type: string}[]}): Promise<Post> {
    const form = new FormData();
    form.append('content', params.content);
    if (params.ingredient_tags) {
        form.append('ingredient_tags', params.ingredient_tags);
    }
    params.images?.forEach((img) => {
        form.append('images', img as any);
    });
    const {data} = await api.post('/posts', form, {
        transformRequest: (d) => d,
    });
    return data.post;
}

export async function deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
}

export async function toggleLike(id: string): Promise<{liked: boolean; like_count: number}> {
    const {data} = await api.post(`/posts/${id}/like`);
    return data;
}

export async function toggleBookmark(id: string): Promise<{bookmarked: boolean}> {
    const {data} = await api.post(`/posts/${id}/bookmark`);
    return data;
}
