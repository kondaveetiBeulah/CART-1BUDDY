import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import type {
  CartItem,
  CrossSellItem,
  DeliveryMode,
  TipAmount,
} from './types';

// ─── Constants ─────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// ─── Mock Data ──────────────────────────────────────────────────────────────
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'item1',
    name: 'Truffle Mushroom Burger',
    description: 'Brioche bun, aged cheddar, caramelised onion',
    price: 14.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop',
    customization: 'No pickles · Extra sauce',
    category: 'Main',
  },
  {
    id: 'item2',
    name: 'Loaded Waffle Fries',
    description: 'Seasoned, crispy with cheese dip',
    price: 6.49,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=120&h=120&fit=crop',
    customization: 'Extra crispy',
    category: 'Sides',
  },
  {
    id: 'item3',
    name: 'Smoked Chicken Wings',
    description: '8 pcs · BBQ glaze · Ranch dipping sauce',
    price: 11.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=120&h=120&fit=crop',
    customization: 'Honey BBQ · Bone-in',
    category: 'Starters',
  },
];

const CROSS_SELL_ITEMS: CrossSellItem[] = [
  {
    id: 'cs1',
    name: 'Chocolate Lava Cake',
    price: 5.99,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=120&h=120&fit=crop',
    tag: 'Bestseller',
  },
  {
    id: 'cs2',
    name: 'Craft Lemonade',
    price: 3.49,
    imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=120&h=120&fit=crop',
    tag: 'New',
  },
  {
    id: 'cs3',
    name: 'Garlic Bread Sticks',
    price: 4.29,
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=120&h=120&fit=crop',
  },
  {
    id: 'cs4',
    name: 'Onion Ring Tower',
    price: 5.49,
    imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=120&h=120&fit=crop',
    tag: 'Popular',
  },
];

const DELIVERY_FEE = 2.49;
const TAX_RATE = 0.08;

// ─── AnimatedPressable ───────────────────────────────────────────────────────
interface AnimatedPressableProps {
  onPress: () => void;
  style?: object | object[];
  children: React.ReactNode;
  scaleDown?: number;
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  onPress,
  style,
  children,
  scaleDown = 0.95,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleDown,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── CartItemRow ─────────────────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }),
    ]).start(() => onRemove(item.id));
  };

  return (
    <Animated.View
      style={[
        styles.cartItemContainer,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <View style={styles.cartItemHeader}>
          <Text style={styles.cartItemCategory}>{item.category}</Text>
          <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.removeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
        {item.customization && (
          <Text style={styles.cartItemCustomization}>{item.customization}</Text>
        )}
        <View style={styles.cartItemFooter}>
          <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              onPress={() => onDecrement(item.id)}
              style={[styles.stepperBtn, item.quantity === 1 && styles.stepperBtnDisabled]}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperCount}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onIncrement(item.id)}
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── CrossSellCard ───────────────────────────────────────────────────────────
interface CrossSellCardProps {
  item: CrossSellItem;
  isAdded: boolean;
  onAdd: (item: CrossSellItem) => void;
}

const CrossSellCard: React.FC<CrossSellCardProps> = ({ item, isAdded, onAdd }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleAdd = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }),
    ]).start(() => onAdd(item));
  };

  return (
    <Animated.View style={[styles.crossSellCard, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.crossSellImage} />
      {item.tag && (
        <View style={styles.crossSellTag}>
          <Text style={styles.crossSellTagText}>{item.tag}</Text>
        </View>
      )}
      <View style={styles.crossSellInfo}>
        <Text style={styles.crossSellName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.crossSellPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.crossSellAddBtn, isAdded && styles.crossSellAddBtnActive]}
        >
          <Text style={[styles.crossSellAddText, isAdded && styles.crossSellAddTextActive]}>
            {isAdded ? '✓ Added' : '+ Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── TipChip ─────────────────────────────────────────────────────────────────
interface TipChipProps {
  amount: TipAmount;
  selected: boolean;
  onSelect: (amount: TipAmount) => void;
}

const TipChip: React.FC<TipChipProps> = ({ amount, selected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }),
    ]).start();
    onSelect(selected ? 0 : amount);
  };

  React.useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: selected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [selected]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.softHighlight, COLORS.accent],
  });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.tipChip, { backgroundColor }]}>
        <Animated.Text
          style={[styles.tipChipText, { color: selected ? COLORS.background : COLORS.textPrimary }]}
        >
          {amount === 0 ? 'No Tip' : `$${amount}`}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── CartScreen ───────────────────────────────────────────────────────────────
interface CartScreenProps {
  onProceed?: (total: number) => void;
  onBack?: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ onProceed, onBack }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('express');
  const [selectedTip, setSelectedTip] = useState<TipAmount>(2);
  const [addedCrossSell, setAddedCrossSell] = useState<Set<string>>(new Set());
  const [crossSellItems, setCrossSellItems] = useState<CrossSellItem[]>(CROSS_SELL_ITEMS);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const segmentSlide = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // ── Calculations ────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? DELIVERY_FEE : 0;
  const taxes = (subtotal + deliveryFee) * TAX_RATE;
  const grandTotal = subtotal + deliveryFee + taxes + selectedTip - couponDiscount;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleIncrement = useCallback((id: string) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
    );
  }, []);

  const handleDecrement = useCallback((id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleCrossSellAdd = useCallback((crossItem: CrossSellItem) => {
    if (addedCrossSell.has(crossItem.id)) return;
    setAddedCrossSell(prev => new Set(prev).add(crossItem.id));
    setCartItems(prev => [
      ...prev,
      {
        id: crossItem.id,
        name: crossItem.name,
        description: 'Add-on item',
        price: crossItem.price,
        quantity: 1,
        imageUrl: crossItem.imageUrl,
        category: 'Add-on',
      },
    ]);
  }, [addedCrossSell]);

  const handleDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
    Animated.spring(segmentSlide, {
      toValue: mode === 'express' ? 0 : 1,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
      setCouponDiscount(subtotal * 0.1);
    } else if (couponCode.toUpperCase() === 'FLAT5') {
      setCouponApplied(true);
      setCouponDiscount(5);
    } else {
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  const handleProceed = () => {
    Animated.sequence([
      Animated.spring(buttonScaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
      Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }),
    ]).start(() => {
      if (onProceed) onProceed(grandTotal);
    });
  };

  const segmentLeft = segmentSlide.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  const tipOptions: TipAmount[] = [0, 2, 3, 5];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackBtn}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity
          onPress={() => setCartItems([])}
          style={styles.headerClearBtn}
        >
          <Text style={styles.headerClearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* ── Delivery Mode Selector ── */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentTrack}>
          <Animated.View style={[styles.segmentThumb, { left: segmentLeft }]} />
          <TouchableOpacity
            style={styles.segmentOption}
            onPress={() => handleDeliveryMode('express')}
          >
            <Text style={[styles.segmentText, deliveryMode === 'express' && styles.segmentTextActive]}>
              ⚡ Express 20–25 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.segmentOption}
            onPress={() => handleDeliveryMode('scheduled')}
          >
            <Text style={[styles.segmentText, deliveryMode === 'scheduled' && styles.segmentTextActive]}>
              🕐 Scheduled
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cart Items ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
          </Text>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartEmoji}>🛒</Text>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSub}>Add some delicious items!</Text>
            </View>
          ) : (
            cartItems.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
              />
            ))
          )}
        </View>

        {/* ── Cross-Sell Carousel ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ You Might Also Like</Text>
          <FlatList
            data={crossSellItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CrossSellCard
                item={item}
                isAdded={addedCrossSell.has(item.id)}
                onAdd={handleCrossSellAdd}
              />
            )}
            contentContainerStyle={styles.crossSellList}
          />
        </View>

        {/* ── Coupon Code ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎟 Promo Code</Text>
          <View style={styles.couponRow}>
            <View style={styles.couponInputWrapper}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter promo code..."
                placeholderTextColor={COLORS.textMuted}
                value={couponCode}
                onChangeText={text => {
                  setCouponCode(text);
                  setCouponApplied(false);
                  setCouponDiscount(0);
                }}
                autoCapitalize="characters"
              />
              {couponApplied && (
                <Text style={styles.couponCheckmark}>✓</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleApplyCoupon}
              style={[styles.couponApplyBtn, couponApplied && styles.couponAppliedBtn]}
            >
              <Text style={styles.couponApplyText}>
                {couponApplied ? 'Applied!' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
          {couponApplied && (
            <Text style={styles.couponSaveText}>
              🎉 You saved ${couponDiscount.toFixed(2)} with code "{couponCode}"
            </Text>
          )}
          <Text style={styles.couponHint}>Try: SAVE10 or FLAT5</Text>
        </View>

        {/* ── Tip Selection ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💝 Tip Your Rider</Text>
          <Text style={styles.tipSubText}>100% of the tip goes to your delivery partner</Text>
          <View style={styles.tipRow}>
            {tipOptions.map(amount => (
              <TipChip
                key={amount}
                amount={amount}
                selected={selectedTip === amount}
                onSelect={setSelectedTip}
              />
            ))}
          </View>
        </View>

        {/* ── Notes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Order Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions for the restaurant?"
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* ── Bill Breakdown ── */}
        <View style={[styles.section, styles.billCard]}>
          <Text style={styles.sectionTitle}>🧾 Bill Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              Delivery Fee {deliveryMode === 'express' ? '(Express)' : '(Scheduled)'}
            </Text>
            <Text style={styles.billValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & Fees (8%)</Text>
            <Text style={styles.billValue}>${taxes.toFixed(2)}</Text>
          </View>
          {selectedTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Rider Tip</Text>
              <Text style={styles.billValue}>${selectedTip.toFixed(2)}</Text>
            </View>
          )}
          {couponDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Promo Discount</Text>
              <Text style={[styles.billValue, { color: COLORS.success }]}>
                −${couponDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Bottom spacing for sticky bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyBarInfo}>
          <Text style={styles.stickyBarLabel}>Total</Text>
          <Text style={styles.stickyBarTotal}>${grandTotal.toFixed(2)}</Text>
          <Text style={styles.stickyBarItems}>
            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
          </Text>
        </View>
        <AnimatedPressable
          onPress={handleProceed}
          style={styles.proceedBtn}
          scaleDown={0.97}
        >
          <Text style={styles.proceedBtnText}>Proceed to Checkout →</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackIcon: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  headerClearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.softHighlight,
  },
  headerClearText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },

  // Delivery Segment
  segmentWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: COLORS.pillRadius,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    height: 46,
    position: 'relative',
    overflow: 'hidden',
  },
  segmentThumb: {
    position: 'absolute',
    top: 3,
    width: '48%',
    bottom: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
  },
  segmentOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.background,
    fontWeight: '700',
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: COLORS.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  // Empty Cart
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCartEmoji: { fontSize: 48 },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptyCartSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Cart Item
  cartItemContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: COLORS.softHighlight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartItemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  cartItemCategory: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  removeIcon: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
    padding: 4,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  cartItemCustomization: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accent,
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softHighlight,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  stepperCount: {
    width: 28,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  // Cross-Sell
  crossSellList: { paddingVertical: 4 },
  crossSellCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: COLORS.softHighlight,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  crossSellImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.border,
  },
  crossSellTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  crossSellTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.background,
  },
  crossSellInfo: { padding: 10 },
  crossSellName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    minHeight: 34,
  },
  crossSellPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: 8,
  },
  crossSellAddBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  crossSellAddBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  crossSellAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  crossSellAddTextActive: {
    color: COLORS.background,
  },

  // Coupon
  couponRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softHighlight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  couponInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    letterSpacing: 1,
  },
  couponCheckmark: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '800',
  },
  couponApplyBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponAppliedBtn: {
    backgroundColor: COLORS.success,
  },
  couponApplyText: {
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 13,
  },
  couponSaveText: {
    marginTop: 10,
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  couponHint: {
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 12,
  },

  // Tip
  tipSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: COLORS.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  tipChipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Notes
  notesInput: {
    backgroundColor: COLORS.softHighlight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },

  // Bill
  billCard: {
    borderColor: COLORS.accent + '40',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  billTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  billTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 0.5,
  },

  // Sticky Bar
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  stickyBarInfo: {
    flex: 1,
  },
  stickyBarLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  stickyBarTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.accent,
    lineHeight: 26,
  },
  stickyBarItems: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  proceedBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  proceedBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default CartScreen;
