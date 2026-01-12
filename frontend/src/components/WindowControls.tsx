import { Minus, Square, X } from "lucide-react";
import { WindowMinimise, WindowToggleMaximise, Quit } from "../../wailsjs/runtime/runtime";
import { Button } from "@/components/ui/button";

export function WindowControls() {
    return (
        <div className="flex items-center gap-1 relative z-[60]">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => WindowMinimise()}>
                <Minus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => WindowToggleMaximise()}>
                <Square className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground" onClick={() => Quit()}>
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
