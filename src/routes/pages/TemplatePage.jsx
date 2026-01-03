import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorView } from '../../components/App/EditorView';
import { useApp } from '../../contexts/AppContext';
import { INITIAL_TEMPLATES_CONFIG } from '../../data/templates';

/**
 * 模板详情页面
 */
export const TemplatePage = () => {
  const { id } = useParams();
  const app = useApp();
  const navigate = useNavigate();
  const { setActiveTemplateId, activeTemplate, templates } = app;

  // 当路由参数变化时，更新 activeTemplateId
  useEffect(() => {
    if (id) {
      // 检查模板是否存在
      const templateExists = templates.find(t => t.id === id) || 
                            INITIAL_TEMPLATES_CONFIG.find(t => t.id === id);
      if (templateExists && id !== app.activeTemplateId) {
        setActiveTemplateId(id);
      } else if (!templateExists) {
        // 模板不存在，重定向到首页
        navigate('/');
      }
    }
  }, [id, setActiveTemplateId, app.activeTemplateId, templates, navigate]);

  // 如果模板不存在，显示加载或错误
  if (!activeTemplate || activeTemplate.id !== id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <EditorView />;
};

