export namespace backend {
	
	export class APIError {
	    code: string;
	    message: string;
	    provider: string;
	    requestId?: string;
	
	    static createFrom(source: any = {}) {
	        return new APIError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.code = source["code"];
	        this.message = source["message"];
	        this.provider = source["provider"];
	        this.requestId = source["requestId"];
	    }
	}
	export class BankItem {
	    label: Record<string, string>;
	    category: string;
	    options: any[];
	
	    static createFrom(source: any = {}) {
	        return new BankItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.category = source["category"];
	        this.options = source["options"];
	    }
	}
	export class Category {
	    id: string;
	    label: Record<string, string>;
	    color: string;
	
	    static createFrom(source: any = {}) {
	        return new Category(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.label = source["label"];
	        this.color = source["color"];
	    }
	}
	export class ConfigRequest {
	    provider: string;
	    config: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new ConfigRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.provider = source["provider"];
	        this.config = source["config"];
	    }
	}
	export class ResponseMapping {
	    successIndicator: string;
	    imagesPath: string;
	    imageUrlField: string;
	    usagePath: string;
	    widthField: string;
	    heightField: string;
	    errorCodePath: string;
	    errorMessagePath: string;
	    requestIdPath: string;
	
	    static createFrom(source: any = {}) {
	        return new ResponseMapping(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.successIndicator = source["successIndicator"];
	        this.imagesPath = source["imagesPath"];
	        this.imageUrlField = source["imageUrlField"];
	        this.usagePath = source["usagePath"];
	        this.widthField = source["widthField"];
	        this.heightField = source["heightField"];
	        this.errorCodePath = source["errorCodePath"];
	        this.errorMessagePath = source["errorMessagePath"];
	        this.requestIdPath = source["requestIdPath"];
	    }
	}
	export class ModelCapabilities {
	    supportsReferenceImage: boolean;
	    maxReferenceImages: number;
	
	    static createFrom(source: any = {}) {
	        return new ModelCapabilities(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.supportsReferenceImage = source["supportsReferenceImage"];
	        this.maxReferenceImages = source["maxReferenceImages"];
	    }
	}
	export class ProviderConfig {
	    id: string;
	    name: string;
	    apiKey: string;
	    baseUrl?: string;
	    endpoint?: string;
	    models: string[];
	    defaultModel: string;
	    sizeOptions: Record<string, Array<string>>;
	    modelCapabilities: Record<string, ModelCapabilities>;
	    requestTemplate: Record<string, any>;
	    responseMapping: ResponseMapping;
	
	    static createFrom(source: any = {}) {
	        return new ProviderConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.apiKey = source["apiKey"];
	        this.baseUrl = source["baseUrl"];
	        this.endpoint = source["endpoint"];
	        this.models = source["models"];
	        this.defaultModel = source["defaultModel"];
	        this.sizeOptions = source["sizeOptions"];
	        this.modelCapabilities = this.convertValues(source["modelCapabilities"], ModelCapabilities, true);
	        this.requestTemplate = source["requestTemplate"];
	        this.responseMapping = this.convertValues(source["responseMapping"], ResponseMapping);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConfigResponse {
	    providers: ProviderConfig[];
	    activeProvider: string;
	
	    static createFrom(source: any = {}) {
	        return new ConfigResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.providers = this.convertValues(source["providers"], ProviderConfig);
	        this.activeProvider = source["activeProvider"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GenerateRequest {
	    prompt: string;
	    provider: string;
	    model: string;
	    size: string;
	    images: string[];
	    parameters: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new GenerateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt = source["prompt"];
	        this.provider = source["provider"];
	        this.model = source["model"];
	        this.size = source["size"];
	        this.images = source["images"];
	        this.parameters = source["parameters"];
	    }
	}
	export class GeneratedImage {
	    id: string;
	    url: string;
	    width?: number;
	    height?: number;
	
	    static createFrom(source: any = {}) {
	        return new GeneratedImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	}
	export class GenerateResponse {
	    success: boolean;
	    images?: GeneratedImage[];
	    error?: APIError;
	
	    static createFrom(source: any = {}) {
	        return new GenerateResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.images = this.convertValues(source["images"], GeneratedImage);
	        this.error = this.convertValues(source["error"], APIError);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class GenerationParams {
	    prompt: string;
	    provider: string;
	    model: string;
	    size: string;
	    parameters?: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new GenerationParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt = source["prompt"];
	        this.provider = source["provider"];
	        this.model = source["model"];
	        this.size = source["size"];
	        this.parameters = source["parameters"];
	    }
	}
	export class HistoryRecord {
	    id: string;
	    params: GenerationParams;
	    images: GeneratedImage[];
	    timestamp: number;
	    metadata?: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new HistoryRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.params = this.convertValues(source["params"], GenerationParams);
	        this.images = this.convertValues(source["images"], GeneratedImage);
	        this.timestamp = source["timestamp"];
	        this.metadata = source["metadata"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class ProviderInfo {
	    id: string;
	    name: string;
	    models: string[];
	    sizeOptions: Record<string, Array<string>>;
	    modelCapabilities: Record<string, ModelCapabilities>;
	
	    static createFrom(source: any = {}) {
	        return new ProviderInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.models = source["models"];
	        this.sizeOptions = source["sizeOptions"];
	        this.modelCapabilities = this.convertValues(source["modelCapabilities"], ModelCapabilities, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProvidersResponse {
	    providers: ProviderInfo[];
	
	    static createFrom(source: any = {}) {
	        return new ProvidersResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.providers = this.convertValues(source["providers"], ProviderInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Template {
	    id: string;
	    name: Record<string, string>;
	    content: Record<string, string>;
	    imageUrl: string;
	    imageUrls?: string[];
	    author: string;
	
	    static createFrom(source: any = {}) {
	        return new Template(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.content = source["content"];
	        this.imageUrl = source["imageUrl"];
	        this.imageUrls = source["imageUrls"];
	        this.author = source["author"];
	    }
	}

}

