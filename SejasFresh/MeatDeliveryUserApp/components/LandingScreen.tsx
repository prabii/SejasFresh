import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ onFinish }: { onFinish?: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Optional: call onFinish after animation
      if (onFinish) setTimeout(onFinish, 800);
    });
  }, [scaleAnim, opacityAnim, onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/landing-screen-bg.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={1}
      />
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require('../assets/images/sejas-logo.png')}
          style={[
            styles.logo,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
});
