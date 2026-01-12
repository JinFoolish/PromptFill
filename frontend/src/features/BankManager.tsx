import { useEffect, useState } from "react";
import * as App from "@backend/App";
import { BankMap, BankItem, CategoryMap } from "@/types";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Plus, Trash2, Edit, Loader2, Save, Search, Settings2 } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";

export function BankManager() {
    const { language } = useLanguage();
    const t = translations[language];
    const [banks, setBanks] = useState<BankMap>({});
    const [categories, setCategories] = useState<CategoryMap>({});
    const [filteredBanks, setFilteredBanks] = useState<{ key: string, item: BankItem }[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<string | null>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Form state
    const [formData, setFormData] = useState<BankItem>({
        label: { cn: "", en: "" },
        category: "",
        options: []
    });
    const [formKey, setFormKey] = useState("");

    const loadBanks = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const bnks = await App.LoadBanks();
            setBanks(bnks || {});

            // @ts-ignore
            const cats = await App.LoadCategories();
            setCategories(cats || {});
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanks();
    }, []);

    useEffect(() => {
        let result = Object.entries(banks).map(([key, item]) => ({ key, item }));

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(({ key, item }) =>
                key.toLowerCase().includes(q) ||
                (item.label.cn && item.label.cn.toLowerCase().includes(q)) ||
                (item.label.en && item.label.en.toLowerCase().includes(q))
            );
        }

        if (selectedCategory !== "all") {
            result = result.filter(({ item }) => item.category === selectedCategory);
        }

        setFilteredBanks(result);
    }, [banks, searchQuery, selectedCategory]);

    // Use defined categories, verify which ones are actually used
    const usedCategories = Array.from(new Set(Object.values(banks).map(b => b.category || "other"))).sort();

    const getCategoryLabel = (catId: string) => {
        const cat = categories[catId];
        if (cat) {
            return cat.label[language] || cat.label['en'] || catId;
        }
        return catId;
    };

    const handleDelete = async (key: string) => {
        if (!confirm(t.deleteBankConfirm.replace("{key}", key))) return;
        try {
            // @ts-ignore
            await App.DeleteBank(key);
            await loadBanks();
        } catch (e) {
            console.error("Failed to delete", e);
            toast.error(t.failedToDeleteBank + ": " + e);
        }
    };

    const handleEdit = (key: string, item: BankItem) => {
        setEditingKey(key);
        setFormKey(key);
        setFormData(JSON.parse(JSON.stringify(item)));
        setOpen(true);
    };

    const handleCreate = () => {
        setEditingKey(null);
        setFormKey("");
        setFormData({
            label: { cn: "", en: "" },
            category: "other",
            options: [] // Empty options initially
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!formKey) {
            toast.warning(t.bankKeyRequired);
            return;
        }
        try {
            // @ts-ignore
            await App.EnsureBank(formKey, formData);
            setOpen(false);
            await loadBanks();
        } catch (e) {
            console.error("Failed to save", e);
            toast.error(t.failedToSaveBank + ": " + e);
        }
    };

    // Option management in form
    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { cn: "", en: "" }]
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const updateOption = (index: number, lang: string, val: string) => {
        setFormData(prev => {
            const newOpts = [...prev.options];
            newOpts[index] = { ...newOpts[index], [lang]: val };
            return { ...prev, options: newOpts };
        });
    };

    const colorMap: { [key: string]: string } = {
        blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        amber: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        rose: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100/80 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
        emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        violet: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100/80 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
        slate: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        default: "bg-muted/50 text-foreground border-border hover:bg-muted"
    };

    const getCategoryColor = (catId: string) => {
        const cat = categories[catId];
        if (cat && cat.color && colorMap[cat.color]) {
            return colorMap[cat.color];
        }
        return colorMap.default;
    };

    return (
        <div className="container mx-auto max-w-6xl space-y-8 p-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t.vocabularyBanks}</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage reusable variables for your prompt templates.</p>
                </div>

                <div className="flex flex-1 gap-2 w-full xl:max-w-2xl xl:px-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t.searchBanks}
                            className="pl-9 bg-muted/40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[160px] bg-muted/40">
                            <SelectValue placeholder={t.category} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.allCategories}</SelectItem>
                            {usedCategories.map(catId => (
                                <SelectItem key={catId} value={catId}>{getCategoryLabel(catId)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleCreate} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" /> {t.newBank}
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredBanks.map(({ key, item }, idx) => (
                        <BlurFade key={key} delay={0.02 * idx} inView>
                            <div className="break-inside-avoid">
                                <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-foreground/20">
                                    <CardHeader className="p-4 bg-muted/30 pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-semibold">{item.label[language] || item.label.cn || item.label.en}</CardTitle>
                                                <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground block w-fit">{key}</code>
                                            </div>
                                            <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(key, item)}>
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(key)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <Badge variant="outline" className={`text-[10px] font-medium border ${getCategoryColor(item.category)}`}>
                                                {getCategoryLabel(item.category)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="p-4 bg-card/50">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                            <span className="font-medium">{t.options}</span>
                                            <span className="bg-muted px-1.5 rounded-full text-[10px]">{item.options.length}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {item.options.slice(0, 5).map((opt, i) => (
                                                <div key={i} className="text-xs flex gap-2 items-center text-foreground/80">
                                                    <div className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="font-medium truncate">{language === 'cn' ? opt.cn : (opt.en || opt.cn)}</span>
                                                    {language === 'cn' && opt.en && <span className="text-muted-foreground/60 italic truncate max-w-[100px]">- {opt.en}</span>}
                                                    {language === 'en' && opt.cn !== opt.en && <span className="text-muted-foreground/60 italic truncate max-w-[100px]">- {opt.cn}</span>}
                                                </div>
                                            ))}
                                            {item.options.length > 5 && (
                                                <div className="text-[10px] text-muted-foreground pl-3 italic pt-0.5">
                                                    +{item.options.length - 5} more options
                                                </div>
                                            )}
                                            {item.options.length === 0 && (
                                                <div className="text-xs text-muted-foreground italic pl-3">No options defined</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </BlurFade>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-popover">
                    <DialogHeader className="p-6 border-b bg-muted/10">
                        <DialogTitle className="text-lg font-semibold tracking-tight">
                            {editingKey ? t.editBank : t.newBank}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t.uniqueKey}</Label>
                                    <Input
                                        value={formKey}
                                        onChange={e => setFormKey(e.target.value)}
                                        disabled={!!editingKey} // Cannot change key when editing
                                        className="font-mono text-sm bg-muted/50"
                                        placeholder="e.g. clothing_style"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t.category}</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={val => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(categories).map(catKey => (
                                                <SelectItem key={catKey} value={catKey}>
                                                    {categories[catKey].label[language] || categories[catKey].label['en']}
                                                </SelectItem>
                                            ))}
                                            {/* Allow keeping existing category if not in map */}
                                            {formData.category && !categories[formData.category] && (
                                                <SelectItem value={formData.category}>{formData.category}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t.labelCn}</Label>
                                    <Input
                                        value={formData.label.cn}
                                        onChange={e => setFormData({ ...formData, label: { ...formData.label, cn: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">{t.labelEn}</Label>
                                    <Input
                                        value={formData.label.en}
                                        onChange={e => setFormData({ ...formData, label: { ...formData.label, en: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-semibold">{t.options}</Label>
                                    <Button size="sm" variant="outline" onClick={addOption} className="gap-1 h-8 text-xs">
                                        <Plus className="h-3 w-3" /> {t.addOption}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2 items-center group">
                                            <span className="w-6 text-xs text-muted-foreground font-mono text-center">{i + 1}</span>
                                            <Input
                                                value={opt.cn}
                                                onChange={e => updateOption(i, 'cn', e.target.value)}
                                                placeholder="CN"
                                                className="h-8 text-sm"
                                            />
                                            <Input
                                                value={opt.en}
                                                onChange={e => updateOption(i, 'en', e.target.value)}
                                                placeholder="EN"
                                                className="h-8 text-sm"
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100" onClick={() => removeOption(i)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {formData.options.length === 0 && (
                                        <div className="text-center py-8 border border-dashed rounded-md text-muted-foreground text-sm">
                                            No options added yet. Click "Add Option" to start.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t bg-muted/10">
                        <Button variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="h-4 w-4" /> {t.saveBank}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
