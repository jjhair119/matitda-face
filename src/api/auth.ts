import {api, saveToken} from './client';

export interface AuthResult {
    token: string;
    isNewUser: boolean;
    user: {
        id: string;
        nickname: string;
        email: string;
    };
}

export async function loginWithKakaoToken(kakaoAccessToken: string): Promise<AuthResult> {
    const {data} = await api.post<AuthResult>('/auth/kakao', {
        access_token: kakaoAccessToken,
    });
    await saveToken(data.token);
    return data;
}

export async function loginWithDevToken(nickname = '테스트유저'): Promise<{token: string; userId: string}> {
    const {data} = await api.post<{token: string; userId: string}>('/auth/dev-token', {nickname});
    await saveToken(data.token);
    return data;
}
