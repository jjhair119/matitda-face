import {api} from './client';

export interface UserSearchResult {
    id: string;
    nickname: string;
    user_code: string;
}

export async function searchUserByCode(code: string): Promise<UserSearchResult> {
    const {data} = await api.get('/users/search', {params: {code}});
    return data.user;
}

export interface UserSummary {
    id: string;
    nickname: string;
    profile_image_url: string | null;
    is_following: boolean;
}

export interface FriendStats {
    id: string;
    nickname: string;
    profile_image_url: string | null;
    today_calories: number;
    tdee_kcal: number | null;
    achievement_rate: number | null;
}

export async function fetchFollowing(userId: string): Promise<UserSummary[]> {
    const {data} = await api.get(`/follows/${userId}/following`);
    return data.following ?? [];
}

export async function fetchFollowers(userId: string): Promise<UserSummary[]> {
    const {data} = await api.get(`/follows/${userId}/followers`);
    return data.followers ?? [];
}

export async function fetchFriendsDiet(): Promise<{me: FriendStats; friends: FriendStats[]}> {
    const {data} = await api.get('/friends');
    return data;
}

export async function toggleFollow(userId: string): Promise<{following: boolean}> {
    const {data} = await api.post(`/follows/${userId}`);
    return data;
}
