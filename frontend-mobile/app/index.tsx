import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Video, Mic, UserSquare2, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeView() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="bg-white border-b border-slate-200">
          <View className="flex-row justify-between items-center h-16 px-4">
            <View className="flex-row items-center">
              <Activity size={24} color="#0f172a" />
              <Text className="ml-2 font-bold text-xl text-slate-900 tracking-wider uppercase">Trivex</Text>
            </View>
            <TouchableOpacity onPress={handleGetStarted} className="px-4 py-2">
              <Text className="text-slate-600 font-medium text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View className="flex-1 items-center justify-center py-20 px-4 bg-white border-b border-slate-200">
          <View className="items-center">
            <Text className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8 text-center">
              Clinical-Grade Behavioral Analysis
            </Text>
            <Text className="mt-4 text-lg text-slate-600 mb-12 text-center leading-relaxed">
              Trivex provides an enterprise platform for researchers and analysts to decode human micro-expressions, vocal intonations, and kinematic posture with multi-modal AI.
            </Text>
            <TouchableOpacity 
              onPress={handleGetStarted}
              className="flex-row items-center justify-center px-8 py-4 bg-slate-900 rounded-lg shadow-sm"
            >
              <Text className="text-base font-semibold text-white mr-2">
                Access Workspace
              </Text>
              <ChevronRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View className="bg-slate-50 py-16 px-4">
          <View className="items-center mb-12">
            <Text className="text-3xl font-bold text-slate-900 tracking-tight text-center">
              Multi-Modal Data Processing
            </Text>
            <Text className="mt-4 text-slate-500 text-base text-center leading-relaxed">
              Our secure infrastructure processes three distinct data streams simultaneously to deliver highly accurate behavioral profiles.
            </Text>
          </View>

          <View className="gap-8">
            <View className="bg-white p-8 rounded-lg border border-slate-200">
              <View className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                <Video size={24} color="#0f172a" />
              </View>
              <Text className="text-lg font-semibold text-slate-900 mb-3">Facial Micro-Expressions</Text>
              <Text className="text-slate-600 text-sm leading-relaxed">
                Detect and categorize transient facial movements that reveal genuine underlying emotions, ensuring objective evaluation metrics.
              </Text>
            </View>

            <View className="bg-white p-8 rounded-lg border border-slate-200">
              <View className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                <Mic size={24} color="#0f172a" />
              </View>
              <Text className="text-lg font-semibold text-slate-900 mb-3">Vocal Intonation</Text>
              <Text className="text-slate-600 text-sm leading-relaxed">
                Analyze pitch, cadence, and frequency variations in real-time to quantify confidence levels, stress patterns, and hesitations.
              </Text>
            </View>

            <View className="bg-white p-8 rounded-lg border border-slate-200">
              <View className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 border border-slate-200">
                <UserSquare2 size={24} color="#0f172a" />
              </View>
              <Text className="text-lg font-semibold text-slate-900 mb-3">Kinematic Posture</Text>
              <Text className="text-slate-600 text-sm leading-relaxed">
                Map and interpret skeletal posture and body language tracking to assess physical engagement, openness, and behavioral shifts.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
