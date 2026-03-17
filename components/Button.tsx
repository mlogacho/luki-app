import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    isLoading?: boolean;
}

export const Button = ({ onPress, title, isLoading }: ButtonProps) => (
    <TouchableOpacity
        className="bg-luki-accent w-full p-4 rounded-lg items-center justify-center active:opacity-80 mt-2 shadow-lg shadow-luki-accent/20"
        onPress={onPress}
        disabled={isLoading}
    >
        {isLoading ? (
            <ActivityIndicator color="#4A148C" />
        ) : (
            <Text className="text-luki-purple font-bold text-lg uppercase tracking-wider">
                {title}
            </Text>
        )}
    </TouchableOpacity>
);
