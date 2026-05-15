import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, MessageSquare, Pause, SkipBack, SkipForward, Volume2, Maximize } from 'lucide-react-native';

export default function FusionEngineView() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-6 flex-col space-y-4">
          <View>
            <Text className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Engine Output</Text>
            <Text className="text-xs text-slate-500 mt-1 font-mono">ID: clinical_interview_042.mp4</Text>
          </View>
          <View className="self-start px-3 py-1 rounded-md border border-emerald-200 bg-emerald-50">
            <Text className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Analysis Complete</Text>
          </View>
        </View>

        <View className="space-y-6">
          <View className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative aspect-video flex-col justify-end">
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200&h=675" }}
              className="absolute inset-0 w-full h-full opacity-50"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-slate-900/50" />
            
            <View className="p-4 z-10 w-full">
              <View className="w-full h-1 bg-slate-700 rounded-full mb-4 relative overflow-hidden">
                <View className="absolute top-0 left-0 h-full bg-slate-300 rounded-full w-1/3" />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <SkipBack size={16} color="#cbd5e1" />
                  <Pause size={20} color="#cbd5e1" />
                  <SkipForward size={16} color="#cbd5e1" />
                  <View className="flex-row items-center space-x-2 ml-4">
                    <Volume2 size={16} color="#cbd5e1" />
                  </View>
                </View>
                <Maximize size={16} color="#cbd5e1" />
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Temporal State Heatmap</Text>
            <View className="h-4 w-full rounded-md overflow-hidden flex-row border border-slate-200">
              <View className="h-full bg-emerald-500" style={{ flex: 0.25 }} />
              <View className="h-full bg-slate-400" style={{ flex: 0.33 }} />
              <View className="h-full bg-amber-500" style={{ flex: 0.16 }} />
              <View className="h-full bg-slate-400" style={{ flex: 0.26 }} />
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-xs font-mono text-slate-400">0:00</Text>
              <Text className="text-xs font-mono text-slate-400">1:00</Text>
              <Text className="text-xs font-mono text-slate-400">2:00</Text>
              <Text className="text-xs font-mono text-slate-400">3:00</Text>
              <Text className="text-xs font-mono text-slate-400">4:12</Text>
            </View>
          </View>

          <View className="flex-row justify-between space-x-4 mt-6">
            <View className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-2 h-2 rounded-sm bg-slate-400 mr-2" />
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acoustic Analysis</Text>
              </View>
              <View className="h-24 flex-row items-end justify-between">
                {[...Array(12)].map((_, i) => (
                  <View 
                    key={i} 
                    className="w-1.5 bg-slate-200 rounded-t-sm" 
                    style={{ height: `${Math.max(10, Math.random() * 100)}%`, backgroundColor: i === 4 ? '#0f172a' : '#e2e8f0' }}
                  />
                ))}
              </View>
            </View>

            <View className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-2 h-2 rounded-sm bg-slate-900 mr-2" />
                <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kinematic</Text>
              </View>
              <View className="h-24 bg-slate-50 rounded-md border border-slate-200 items-center justify-center relative overflow-hidden">
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&q=80&w=300&h=300" }}
                  className="absolute inset-0 w-full h-full opacity-40"
                />
                <View className="absolute top-1 left-1 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                  <Text className="text-[10px] uppercase font-bold text-slate-700">State: Open</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm mt-6">
            <View className="mb-6 text-center border-b border-slate-100 pb-6 items-center">
              <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Assessment</Text>
              <Text className="text-2xl font-bold text-slate-900 leading-tight">Confident Engagement</Text>
            </View>

            <View className="items-center justify-center mb-8 relative">
              <View className="items-center justify-center w-32 h-32 rounded-full border-8 border-slate-100">
                 {/* Fake circular progress */}
                 <View className="absolute w-32 h-32 rounded-full border-8 border-slate-900 border-l-transparent border-b-transparent transform rotate-45" />
                 <Text className="text-3xl font-bold text-slate-900 tracking-tight">88%</Text>
                 <Text className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">Reliability</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Synthesized Report</Text>
              <Text className="text-sm text-slate-600 leading-relaxed">
                The subject displays an open kinematic posture and consistent visual fixation, correlating strongly with confidence. Acoustic analysis confirms a stable frequency with positive inflections. A brief stress indicator was detected at 02:15, accompanied by micro-expressions of hesitation, but the baseline state remains highly positive and engaged.
              </Text>
            </View>

            <View className="space-y-3 pt-6 border-t border-slate-100">
              <TouchableOpacity className="w-full flex-row items-center justify-center py-3 px-4 rounded-lg bg-slate-900">
                <Download size={16} color="#ffffff" className="mr-2" />
                <Text className="text-sm font-semibold text-white">Export Data (.CSV)</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full flex-row items-center justify-center py-3 px-4 border border-slate-300 rounded-lg bg-white mt-3">
                <MessageSquare size={16} color="#334155" className="mr-2" />
                <Text className="text-sm font-semibold text-slate-700">Flag False Positive</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
