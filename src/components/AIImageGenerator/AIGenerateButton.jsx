import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * AI 图像生成器生成按钮组件
 */
export const AIGenerateButton = ({
  isGenerating,
  isLoadingConfig,
  hasPrompt,
  onClick,
  t
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={isGenerating || !hasPrompt || isLoadingConfig}
      variant="default"
      className="w-32 py-2.5 px-4 text-sm font-bold justify-center"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {isGenerating ? (
        `${t('generating') || '生成中'}...`
      ) : (
        t('generate_image') || '生成图片'
      )}
    </Button>
  );
};

