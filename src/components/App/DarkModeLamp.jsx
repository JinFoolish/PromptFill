// 暗色模式灯具效果组件
export const DarkModeLamp = ({
  isDarkMode,
  lampRotation,
  isLampHovered,
  isLampOn,
  setIsLampOn,
  handleLampMouseMove,
  setLampRotation,
  setIsLampHovered
}) => {
  if (!isDarkMode) return null;

  return (
    <>
      {/* 趣味设计：暗号模式下拉灯效果 */}
      <div 
        className={`hidden md:block fixed top-0 left-[-24px] z-[500] pointer-events-none transition-all duration-700 ease-in-out translate-y-0 opacity-100 delay-0`}
        style={{ width: '220px' }}
      >
        {/* 精准感应区：仅 32px 宽，处于灯体中心 */}
        <div 
          className="absolute left-[94px] top-0 h-full w-[32px] cursor-pointer pointer-events-auto z-10"
          onClick={() => setIsLampOn(!isLampOn)}
          onMouseMove={handleLampMouseMove}
          onMouseLeave={() => {
            setLampRotation(0);
            setIsLampHovered(false);
          }}
        />
        
        <div 
          style={{ 
            transformOrigin: '50% 0',
            transform: `rotate(${lampRotation}deg)`,
            transition: isLampHovered ? 'transform 0.1s ease-out' : 'transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <img src="/lamp.png" alt="Dark Mode Lamp" className={`w-full h-auto drop-shadow-2xl transition-all duration-500 ${!isLampOn ? 'brightness-50' : 'brightness-100'}`} />
        </div>
      </div>

      {/* 趣味设计：光照效果 */}
      <div 
        className={`hidden md:block fixed pointer-events-none transition-opacity ease-in-out ${
          isLampOn ? 'opacity-[0.28] duration-500 delay-[900ms]' : 'opacity-[0.05] duration-500 delay-0'
        }`}
        style={{
          left: '-286px',
          top: '58px',
          width: '815px',
          height: '731px',
          background: 'linear-gradient(180deg, #FFD09D 5%, rgba(216, 216, 216, 0) 100%)',
          filter: 'blur(286px)',
          mixBlendMode: 'lighten',
          zIndex: 499
        }}
      />
    </>
  );
};

