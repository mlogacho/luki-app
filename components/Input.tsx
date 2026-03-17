import { TextInput, View, Text } from 'react-native';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    label?: string;
}

export const Input = ({ value, onChangeText, placeholder, secureTextEntry, label }: InputProps) => (
    <View className="mb-4 w-full">
        {label && <Text className="text-gray-300 mb-2 ml-1 font-medium">{label}</Text>}
        <TextInput
            className="bg-white/10 text-white p-4 rounded-lg border border-white/20 focus:border-luki-accent font-medium"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
        />
    </View>
);
