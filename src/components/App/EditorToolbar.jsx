// EditorToolbar 组件 - 编辑器工具栏
import React from 'react';
import { Plus, Undo, Redo, Link, Unlink } from 'lucide-react';
import { Button } from '../ui/button';

export const EditorToolbar = ({ 
  onInsertClick, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  t, 
  // 分组功能相关
  cursorInVariable = false,
  currentGroupId = null,
  onSetGroup,
  onRemoveGroup
}) => {
  return (
    <div className="h-12 border-b backdrop-blur-sm flex items-center justify-between px-4 flex-shrink-0 z-20 dark:border-white/5 dark:bg-black/20 dark:text-gray-300 border-gray-200 bg-white/80">
      {/* Left: Undo/Redo & Grouping */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={onUndo} 
            disabled={!canUndo} 
            title={t('undo') || "撤消"} 
            variant="ghost"
            size="sm"
            className="px-2 py-1.5" 
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onRedo} 
            disabled={!canRedo} 
            title={t('redo') || "重做"} 
            variant="ghost"
            size="sm"
            className="px-2 py-1.5" 
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px dark:bg-white/10 bg-gray-300" />

        {/* Grouping Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">
            联动组:
          </span>
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => onSetGroup(num)}
              disabled={!cursorInVariable}
              className={`
                min-w-[28px] h-7 px-2 rounded-md text-xs font-bold transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                ${currentGroupId === num.toString()
                  ? 'dark:bg-orange-500/20 dark:text-orange-400 dark:ring-orange-500/50 bg-orange-100 text-orange-600 ring-1 ring-orange-300 shadow-sm'
                  : 'dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
              title={cursorInVariable ? `设置为联动组 ${num}` : '请将光标置于变量内'}
            >
              {num}
            </button>
          ))}
          
          {/* Remove Group Button */}
          {currentGroupId && (
            <button
              onClick={onRemoveGroup}
              disabled={!cursorInVariable}
              className="h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:ring-red-500/30 bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200"
              title="解除联动"
            >
              <Unlink size={12} />
              解除
            </button>
          )}
        </div>
      </div>

      {/* Right: Insert & Tools */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={onInsertClick} 
          variant="default"
        >
          <Plus className="h-4 w-4" />
          {t('insert')}
        </Button>
      </div>
    </div>
  );
};
