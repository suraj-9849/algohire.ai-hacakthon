'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CandidateSummary } from '@/lib/gemini-service';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  Sparkles,
  Check
} from 'lucide-react';

interface AISummaryPanelProps {
  summary: CandidateSummary;
  candidateName: string;
  isLoading?: boolean;
}

export function AISummaryPanel({ summary, candidateName, isLoading }: AISummaryPanelProps) {

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full bg-gray-50 p-6 rounded-r-lg border-l border-gray-200"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating AI Summary...</h3>
            <p className="text-gray-600">Analyzing candidate notes with AI</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full bg-gray-50 p-6 rounded-r-lg overflow-y-auto border-l border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">AI Summary</h3>
          <p className="text-sm text-gray-600">{candidateName}</p>
        </div>
      </div>

      <Card className="p-4 mb-4 bg-white border-gray-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Overall Assessment</h4>
            <p className="text-gray-700 leading-relaxed">{summary.overallAssessment}</p>
          </div>
        </div>
      </Card>


    </motion.div>
  );
} 