
import { View, Text } from 'react-native';
import { verifyInstallation } from 'nativewind';

export default function Testverify() {
    verifyInstallation();

    return (
        <View className="flex-1 justify-center items-center bg-purple-500">
            <View className="w-32 h-32 bg-red-500 rounded-full justify-center items-center">
                <Text className="text-white font-bold">It Works!</Text>
            </View>
            <Text className="mt-4 text-white">If you see a red circle and purple bg, NativeWind is active.</Text>
        </View>
    );
}
