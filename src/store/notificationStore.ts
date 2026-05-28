import {create} from 'zustand';

export interface Notification {
    id: string;
    type: 'order' | 'point' | 'coupon' | 'friend' | 'community';
    emoji: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const MOCK: Notification[] = [
    {id: '1', type: 'order', emoji: '📦', title: '배달 완료', body: 'GS더프레시 마포점 주문이 도착했어요', time: '2시간 전', read: false},
    {id: '2', type: 'point', emoji: '✨', title: '포인트 적립', body: '식재료 구매로 1,700P 적립 완료', time: '2시간 전', read: false},
    {id: '3', type: 'community', emoji: '❤️', title: '게시글 좋아요', body: '다이어트 닭가슴살 볶음밥에 좋아요 12개가 달렸어요', time: '4시간 전', read: false},
    {id: '4', type: 'friend', emoji: '👤', title: '새 팔로워', body: '헬시라이프님이 팔로우하기 시작했어요', time: '어제', read: true},
    {id: '5', type: 'coupon', emoji: '🎁', title: '쿠폰 발급', body: '15% 할인 쿠폰이 발급됐어요. 7일 내로 사용하세요', time: '어제', read: true},
    {id: '6', type: 'point', emoji: '🔥', title: '연속 기록 보너스', body: '3일 연속 80점 이상! 보너스 50P 적립', time: '2일 전', read: true},
    {id: '7', type: 'community', emoji: '💬', title: '댓글 알림', body: '오늘도운동님이 댓글을 달았어요: "좋은 식단이네요!"', time: '3일 전', read: true},
    {id: '8', type: 'order', emoji: '🎉', title: '첫 주문 완료', body: '맛잇다 첫 주문을 축하해요! 500P 추가 적립', time: '7일 전', read: true},
];

interface NotificationState {
    notifications: Notification[];
    markRead: (id: string) => void;
    markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: MOCK,
    markRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? {...n, read: true} : n,
            ),
        })),
    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({...n, read: true})),
        })),
}));
