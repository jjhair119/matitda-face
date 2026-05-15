export interface Friend {
    id: string;
    name: string;
    emoji: string;
    todayKcal: number | null;
    goalKcal: number;
    score: number | null;
    badge: string;
    todayScore: number;
    isFollowing: boolean;
}

const DUMMY_FOLLOWING: Friend[] = [
    {id: '1', name: '건강이좋아', emoji: '🙂', todayKcal: 1640, goalKcal: 1820, score: 90, badge: '🥇', todayScore: 58, isFollowing: true},
    {id: '2', name: 'diet_master', emoji: '😎', todayKcal: 1200, goalKcal: 1820, score: 66, badge: '', todayScore: 34, isFollowing: true},
    {id: '3', name: '그린푸드', emoji: '🌿', todayKcal: null, goalKcal: 1600, score: null, badge: '', todayScore: 21, isFollowing: true},
    {id: '4', name: '헬시라이프', emoji: '💪', todayKcal: 1750, goalKcal: 2000, score: 88, badge: '', todayScore: 142, isFollowing: true},
    {id: '5', name: '다이어트일기', emoji: '📓', todayKcal: 980, goalKcal: 1400, score: 70, badge: '', todayScore: 67, isFollowing: true},
    {id: '6', name: '근육키우기', emoji: '🏋️', todayKcal: 2340, goalKcal: 2500, score: 94, badge: '🥈', todayScore: 189, isFollowing: true},
    {id: '7', name: '샐러드러버', emoji: '🥗', todayKcal: 1150, goalKcal: 1500, score: 77, badge: '', todayScore: 43, isFollowing: true},
    {id: '8', name: 'fit_jiny', emoji: '🧘', todayKcal: null, goalKcal: 1700, score: null, badge: '', todayScore: 29, isFollowing: true},
    {id: '9', name: '오늘도운동', emoji: '🚴', todayKcal: 1880, goalKcal: 1900, score: 99, badge: '🥇', todayScore: 312, isFollowing: true},
    {id: '10', name: '저탄고지', emoji: '🥩', todayKcal: 1600, goalKcal: 1800, score: 89, badge: '', todayScore: 74, isFollowing: true},
    {id: '11', name: '채소천국', emoji: '🥦', todayKcal: 870, goalKcal: 1300, score: 67, badge: '', todayScore: 18, isFollowing: true},
    {id: '12', name: 'cleaneat_official', emoji: '✨', todayKcal: 2100, goalKcal: 2200, score: 95, badge: '🥈', todayScore: 521, isFollowing: true},
    {id: '13', name: '아침밥챌린지', emoji: '🌅', todayKcal: null, goalKcal: 1750, score: null, badge: '', todayScore: 88, isFollowing: true},
    {id: '14', name: '단식고수', emoji: '⏱️', todayKcal: 1300, goalKcal: 1600, score: 81, badge: '', todayScore: 55, isFollowing: true},
    {id: '15', name: 'healthy_min', emoji: '🍎', todayKcal: 1550, goalKcal: 1700, score: 91, badge: '', todayScore: 37, isFollowing: true},
    {id: '16', name: '단백질덕후', emoji: '🍗', todayKcal: 2050, goalKcal: 2100, score: 98, badge: '🥇', todayScore: 244, isFollowing: true},
    {id: '17', name: '가벼운하루', emoji: '🌤️', todayKcal: null, goalKcal: 1500, score: null, badge: '', todayScore: 12, isFollowing: true},
    {id: '18', name: '요리연구가', emoji: '👨‍🍳', todayKcal: 1780, goalKcal: 1900, score: 94, badge: '', todayScore: 403, isFollowing: true},
    {id: '19', name: '식단일기장', emoji: '📅', todayKcal: 1420, goalKcal: 1600, score: 89, badge: '', todayScore: 61, isFollowing: true},
    {id: '20', name: 'nosugar_life', emoji: '🚫', todayKcal: 1200, goalKcal: 1500, score: 80, badge: '', todayScore: 93, isFollowing: true},
    {id: '21', name: '매일달리기', emoji: '🏃', todayKcal: 1960, goalKcal: 2000, score: 98, badge: '🥈', todayScore: 178, isFollowing: true},
    {id: '22', name: '건강한아침', emoji: '🥣', todayKcal: null, goalKcal: 1650, score: null, badge: '', todayScore: 26, isFollowing: true},
    {id: '23', name: '눈바디챌린지', emoji: '📸', todayKcal: 1700, goalKcal: 1800, score: 94, badge: '', todayScore: 509, isFollowing: true},
    {id: '24', name: 'diet_with_me', emoji: '🤝', todayKcal: 1380, goalKcal: 1600, score: 86, badge: '', todayScore: 132, isFollowing: true},
];

const DUMMY_FOLLOWERS: Friend[] = [
    {id: '25', name: '러닝메이트', emoji: '🏃', todayKcal: 1900, goalKcal: 2100, score: 90, badge: '', todayScore: 77, isFollowing: false},
    {id: '26', name: '요리왕비룡', emoji: '👨‍🍳', todayKcal: 1400, goalKcal: 1800, score: 78, badge: '', todayScore: 203, isFollowing: true},
    {id: '27', name: '단백질왕', emoji: '🥩', todayKcal: null, goalKcal: 2200, score: null, badge: '', todayScore: 98, isFollowing: false},
    {id: '28', name: '채식주의자', emoji: '🌱', todayKcal: 1100, goalKcal: 1500, score: 73, badge: '', todayScore: 55, isFollowing: false},
    {id: '29', name: '헬스고수', emoji: '💪', todayKcal: 2400, goalKcal: 2500, score: 96, badge: '🥇', todayScore: 671, isFollowing: true},
    {id: '30', name: 'morning_run', emoji: '🌄', todayKcal: 1750, goalKcal: 1900, score: 92, badge: '', todayScore: 44, isFollowing: false},
    {id: '31', name: '잡식러', emoji: '🍽️', todayKcal: 2100, goalKcal: 2000, score: 105, badge: '', todayScore: 30, isFollowing: false},
    {id: '32', name: '저염식챌린지', emoji: '🧂', todayKcal: null, goalKcal: 1700, score: null, badge: '', todayScore: 48, isFollowing: false},
    {id: '33', name: '비건라이프', emoji: '🥑', todayKcal: 1050, goalKcal: 1400, score: 75, badge: '', todayScore: 217, isFollowing: true},
    {id: '34', name: 'gymrat_official', emoji: '🏋️', todayKcal: 2600, goalKcal: 2700, score: 96, badge: '🥈', todayScore: 884, isFollowing: false},
    {id: '35', name: '점심만다이어트', emoji: '🥙', todayKcal: 1450, goalKcal: 1600, score: 91, badge: '', todayScore: 33, isFollowing: false},
    {id: '36', name: '식이섬유러버', emoji: '🫘', todayKcal: 1200, goalKcal: 1500, score: 80, badge: '', todayScore: 19, isFollowing: true},
    {id: '37', name: '바디프로필준비', emoji: '📷', todayKcal: 1900, goalKcal: 2000, score: 95, badge: '🥇', todayScore: 1204, isFollowing: false},
    {id: '38', name: '저녁굶기챌', emoji: '🌙', todayKcal: null, goalKcal: 1300, score: null, badge: '', todayScore: 62, isFollowing: false},
    {id: '39', name: '영양사지망생', emoji: '🩺', todayKcal: 1650, goalKcal: 1800, score: 92, badge: '', todayScore: 156, isFollowing: true},
    {id: '40', name: 'eatclean_daily', emoji: '🥝', todayKcal: 1350, goalKcal: 1600, score: 84, badge: '', todayScore: 78, isFollowing: false},
    {id: '41', name: '탄수화물끊기', emoji: '🍞', todayKcal: 1100, goalKcal: 1400, score: 79, badge: '', todayScore: 41, isFollowing: false},
    {id: '42', name: '간헐적단식왕', emoji: '⏰', todayKcal: 1800, goalKcal: 1800, score: 100, badge: '🥇', todayScore: 327, isFollowing: true},
    {id: '43', name: '가정식챌린지', emoji: '🍱', todayKcal: null, goalKcal: 1900, score: null, badge: '', todayScore: 87, isFollowing: false},
    {id: '44', name: 'protein_queen', emoji: '👑', todayKcal: 2000, goalKcal: 2100, score: 95, badge: '🥈', todayScore: 445, isFollowing: false},
    {id: '45', name: '식단사진찍기', emoji: '🤳', todayKcal: 1580, goalKcal: 1700, score: 93, badge: '', todayScore: 239, isFollowing: true},
    {id: '46', name: '두부마니아', emoji: '⬜', todayKcal: 1050, goalKcal: 1400, score: 75, badge: '', todayScore: 14, isFollowing: false},
    {id: '47', name: '런닝크루서울', emoji: '🏙️', todayKcal: 2200, goalKcal: 2300, score: 96, badge: '', todayScore: 732, isFollowing: false},
    {id: '48', name: '소식좋아', emoji: '🌾', todayKcal: 900, goalKcal: 1200, score: 75, badge: '', todayScore: 23, isFollowing: false},
    {id: '49', name: '홈트레이닝', emoji: '🤸', todayKcal: 1700, goalKcal: 1800, score: 94, badge: '', todayScore: 188, isFollowing: true},
    {id: '50', name: '다이어트끝판왕', emoji: '🏆', todayKcal: 1500, goalKcal: 1600, score: 94, badge: '🥇', todayScore: 2103, isFollowing: false},
    {id: '51', name: '맛있는다이어트', emoji: '😋', todayKcal: null, goalKcal: 1750, score: null, badge: '', todayScore: 67, isFollowing: false},
    {id: '52', name: '철인3종준비', emoji: '🚵', todayKcal: 2800, goalKcal: 2900, score: 97, badge: '🥈', todayScore: 91, isFollowing: false},
    {id: '53', name: '하루한끼챌린지', emoji: '🍜', todayKcal: 1300, goalKcal: 1400, score: 93, badge: '', todayScore: 38, isFollowing: true},
    {id: '54', name: '글루텐프리', emoji: '🌽', todayKcal: 1150, goalKcal: 1500, score: 77, badge: '', todayScore: 52, isFollowing: false},
    {id: '55', name: 'diet_log_kr', emoji: '📊', todayKcal: 1600, goalKcal: 1800, score: 89, badge: '', todayScore: 614, isFollowing: false},
];

const DUMMY_SUGGESTED: Friend[] = [
    {id: '56', name: '헬시스냅', emoji: '📸', todayKcal: null, goalKcal: 1800, score: null, badge: '', todayScore: 312, isFollowing: false},
    {id: '57', name: '오늘도건강하게', emoji: '🌟', todayKcal: null, goalKcal: 1700, score: null, badge: '', todayScore: 89, isFollowing: false},
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchFollowing(): Promise<Friend[]> {
    await delay(300);
    return DUMMY_FOLLOWING;
}

export async function fetchFollowers(): Promise<Friend[]> {
    await delay(300);
    return DUMMY_FOLLOWERS;
}

export async function fetchSuggestedFriends(): Promise<Friend[]> {
    await delay(300);
    return DUMMY_SUGGESTED;
}
