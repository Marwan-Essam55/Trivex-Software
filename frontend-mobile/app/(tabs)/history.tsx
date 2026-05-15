import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CheckCircle2, Clock, Filter, Video } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HistoryView() {
  const router = useRouter();

  const handleViewDetails = (id: string) => {
    router.push('/(tabs)/fusion');
  };

  const historyData = [
    { id: '1', name: 'clinical_interview_042.mp4', date: '2026-04-19', emotion: 'Confident Engagement', score: '88%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '2', name: 'focus_group_session_b.mov', date: '2026-04-19', emotion: 'Pending', score: '-', status: 'Processing', thumbnail: '' },
    { id: '3', name: 'usability_test_v3.mp4', date: '2026-04-18', emotion: 'Neutral Baseline', score: '92%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '4', name: 'customer_feedback_01.avi', date: '2026-04-17', emotion: 'High Stress', score: '85%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150&h=100' },
    { id: '5', name: 'employee_onboarding.mp4', date: '2026-04-15', emotion: 'Active Listening', score: '94%', status: 'Completed', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=150&h=100' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Archive</Text>
          <Text className="text-sm text-slate-500 mt-1">Review historical multi-modal assessments.</Text>
        </View>

        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 relative justify-center">
            <View className="absolute left-3 z-10">
              <Search size={16} color="#94a3b8" />
            </View>
            <TextInput
              placeholder="Search ID or name..."
              placeholderTextColor="#94a3b8"
              className="pl-9 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </View>
          <TouchableOpacity className="flex-row items-center px-4 py-3 bg-white border border-slate-300 rounded-lg">
            <Filter size={16} color="#334155" className="mr-2" />
            <Text className="text-slate-700 text-sm font-semibold">Filter</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          {historyData.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => handleViewDetails(item.id)}
              className={`p-4 flex-row ${index !== historyData.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View className="mr-4">
                {item.thumbnail ? (
                  <Image 
                    source={{ uri: item.thumbnail }} 
                    className="h-16 w-24 rounded border border-slate-200"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-16 w-24 bg-slate-100 rounded border border-slate-200 items-center justify-center">
                    <Video size={20} color="#94a3b8" />
                  </View>
                )}
              </View>

              <View className="flex-1 justify-center space-y-1">
                <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>{item.name}</Text>
                
                <View className="flex-row items-center justify-between mt-1">
                  <View className={`px-2 py-0.5 rounded border ${
                    item.emotion === 'Confident Engagement' ? 'bg-emerald-50 border-emerald-200' :
                    item.emotion === 'Pending' ? 'bg-slate-50 border-slate-200' :
                    item.emotion === 'High Stress' ? 'bg-amber-50 border-amber-200' :
                    'bg-indigo-50 border-indigo-200'
                  }`}>
                    <Text className={`text-[10px] font-semibold ${
                      item.emotion === 'Confident Engagement' ? 'text-emerald-700' :
                      item.emotion === 'Pending' ? 'text-slate-600' :
                      item.emotion === 'High Stress' ? 'text-amber-700' :
                      'text-indigo-700'
                    }`}>{item.emotion}</Text>
                  </View>
                  <Text className="text-xs font-mono font-semibold text-slate-900">{item.score}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-1.5">
                  <Text className="text-xs font-mono text-slate-500">{item.date}</Text>
                  <View className="flex-row items-center">
                    {item.status === 'Completed' ? <CheckCircle2 size={12} color="#047857" className="mr-1" /> : <Clock size={12} color="#334155" className="mr-1" />}
                    <Text className="text-xs font-semibold text-slate-600">{item.status}</Text>
                  </View>
                </View>

              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
