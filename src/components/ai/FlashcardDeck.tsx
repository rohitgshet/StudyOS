import React, { useState } from 'react';
import { Flashcard } from '../../types';
import { Button } from '../common/Button';
import { useStudyData } from '../../context/StudyDataContext';
import { useToast } from '../common/Toast';
import { RotateCw, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards }) => {
  const { updateFlashcardMastery } = useStudyData();
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-3xl">
        No flashcards generated yet. Use the AI Assistant to generate a flashcard deck from your subjects or notes!
      </div>
    );
  }

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleRate = (mastery: Flashcard['mastery']) => {
    updateFlashcardMastery(currentCard.id, mastery);
    if (mastery === 'easy' || mastery === 'good') {
      try {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
      } catch {}
    }
    toast.info(`Marked as ${mastery.toUpperCase()}`);
    handleNext();
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Deck Progress Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className="font-mono">Reviews: {currentCard.reviewCount}</span>
      </div>
      <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#0071E3] to-[#F472B6] h-full rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Apple 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[280px] apple-glass rounded-3xl p-8 flex flex-col justify-between shadow-apple-glass dark:shadow-apple-glass-dark hover:border-[#0071E3]/40 cursor-pointer transition-all duration-300 relative select-none"
      >
        <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
          <span className="px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
            {isFlipped ? 'ANSWER / BACK' : 'QUESTION / FRONT'}
          </span>
          <span className="flex items-center gap-1 text-[#0071E3] dark:text-[#38BDF8] font-medium">
            <RotateCw className="w-3 h-3" /> Flip Card
          </span>
        </div>

        <div className="my-auto py-6 text-center">
          <p className="text-base sm:text-xl font-medium text-foreground leading-relaxed">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </div>

        <div className="text-center text-[11px] text-muted-foreground/60 font-mono">
          StudyOS Spaced Repetition Engine
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-2 animate-fade-in">
          <button
            onClick={() => handleRate('again')}
            className="p-3 rounded-2xl border border-[#FB7185]/30 bg-[#FFF5F7] dark:bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FDA4AF] text-xs font-semibold hover:bg-[#FCE7F0] transition-colors shadow-2xs"
          >
            Again
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="p-3 rounded-2xl border border-[#DEC5A6]/40 bg-[#F4ECE0]/60 dark:bg-white/[0.08] text-[#92400E] dark:text-[#FDE68A] text-xs font-semibold hover:bg-[#EBDDC9] transition-colors shadow-2xs"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate('good')}
            className="p-3 rounded-2xl border border-[#38BDF8]/30 bg-[#F0F9FF] dark:bg-[#38BDF8]/15 text-[#0284C7] dark:text-[#7DD3FC] text-xs font-semibold hover:bg-[#E0F2FE] transition-colors shadow-2xs"
          >
            Good
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="p-3 rounded-2xl border border-[#10B981]/30 bg-[#ECFDF5] dark:bg-[#10B981]/15 text-[#059669] dark:text-[#6EE7B7] text-xs font-semibold hover:bg-[#D1FAE5] transition-colors shadow-2xs"
          >
            Easy
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />} onClick={handlePrev}>
            Previous
          </Button>
          <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} onClick={handleNext}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
