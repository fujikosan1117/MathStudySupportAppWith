/**
 * App.tsx — アプリケーションのエントリーポイント
 *
 * SafeAreaProvider で画面端の余白を管理し、
 * MainScreen をルートコンポーネントとして描画する。
 */
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MainScreen from './src/screens/MainScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <MainScreen />
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
