import { Minus, Square, X, Copy } from "lucide-react";
import { WindowMinimise, WindowToggleMaximise, Quit, WindowIsMaximised } from "../../wailsjs/runtime/runtime";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function WindowControls() {
    const [isMaximized, setIsMaximized] = useState(false);

    // 封装：直接查询底层窗口状态并更新
    const checkStatus = async () => {
        const res = await WindowIsMaximised();
        setIsMaximized(res);
    };

    useEffect(() => {
        // 1. 初始化检查
        checkStatus();

        // 2. 方案 A: 监听 Wails 自定义事件 (如果它工作)
        // const unmount = EventsOn("wails:window-maximized", ...) // 你之前的写法

        // 3. 方案 B (补丁): 监听窗口 Resize 
        // 无论是 Win+↑ 还是拖动，窗口尺寸都会变，这会强制触发状态检查
        window.addEventListener("resize", checkStatus);

        return () => {
            window.removeEventListener("resize", checkStatus);
        };
    }, []);

    const handleToggle = async () => {
        await WindowToggleMaximise();
        // 点击后立即检测一次
        setTimeout(checkStatus, 50);
    };

    return (
        <div 
            className="flex items-center gap-0 relative z-[60]" 
            style={{ "--wails-draggable": "none" } as any}
        >
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-10 text-muted-foreground hover:text-foreground rounded-none" 
                onClick={() => WindowMinimise()}
            >
                <Minus className="w-4 h-4" />
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-10 text-muted-foreground hover:text-foreground rounded-none" 
                onClick={handleToggle}
            >
                {/* 根据状态切换图标 */}
                {isMaximized ? (
                    <Copy className="w-3 h-3 rotate-90" /> 
                ) : (
                    <Square className="w-3 h-3" />
                )}
            </Button>

            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-10 text-muted-foreground hover:bg-destructive hover:text-white rounded-none" 
                onClick={() => Quit()}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}