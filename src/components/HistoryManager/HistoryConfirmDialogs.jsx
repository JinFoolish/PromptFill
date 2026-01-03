import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

/**
 * 历史记录确认对话框组件
 */
export const HistoryConfirmDialogs = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  showClearAllConfirm,
  setShowClearAllConfirm,
  onDeleteRecord,
  onClearAll,
  t
}) => {
  return (
    <>
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_record') || '确认删除'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_delete_record_message') || '确定要删除这条记录吗？此操作无法撤销。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || '取消'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteRecord(showDeleteConfirm)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t('delete') || '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Modal */}
      <AlertDialog open={showClearAllConfirm} onOpenChange={(open) => !open && setShowClearAllConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_clear_all') || '确认清空全部'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_clear_all_message') || '确定要清空所有历史记录吗？此操作无法撤销。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || '取消'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClearAll}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t('clear_all') || '清空全部'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

