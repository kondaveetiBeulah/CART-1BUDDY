import React, { useState, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, StatusBar } from 'react-native';
import CartScreen from './src/screens/CartScreen';
import PaymentCheckoutScreen from './src/screens/PaymentCheckoutScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Screen = 'cart' | 'checkout';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('cart');
  const [grandTotal, setGrandTotal] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateTo = (screen: Screen, total?: number) => {
    if (total !== undefined) setGrandTotal(total);
    const direction = screen === 'checkout' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    slideAnim.setValue(direction);
    setCurrentScreen(screen);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 14,
      bounciness: 0,
    }).start();
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#12131C" />
        <Animated.View
          style={[styles.screenWrapper, { transform: [{ translateX: slideAnim }] }]}
        >
          {currentScreen === 'cart' ? (
            <CartScreen
              onProceed={(total) => navigateTo('checkout', total)}
              onBack={() => {}}
            />
          ) : (
            <PaymentCheckoutScreen
              grandTotal={grandTotal}
              onBack={() => navigateTo('cart')}
            />
          )}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#12131C',
  },
  screenWrapper: {
    flex: 1,
  },
});
