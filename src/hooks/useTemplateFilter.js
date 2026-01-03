// 模板过滤 Hook：处理模板的搜索、标签过滤、语言过滤和排序
import { useMemo, useCallback } from 'react';
import { getLocalized } from '../utils/helpers';

/**
 * 模板过滤 Hook
 */
export const useTemplateFilter = ({
  templates,
  searchQuery,
  selectedTags,
  language,
  sortOrder,
  randomSeed
}) => {
  // Base filtered templates (by search and language)
  const baseFilteredTemplates = useMemo(() => {
    return templates.filter(t => {
      // Search filter
      const templateName = getLocalized(t.name, language);
      const matchesSearch = !searchQuery || 
        templateName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 语言过滤：如果模板指定了语言，且不包含当前语言，则隐藏
      const templateLangs = t.language ? (Array.isArray(t.language) ? t.language : [t.language]) : ['cn', 'en'];
      const matchesLanguage = templateLangs.includes(language);
      
      return matchesSearch && matchesLanguage;
    });
  }, [templates, searchQuery, language]);

  // Discovery View templates (ignore tags, but respect search, language and sort)
  const discoveryTemplates = useMemo(() => {
    return [...baseFilteredTemplates].sort((a, b) => {
      const nameA = getLocalized(a.name, language);
      const nameB = getLocalized(b.name, language);
      switch(sortOrder) {
        case 'newest':
          return templates.indexOf(b) - templates.indexOf(a);
        case 'oldest':
          return templates.indexOf(a) - templates.indexOf(b);
        case 'a-z':
          return nameA.localeCompare(nameB, language === 'cn' ? 'zh-CN' : 'en');
        case 'z-a':
          return nameB.localeCompare(nameA, language === 'cn' ? 'zh-CN' : 'en');
        case 'random':
          const hashA = (a.id + randomSeed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const hashB = (b.id + randomSeed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return hashA - hashB;
        default:
          return 0;
      }
    });
  }, [baseFilteredTemplates, sortOrder, randomSeed, language, templates]);

  // Filter templates based on tags for sidebar
  const filteredTemplates = useMemo(() => {
    return discoveryTemplates.filter(t => {
      // Tag filter
      const matchesTags = selectedTags === "" || 
        (t.tags && t.tags.includes(selectedTags));
      return matchesTags;
    });
  }, [discoveryTemplates, selectedTags]);

  // 切换标签
  const toggleTag = useCallback((tag, setSelectedTags) => {
    setSelectedTags(prevTag => prevTag === tag ? "" : tag);
  }, []);

  return {
    baseFilteredTemplates,
    discoveryTemplates,
    filteredTemplates,
    toggleTag,
  };
};

