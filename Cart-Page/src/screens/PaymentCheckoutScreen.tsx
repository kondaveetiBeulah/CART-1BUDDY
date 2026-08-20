import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  Easing,
  Dimensions,
} from 'react-native';
import type { Address, PaymentMethod } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  background: '#12131C',
  surface: '#1D1E28',
  accent: '#E6B43A',
  softHighlight: '#272936',
  textPrimary: '#FFFFFF',
  textMuted: '#8A8D9B',
  border: '#2A2C3A',
  error: '#FF5252',
  success: '#4CAF50',
  cardRadius: 16,
  pillRadius: 20,
};

const MOCK_ADDRESSES: Address[] = [
  { id: 'addr1', label: '🏠 Home', street: '42 Maple Avenue, Apt 3B', city: 'San Francisco, CA', pincode: '94102', isDefault: true },
  { id: 'addr2', label: '💼 Office', street: '555 Market Street, Floor 12', city: 'San Francisco, CA', pincode: '94105', isDefault: false },
  { id: 'addr3', label: "👫 Friend's Place", street: '18 Valencia Street', city: 'San Francisco, CA', pincode: '94110', isDefault: false },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'card', label: 'Visa Debit Card', subLabel: 'Ends in •••• 4829', icon: '💳', last4: '4829' },
  { id: 'pm2', type: 'card', label: 'Mastercard Credit', subLabel: 'Ends in •••• 1204', icon: '💳', last4: '1204' },
  { id: 'pm3', type: 'upi', label: 'Google Pay', subLabel: 'alex.johnson@okicici', icon: '🔗', upiId: 'alex.johnson@okicici' },
  { id: 'pm4', type: 'upi', label: 'PhonePe UPI', subLabel: 'alex@ybl', icon: '📱', upiId: 'alex@ybl' },
  { id: 'pm5', type: 'cod', label: 'Cash on Delivery', subLabel: 'Pay when order arrives', icon: '💵' },
];

// ─── AnimatedPressable ─────────────────────────────────────────────────────
interface AnimatedPressableProps {
  onPress: () => void;
  style?: object | object[];
  children: React.ReactNode;
  scaleDown?: number;
  disabled?: boolean;
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  onPress, style, children, scaleDown = 0.96, disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => { if (!disabled) Animated.spring(scale, { toValue: scaleDown, useNativeDriver: true, speed: 50 }).start(); };
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  return (
    <TouchableOpacity onPress={!disabled ? onPress : undefined} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={disabled ? 1 : 0.95}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

// ─── Gold Toggle ────────────────────────────────────────────────────────────
interface GoldToggleProps {
  value: boolean;
  onToggle: () => void;
  label: string;
  subLabel?: string;
}

const GoldToggle: React.FC<GoldToggleProps> = ({ value, onToggle, label, subLabel }) => {
  const slideAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const bgAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: value ? 1 : 0, useNativeDriver: true, speed: 30, bounciness: 10 }),
      Animated.timing(bgAnim, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [value]);
  const translateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const backgroundColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [COLORS.softHighlight, COLORS.accent] });
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
      <View style={toggleSt.row}>
        <View style={toggleSt.textContainer}>
          <Text style={toggleSt.label}>{label}</Text>
          {subLabel && <Text style={toggleSt.subLabel}>{subLabel}</Text>}
        </View>
        <Animated.View style={[toggleSt.track, { backgroundColor }]}>
          <Animated.View style={[toggleSt.thumb, { transform: [{ translateX }] }]} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const toggleSt = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textContainer: { flex: 1, marginRight: 12 },
  label: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  subLabel: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  track: { width: 48, height: 28, borderRadius: 14, justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});

// ─── Gold Radio ─────────────────────────────────────────────────────────────
const GoldRadio: React.FC<{ selected: boolean }> = ({ selected }) => {
  const scaleAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: selected ? 1 : 0, useNativeDriver: true, speed: 40, bounciness: 12 }).start();
  }, [selected]);
  return (
    <View style={radioSt.outer}>
      <Animated.View style={[radioSt.inner, { transform: [{ scale: scaleAnim }] }]} />
    </View>
  );
};

const radioSt = StyleSheet.create({
  outer: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
});

// ─── Processing Overlay ─────────────────────────────────────────────────────
const ProcessingOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const anim = (d: Animated.Value, delay: number) =>
        Animated.loop(Animated.sequence([
          Animated.delay(delay),
          Animated.spring(d, { toValue: -10, useNativeDriver: true, speed: 20, bounciness: 10 }),
          Animated.spring(d, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 10 }),
          Animated.delay(400),
        ]));
      anim(dot1, 0).start();
      anim(dot2, 150).start();
      anim(dot3, 300).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[procSt.overlay, { opacity: fadeAnim }]}>
      <View style={procSt.card}>
        <View style={procSt.dotsRow}>
          {[dot1, dot2, dot3].map((d, i) => (
            <Animated.View key={i} style={[procSt.dot, { transform: [{ translateY: d }] }]} />
          ))}
        </View>
        <Text style={procSt.text}>Processing Payment…</Text>
        <Text style={procSt.subText}>Please don't close this screen</Text>
      </View>
    </Animated.View>
  );
};

const procSt = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,18,0.88)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, minWidth: 220 },
  dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'flex-end', height: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent },
  text: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  subText: { color: COLORS.textMuted, fontSize: 12 },
});

// ─── Payment Success Modal ──────────────────────────────────────────────────
interface PaymentSuccessModalProps {
  visible: boolean;
  orderId: string;
  estimatedTime: string;
  onTrackOrder: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ visible, orderId, estimatedTime, onTrackOrder }) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardTranslateY = useRef(new Animated.Value(80)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      cardScale.setValue(0.7);
      cardTranslateY.setValue(80);
      checkScale.setValue(0);
      checkRotate.setValue(0);
      rippleScale.setValue(0);
      rippleOpacity.setValue(0.6);
      contentOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8, delay: 100 }),
        Animated.spring(cardTranslateY, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 6, delay: 100 }),
      ]).start(() => {
        Animated.parallel([
          Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 18, delay: 150 }),
          Animated.timing(checkRotate, { toValue: 1, duration: 400, easing: Easing.out(Easing.back(2)), useNativeDriver: true, delay: 150 }),
          Animated.timing(rippleScale, { toValue: 2.5, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true, delay: 200 }),
          Animated.timing(rippleOpacity, { toValue: 0, duration: 600, useNativeDriver: true, delay: 200 }),
        ]).start(() => {
          Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
            Animated.loop(Animated.sequence([
              Animated.timing(glowPulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
              Animated.timing(glowPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ])).start();
          });
        });
      });
    } else {
      glowPulse.stopAnimation();
    }
  }, [visible]);

  const checkRotateStyle = checkRotate.interpolate({ inputRange: [0, 1], outputRange: ['-45deg', '0deg'] });

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[modalSt.overlay, { opacity: overlayOpacity }]}>
        <Animated.View style={[modalSt.card, { transform: [{ scale: cardScale }, { translateY: cardTranslateY }] }]}>
          <View style={modalSt.checkContainer}>
            <Animated.View style={[modalSt.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
            <Animated.View style={[modalSt.glowRing, { transform: [{ scale: glowPulse }] }]} />
            <Animated.View style={[modalSt.checkCircle, { transform: [{ scale: checkScale }, { rotate: checkRotateStyle }] }]}>
              <Text style={modalSt.checkmark}>✓</Text>
            </Animated.View>
          </View>
          <Animated.View style={[modalSt.content, { opacity: contentOpacity }]}>
            <Text style={modalSt.successTitle}>Payment Successful!</Text>
            <Text style={modalSt.successSubtitle}>Your order has been confirmed and is being prepared 🍽️</Text>
            <View style={modalSt.orderInfoCard}>
              <View style={modalSt.orderInfoRow}>
                <View style={modalSt.orderInfoItem}>
                  <Text style={modalSt.orderInfoLabel}>Order ID</Text>
                  <Text style={modalSt.orderInfoValue}>{orderId}</Text>
                </View>
                <View style={modalSt.orderInfoDivider} />
                <View style={modalSt.orderInfoItem}>
                  <Text style={modalSt.orderInfoLabel}>Est. Delivery</Text>
                  <Text style={modalSt.orderInfoValue}>{estimatedTime}</Text>
                </View>
              </View>
            </View>
            <View style={modalSt.statusRow}>
              {['Confirmed', 'Preparing', 'On the Way', 'Delivered'].map((step, i) => (
                <View key={step} style={modalSt.statusItem}>
                  <View style={[modalSt.statusDot, i === 0 && modalSt.statusDotActive]}>
                    {i === 0 && <Text style={modalSt.statusDotText}>✓</Text>}
                  </View>
                  {i < 3 && <View style={[modalSt.statusLine, i === 0 && modalSt.statusLineActive]} />}
                  <Text style={[modalSt.statusLabel, i === 0 && modalSt.statusLabelActive]}>{step}</Text>
                </View>
              ))}
            </View>
            <AnimatedPressable onPress={onTrackOrder} style={modalSt.trackBtn}>
              <Text style={modalSt.trackBtnText}>📍 Track My Order</Text>
            </AnimatedPressable>
            <TouchableOpacity onPress={onTrackOrder} style={modalSt.backHomeBtn}>
              <Text style={modalSt.backHomeBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const modalSt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,10,18,0.92)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 28, width: '100%', maxWidth: 400, borderWidth: 1.5, borderColor: COLORS.accent + '50', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 30, elevation: 20, alignItems: 'center' },
  checkContainer: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ripple: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent + '30' },
  glowRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.accent + '60' },
  checkCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  checkmark: { fontSize: 36, color: COLORS.background, fontWeight: '900' },
  content: { width: '100%', alignItems: 'center' },
  successTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 0.3, marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  orderInfoCard: { backgroundColor: COLORS.softHighlight, borderRadius: 14, padding: 16, width: '100%', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  orderInfoRow: { flexDirection: 'row', alignItems: 'center' },
  orderInfoItem: { flex: 1, alignItems: 'center' },
  orderInfoDivider: { width: 1, height: 36, backgroundColor: COLORS.border, marginHorizontal: 12 },
  orderInfoLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  orderInfoValue: { fontSize: 15, fontWeight: '800', color: COLORS.accent, letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', width: '100%', marginBottom: 24, paddingHorizontal: 4 },
  statusItem: { flex: 1, alignItems: 'center', position: 'relative' },
  statusDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.softHighlight, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4, zIndex: 2 },
  statusDotActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  statusDotText: { fontSize: 11, color: COLORS.background, fontWeight: '800' },
  statusLine: { position: 'absolute', top: 11, left: '50%', right: '-50%', height: 2, backgroundColor: COLORS.border, zIndex: 1 },
  statusLineActive: { backgroundColor: COLORS.accent },
  statusLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },
  statusLabelActive: { color: COLORS.accent, fontWeight: '700' },
  trackBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, width: '100%', alignItems: 'center', marginBottom: 10, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  trackBtnText: { color: COLORS.background, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  backHomeBtn: { paddingVertical: 10, alignItems: 'center' },
  backHomeBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
});

// ─── PaymentCheckoutScreen ───────────────────────────────────────────────────
interface PaymentCheckoutScreenProps {
  grandTotal?: number;
  onBack?: () => void;
}

const PaymentCheckoutScreen: React.FC<PaymentCheckoutScreenProps> = ({ grandTotal = 42.76, onBack }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('addr1');
  const [selectedPayment, setSelectedPayment] = useState<string>('pm1');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const walletBalance = 12.5;
  const finalTotal = useWalletBalance ? Math.max(0, grandTotal - walletBalance) : grandTotal;

  const addressExpandAnim = useRef(new Animated.Value(0)).current;

  const handleAddressToggle = () => {
    const toValue = isAddressExpanded ? 0 : 1;
    setIsAddressExpanded(!isAddressExpanded);
    Animated.spring(addressExpandAnim, { toValue, useNativeDriver: false, speed: 14, bounciness: 4 }).start();
  };

  const generateOrderId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '#';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const generateETA = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 25);
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handlePay = () => {
    if (isProcessing || showSuccess) return;
    setIsProcessing(true);
    setOrderId(generateOrderId());
    setEstimatedTime(generateETA());
    setTimeout(() => { setIsProcessing(false); setShowSuccess(true); }, 1800);
  };

  const handleTrackOrder = () => { setShowSuccess(false); if (onBack) onBack(); };

  const addressMaxHeight = addressExpandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });
  const arrowRotation = addressExpandAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const selectedAddr = MOCK_ADDRESSES.find(a => a.id === selectedAddress)!;
  const selectedPM = MOCK_PAYMENT_METHODS.find(p => p.id === selectedPayment)!;

  const paymentGroups = [
    { label: '💳 Saved Cards', methods: MOCK_PAYMENT_METHODS.filter(p => p.type === 'card') },
    { label: '🔗 UPI', methods: MOCK_PAYMENT_METHODS.filter(p => p.type === 'upi') },
    { label: '💵 Other', methods: MOCK_PAYMENT_METHODS.filter(p => p.type === 'cod') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackBtn}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Summary Banner */}
        <View style={styles.summaryBanner}>
          <View>
            <Text style={styles.summaryLabel}>Order Total</Text>
            <Text style={styles.summaryAmount}>${grandTotal.toFixed(2)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.summaryMethodLabel}>{selectedPM.icon} {selectedPM.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11 }}>🔒</Text>
              <Text style={styles.secureText}>256-bit SSL Encrypted</Text>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleAddressToggle} activeOpacity={0.8} style={styles.addressHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={styles.goldPin}><Text style={{ fontSize: 20 }}>📍</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressHeaderLabel}>Delivering to</Text>
                <Text style={styles.addressHeaderValue}>{selectedAddr.label}</Text>
                <Text style={styles.addressHeaderStreet} numberOfLines={1}>{selectedAddr.street}</Text>
              </View>
            </View>
            <Animated.Text style={[styles.addressChevron, { transform: [{ rotate: arrowRotation }] }]}>▼</Animated.Text>
          </TouchableOpacity>
          <Animated.View style={[{ overflow: 'hidden' }, { maxHeight: addressMaxHeight }]}>
            <View style={styles.addressDivider} />
            {MOCK_ADDRESSES.map(addr => (
              <TouchableOpacity key={addr.id} onPress={() => { setSelectedAddress(addr.id); handleAddressToggle(); }}
                style={[styles.addressOption, selectedAddress === addr.id && styles.addressOptionSelected]}>
                <GoldRadio selected={selectedAddress === addr.id} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressOptionLabel}>{addr.label}</Text>
                  <Text style={styles.addressOptionStreet}>{addr.street}</Text>
                  <Text style={styles.addressOptionCity}>{addr.city} · {addr.pincode}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addAddressBtn}>
              <Text style={styles.addAddressBtnText}>+ Add New Address</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentGroups.map(group => (
            <View key={group.label} style={styles.paymentGroup}>
              <Text style={styles.paymentGroupLabel}>{group.label}</Text>
              {group.methods.map((method, index) => (
                <TouchableOpacity key={method.id} onPress={() => setSelectedPayment(method.id)} activeOpacity={0.8}
                  style={[styles.paymentMethodRow, selectedPayment === method.id && styles.paymentMethodRowSelected, index < group.methods.length - 1 && { marginBottom: 8 }]}>
                  <GoldRadio selected={selectedPayment === method.id} />
                  <Text style={{ fontSize: 22 }}>{method.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                    {method.subLabel && <Text style={styles.paymentMethodSub}>{method.subLabel}</Text>}
                  </View>
                  {selectedPayment === method.id && (
                    <View style={styles.paymentMethodBadge}>
                      <Text style={styles.paymentMethodBadgeText}>Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Wallet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet & Preferences</Text>
          <GoldToggle value={useWalletBalance} onToggle={() => setUseWalletBalance(v => !v)}
            label="Use Wallet Balance"
            subLabel={`Available: $${walletBalance.toFixed(2)} — ${useWalletBalance ? `Saves $${Math.min(walletBalance, grandTotal).toFixed(2)}` : 'Tap to apply'}`} />
          <View style={styles.walletDivider} />
          <GoldToggle value={saveCard} onToggle={() => setSaveCard(v => !v)}
            label="Save card for future payments" subLabel="Your data is encrypted and secure" />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Items Total</Text>
            <Text style={styles.summaryRowValue}>${grandTotal.toFixed(2)}</Text>
          </View>
          {useWalletBalance && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>Wallet Applied</Text>
              <Text style={[styles.summaryRowValue, { color: '#4CAF50' }]}>−${Math.min(walletBalance, grandTotal).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>You Pay</Text>
            <Text style={styles.summaryTotalValue}>${finalTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By placing this order, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text></Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Pay Button */}
      <View style={styles.stickyBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.stickyPayLabel}>You Pay</Text>
          <Text style={styles.stickyPayAmount}>${finalTotal.toFixed(2)}</Text>
          {useWalletBalance && <Text style={styles.stickyWalletSave}>Wallet: −${Math.min(walletBalance, grandTotal).toFixed(2)}</Text>}
        </View>
        <AnimatedPressable onPress={handlePay} style={[styles.payBtn, isProcessing && styles.payBtnDisabled]} scaleDown={0.96} disabled={isProcessing}>
          <Text style={styles.payBtnText}>{isProcessing ? 'Processing…' : `Pay $${finalTotal.toFixed(2)}`}</Text>
        </AnimatedPressable>
      </View>

      <ProcessingOverlay visible={isProcessing} />
      <PaymentSuccessModal visible={showSuccess} orderId={orderId} estimatedTime={estimatedTime} onTrackOrder={handleTrackOrder} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerBackBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  headerBackIcon: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.3 },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  summaryBanner: { marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.accent + '18', borderRadius: COLORS.cardRadius, borderWidth: 1.5, borderColor: COLORS.accent + '60', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: COLORS.accent, fontWeight: '600', marginBottom: 2 },
  summaryAmount: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },
  summaryMethodLabel: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 4 },
  secureText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  section: { marginHorizontal: 16, marginTop: 14, backgroundColor: COLORS.surface, borderRadius: COLORS.cardRadius, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14, letterSpacing: 0.2 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goldPin: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.accent + '20', borderWidth: 1.5, borderColor: COLORS.accent + '50', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addressHeaderLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginBottom: 1 },
  addressHeaderValue: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  addressHeaderStreet: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  addressChevron: { fontSize: 12, color: COLORS.textMuted, marginLeft: 8 },
  addressDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  addressOption: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: COLORS.softHighlight, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  addressOptionSelected: { borderColor: COLORS.accent + '80', backgroundColor: COLORS.accent + '10' },
  addressOptionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  addressOptionStreet: { fontSize: 13, color: COLORS.textMuted, marginBottom: 1 },
  addressOptionCity: { fontSize: 12, color: COLORS.textMuted },
  addAddressBtn: { marginTop: 4, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.accent + '60', borderRadius: 10 },
  addAddressBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  paymentGroup: { marginBottom: 16 },
  paymentGroupLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.softHighlight, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  paymentMethodRowSelected: { borderColor: COLORS.accent + '80', backgroundColor: COLORS.accent + '0D' },
  paymentMethodLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  paymentMethodSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  paymentMethodBadge: { backgroundColor: COLORS.accent + '30', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.accent + '60' },
  paymentMethodBadgeText: { color: COLORS.accent, fontSize: 11, fontWeight: '700' },
  walletDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryRowLabel: { color: COLORS.textMuted, fontSize: 14 },
  summaryRowValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  summaryTotalValue: { fontSize: 20, fontWeight: '900', color: COLORS.accent },
  termsContainer: { marginHorizontal: 24, marginTop: 16 },
  termsText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: COLORS.accent, fontWeight: '600' },
  stickyBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 14, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 16 },
  stickyPayLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  stickyPayAmount: { fontSize: 22, fontWeight: '900', color: COLORS.accent, lineHeight: 26 },
  stickyWalletSave: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  payBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 8, minWidth: 160 },
  payBtnDisabled: { opacity: 0.7, shadowOpacity: 0.1 },
  payBtnText: { color: COLORS.background, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});

export default PaymentCheckoutScreen;
