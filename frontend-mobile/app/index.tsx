import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Activity, Video, Mic, UserSquare2, ChevronRight, ChevronLeft,
  Brain, Cpu, Smartphone, Shield, FileText, LineChart, Users,
  Sun, Moon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Video,
    title: 'Facial Micro-Expressions',
    desc: 'Detect and categorize transient facial movements that reveal genuine underlying emotions, ensuring objective evaluation metrics.',
  },
  {
    icon: Mic,
    title: 'Vocal Intonation',
    desc: 'Analyze pitch, cadence, and frequency variations in real-time to quantify confidence levels, stress patterns, and hesitations.',
  },
  {
    icon: UserSquare2,
    title: 'Kinematic Posture',
    desc: 'Map and interpret skeletal posture and body language tracking to assess physical engagement, openness, and behavioral shifts.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform Accessibility',
    desc: 'Access the platform seamlessly across web and mobile ecosystems with our dedicated Expo app.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access Control',
    desc: 'Separation of administrator controls and standard investigator workspaces ensures secure data segregation.',
  },
  {
    icon: FileText,
    title: 'Detailed Performance Reports',
    desc: 'Generate comprehensive, audit-ready clinical and analytical PDF diagnostic assessments.',
    badge: 'Coming Soon',
  },
];

const useCases = [
  {
    icon: Activity,
    title: 'Clinical Diagnostics',
    tag: 'Clinical Systems',
    desc: 'Objective evaluation tools for clinical psychologists and therapists to quantify emotional trajectories and patient recovery states.',
  },
  {
    icon: LineChart,
    title: 'Research Analysis',
    tag: 'Academic Datasets',
    desc: 'Accelerating behavioral research, behavioral schema encoding, multi-modal signal collation, and automated database curation.',
  },
  {
    icon: Users,
    title: 'Enterprise HR',
    tag: 'HR Operations',
    desc: 'Streamlining talent assessment, corporate leadership development, stress evaluation safeguards, and professional training cycles.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeView() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [useCaseIndex, setUseCaseIndex] = useState(0);

  const handleGetStarted = () => router.push('/auth');

  const handlePrev = () =>
    setUseCaseIndex(i => (i === 0 ? useCases.length - 1 : i - 1));
  const handleNext = () =>
    setUseCaseIndex(i => (i === useCases.length - 1 ? 0 : i + 1));

  // ── Theme tokens ──
  const bg        = isDark ? '#020617' : '#ffffff';
  const bg2       = isDark ? '#0f172a' : '#f8fafc';
  const bg3       = isDark ? '#0f172a' : '#ffffff';
  const border    = isDark ? '#1e293b' : '#e2e8f0';
  const heading   = isDark ? '#f1f5f9' : '#0f172a';
  const sub       = isDark ? '#64748b' : '#64748b';
  const cardBg    = isDark ? '#1e293b' : '#ffffff';
  const iconBg    = isDark ? '#0f172a' : '#f8fafc';
  const teal      = '#0d9488';

  const CaseIcon = useCases[useCaseIndex].icon;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Navbar ── */}
        <View style={{ backgroundColor: bg, borderBottomWidth: 1, borderBottomColor: border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 64, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Activity size={22} color={teal} />
              <Text style={{ fontWeight: '800', fontSize: 18, color: heading, letterSpacing: 2, textTransform: 'uppercase' }}>TriVex</Text>
            </View>
            {/* Right: Theme toggle + Sign In */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: border, alignItems: 'center', justifyContent: 'center' }}
                activeOpacity={0.75}
              >
                {isDark
                  ? <Sun size={16} color="#f1f5f9" />
                  : <Moon size={16} color="#64748b" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGetStarted} style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderWidth: 1, borderColor: border, borderRadius: 8 }}>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600', fontSize: 13 }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={{ backgroundColor: bg, borderBottomWidth: 1, borderBottomColor: border, paddingVertical: 64, paddingHorizontal: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 34, fontWeight: '900', color: heading, textAlign: 'center', letterSpacing: -0.5, lineHeight: 42, marginBottom: 20 }}>
            Advanced Behavioral Intelligence Platform
          </Text>
          <Text style={{ fontSize: 16, color: sub, textAlign: 'center', lineHeight: 26, marginBottom: 40, maxWidth: 360 }}>
            TriVex provides an enterprise platform for researchers and analysts to decode human micro-expressions, vocal intonations, and kinematic posture with multimodal AI.
          </Text>
          <TouchableOpacity
            onPress={handleGetStarted}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 16, backgroundColor: teal, borderRadius: 10, gap: 8, shadowColor: teal, shadowOpacity: 0.3, shadowRadius: 12 }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#ffffff' }}>Access Workspace</Text>
            <ChevronRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ── Hybrid Technology ── */}
        <View style={{ backgroundColor: bg2, borderBottomWidth: 1, borderBottomColor: border, paddingVertical: 56, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: heading, textAlign: 'center', marginBottom: 8 }}>
            Our Core Hybrid Technology
          </Text>
          <Text style={{ fontSize: 14, color: sub, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 12 }}>
            We combine state-of-the-art Neural Networks for feature extraction with established Expert Systems for reliable decision making.
          </Text>

          <View style={{ gap: 16 }}>
            {/* Neural Networks */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: border }]}>
                <Cpu size={22} color={heading} />
              </View>
              <Text style={[styles.cardTitle, { color: heading }]}>Neural Networks</Text>
              <Text style={[styles.cardDesc, { color: sub }]}>
                Advanced deep learning models for high-fidelity extraction of facial expressions, vocal features, and posture data.
              </Text>
            </View>

            {/* Experta Rules Engine */}
            <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
              <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: border }]}>
                <Brain size={22} color={heading} />
              </View>
              <Text style={[styles.cardTitle, { color: heading }]}>Experta Rules Engine</Text>
              <Text style={[styles.cardDesc, { color: sub }]}>
                Integration of symbolic AI and expert rules for logical, accurate behavioral analysis and interpretation.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Features Grid ── */}
        <View style={{ backgroundColor: isDark ? '#020617' : '#f0fdfa', borderBottomWidth: 1, borderBottomColor: border, paddingVertical: 56, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: heading, textAlign: 'center', marginBottom: 8 }}>
            Comprehensive Analysis Features
          </Text>
          <Text style={{ fontSize: 14, color: sub, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 12 }}>
            TriVex delivers a full suite of analytical capabilities designed to meet high academic benchmarks and production-ready deployments.
          </Text>

          <View style={{ gap: 14 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <View key={i} style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
                  <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: border }]}>
                    <Icon size={20} color={heading} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <Text style={[styles.cardTitle, { color: heading, marginBottom: 0 }]}>{f.title}</Text>
                    {f.badge && (
                      <View style={{ backgroundColor: isDark ? '#0d9488' + '22' : '#f0fdfa', borderWidth: 1, borderColor: isDark ? teal + '55' : '#99f6e4', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardDesc, { color: sub }]}>{f.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Use Cases Carousel ── */}
        <View style={{ backgroundColor: bg2, borderBottomWidth: 1, borderBottomColor: border, paddingVertical: 56, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: heading, textAlign: 'center', marginBottom: 8 }}>
            Targeted Use Cases
          </Text>
          <Text style={{ fontSize: 14, color: sub, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 12 }}>
            Our technology serves professionals across academic, clinical, and corporate contexts.
          </Text>

          {/* Slide card */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border, minHeight: 200 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: border }]}>
                <CaseIcon size={20} color={teal} />
              </View>
              <View style={{ backgroundColor: isDark ? teal + '22' : '#f0fdfa', borderWidth: 1, borderColor: isDark ? teal + '55' : '#99f6e4', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: teal, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {useCases[useCaseIndex].tag}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: heading, marginBottom: 10 }}>
              {useCases[useCaseIndex].title}
            </Text>
            <Text style={{ fontSize: 14, color: sub, lineHeight: 22 }}>
              {useCases[useCaseIndex].desc}
            </Text>
          </View>

          {/* Carousel controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 4 }}>
            <TouchableOpacity
              onPress={handlePrev}
              style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: border, backgroundColor: cardBg }}
            >
              <ChevronLeft size={20} color={sub} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {useCases.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setUseCaseIndex(idx)}
                  style={{
                    height: 10,
                    width: idx === useCaseIndex ? 24 : 10,
                    borderRadius: 5,
                    backgroundColor: idx === useCaseIndex ? teal : (isDark ? '#334155' : '#e2e8f0'),
                  }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              style={{ padding: 10, borderRadius: 8, borderWidth: 1, borderColor: border, backgroundColor: cardBg }}
            >
              <ChevronRight size={20} color={sub} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={{ backgroundColor: bg, borderTopWidth: 1, borderTopColor: border, paddingVertical: 32, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color={teal} />
            <Text style={{ fontWeight: '800', color: heading, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>TriVex</Text>
          </View>
          <Text style={{ fontSize: 11, color: sub }}>
            © {new Date().getFullYear()} TriVex Systems. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
});

