import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/HomeStackNavigator';
import {useNotificationStore, Notification} from '../../store/notificationStore';
import {colors} from '../../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notification'>;

const TYPE_COLOR: Record<Notification['type'], string> = {
    order: colors.teal,
    point: colors.accent,
    coupon: colors.amber,
    friend: colors.accent3,
    community: colors.accent2,
};

function NotifItem({notif, onPress}: {notif: Notification; onPress: () => void}) {
    return (
        <TouchableOpacity
            style={[s.item, notif.read && s.itemRead]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[s.emojiWrap, {backgroundColor: `${TYPE_COLOR[notif.type]}14`}]}>
                <Text style={s.emoji}>{notif.emoji}</Text>
            </View>
            <View style={s.itemBody}>
                <Text style={[s.itemTitle, notif.read && s.itemTitleRead]}>{notif.title}</Text>
                <Text style={s.itemText} numberOfLines={2}>{notif.body}</Text>
                <Text style={s.itemTime}>{notif.time}</Text>
            </View>
            {!notif.read && <View style={s.unreadDot}/>}
        </TouchableOpacity>
    );
}

export function NotificationScreen({navigation}: Props) {
    const notifications = useNotificationStore((s) => s.notifications);
    const markRead = useNotificationStore((s) => s.markRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <SafeAreaView style={s.container} edges={['top']}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>←</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>알림</Text>
                <TouchableOpacity onPress={markAllRead} disabled={unreadCount === 0}>
                    <Text style={[s.allReadBtn, unreadCount === 0 && s.allReadBtnDim]}>
                        전체 읽음
                    </Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={s.empty}>
                    <Text style={s.emptyIcon}>🔔</Text>
                    <Text style={s.emptyTitle}>알림이 없어요</Text>
                    <Text style={s.emptySub}>새 소식이 오면 여기에 표시돼요</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
                    {unreadCount > 0 && (
                        <View style={s.unreadBanner}>
                            <Text style={s.unreadBannerText}>읽지 않은 알림 {unreadCount}개</Text>
                        </View>
                    )}
                    {notifications.map((notif) => (
                        <NotifItem
                            key={notif.id}
                            notif={notif}
                            onPress={() => markRead(notif.id)}
                        />
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.bg},

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {padding: 4},
    backText: {fontSize: 22, color: colors.text},
    headerTitle: {fontSize: 16, fontWeight: '600', color: colors.text},
    allReadBtn: {fontSize: 13, color: colors.accent},
    allReadBtnDim: {color: colors.sub},

    unreadBanner: {
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: 'rgba(184,255,78,0.06)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(184,255,78,0.15)',
    },
    unreadBannerText: {fontSize: 11, color: colors.accent},

    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    itemRead: {backgroundColor: 'transparent'},
    emojiWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    emoji: {fontSize: 20},
    itemBody: {flex: 1, gap: 3},
    itemTitle: {fontSize: 14, fontWeight: '600', color: colors.text},
    itemTitleRead: {fontWeight: '500', color: colors.sub},
    itemText: {fontSize: 12, color: colors.sub, lineHeight: 17},
    itemTime: {fontSize: 10, color: colors.border2, marginTop: 2},
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent,
        marginTop: 6,
        flexShrink: 0,
    },

    empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
    emptyIcon: {fontSize: 48, marginBottom: 4},
    emptyTitle: {fontSize: 16, fontWeight: '700', color: colors.text},
    emptySub: {fontSize: 13, color: colors.sub},
});
