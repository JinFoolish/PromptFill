import React, { useRef, useState, useCallback } from 'react';
import { DiscoveryView } from '../../components/HomePage/DiscoveryView';
import { AnimatedSlogan } from '../../components/HomePage/AnimatedSlogan';
import { useApp } from '../../contexts/AppContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { TAG_STYLES } from '../../constants/styles';

/**
 * 首页（发现视图）
 */
export const HomePage = () => {
  const app = useApp();
  const navigation = useAppNavigation();
  const posterScrollRef = useRef(null);
  const [isPosterAutoScrollPaused, setIsPosterAutoScrollPaused] = useState(false);
  
  const {
    templateFilter,
    setActiveTemplateId,
    setZoomedImage,
    language,
    setLanguage,
    isDarkMode,
    templateManagement,
    masonryStyleKey,
    currentMasonryStyle,
    zoomedImage,
    t,
  } = app;

  const displayTag = useCallback((tag) => {
    return app.t('tag_' + tag) || tag;
  }, [app]);

  return (
    <DiscoveryView
      filteredTemplates={templateFilter.discoveryTemplates}
      setActiveTemplateId={(id) => {
        setActiveTemplateId(id);
        navigation.navigateToTemplate(id);
      }}
      setDiscoveryView={() => {}} // 路由处理，不再需要
      setZoomedImage={setZoomedImage}
      posterScrollRef={posterScrollRef}
      setIsPosterAutoScrollPaused={setIsPosterAutoScrollPaused}
      currentMasonryStyle={currentMasonryStyle}
      masonryStyleKey={masonryStyleKey}
      AnimatedSlogan={AnimatedSlogan}
      isSloganActive={!zoomedImage}
      t={t}
      TAG_STYLES={TAG_STYLES}
      displayTag={displayTag}
      handleRefreshSystemData={templateManagement.handleRefreshSystemData}
      language={language}
      setLanguage={setLanguage}
      setIsSettingsOpen={navigation.navigateToSettings}
      isDarkMode={isDarkMode}
    />
  );
};

